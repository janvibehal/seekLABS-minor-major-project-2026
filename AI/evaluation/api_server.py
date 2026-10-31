import hmac
import logging
from typing import Any

from fastapi import Depends, FastAPI, Header, HTTPException, Query
from pydantic import BaseModel, Field

from AI.evaluation import interview_service
from AI.evaluation.configs.ai_config import API_ACCESS_KEY
from AI.evaluation.dataset_loader import load_evaluation_context
from AI.evaluation.interview_service import (
    SAFE_ID_PATTERN,
    AdaptiveEvaluationError,
)
from AI.evaluation.extraction.extraction_service import (
    extract_candidate_features,
)
from AI.evaluation.llm.llm_evaluator import evaluate_with_llm
from AI.evaluation.interviewer.followup_generator import (
    generate_followup_question,
)
from AI.evaluation.scoring.classification import classify_answer
from AI.evaluation.problem_provider import (
    LeetCodeAPIError,
    ProblemProvider,
    ProblemProviderError,
)
from AI.evaluation.scoring.dimensions import EVALUATION_DIMENSIONS

logger = logging.getLogger(__name__)


# ============================================================
# AUTHENTICATION (opt-in)
# ============================================================

def require_api_key(
    x_api_key: str | None = Header(default=None),
) -> None:
    """
    Enforce the X-API-Key header only when INTERVIEW_AI_API_KEY is
    configured. With no key configured the API stays open, as before.
    """

    if not API_ACCESS_KEY:
        return

    if not hmac.compare_digest(
        x_api_key or "",
        API_ACCESS_KEY,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing API key.",
        )


# Upper bounds on request size (prompt size and cost control).
MAX_CANDIDATE_ANSWER_CHARS = 20000
MAX_HISTORY_TURNS = 200

app = FastAPI(title="Interview Evaluation API")

problem_provider = ProblemProvider()


# ============================================================
# PROBLEM SEARCH
# ============================================================

def search_problem_catalog(
    query: str = "",
    difficulty: str | None = None,
    limit: int = 5,
    skip: int = 0,
) -> tuple[list[dict[str, Any]], bool]:
    """
    Search the complete free LeetCode catalog.

    Filtering is performed by the ProblemProvider before pagination,
    so each page contains up to exactly `limit` matching questions.
    """

    normalized_query = query.strip()

    normalized_difficulty = (
        difficulty.strip().upper()
        if difficulty
        else None
    )

    if normalized_difficulty not in {
        None,
        "EASY",
        "MEDIUM",
        "HARD",
    }:
        raise ValueError(
            "difficulty must be one of: EASY, MEDIUM, HARD"
        )

    if skip < 0:
        raise ValueError(
            "skip must be greater than or equal to 0"
        )

    if limit < 1:
        raise ValueError(
            "limit must be greater than 0"
        )

    supported_ids = (
        problem_provider.get_reference_supported_problem_ids()
    )

    # Ask the provider for one extra result so we can determine
    # whether another page exists while returning exactly `limit`
    # questions to the frontend.
    provider_limit = limit + 1

    problems = problem_provider.list_problems(
        limit=provider_limit,
        skip=skip,
        difficulty=normalized_difficulty,
        paid_only=False,
        search_keyword=normalized_query,
        category_slug="all-code-essentials",
    )

    has_next_page = len(problems) > limit

    visible_problems = problems[:limit]

    for problem in visible_problems:
        problem["reference_supported"] = (
            str(
                problem.get(
                    "problem_id",
                    "",
                )
            )
            .strip()
            .upper()
            in supported_ids
        )

    return visible_problems, has_next_page


# ============================================================
# EVALUATION REQUEST
# ============================================================

class InterviewQuestionInput(BaseModel):
    """One question of an interview, for the cumulative final result."""

    question_id: str = Field(pattern=SAFE_ID_PATTERN)

    problem: dict[str, Any]

    # Used only when the question has no adaptive state (stateless
    # fallback): the candidate's combined answer for this question.
    candidate_answer: str = Field(
        default="",
        max_length=MAX_CANDIDATE_ANSWER_CHARS,
    )

    history: list[dict[str, Any]] = Field(
        default_factory=list,
        max_length=MAX_HISTORY_TURNS,
    )


class EvaluationRequest(BaseModel):
    problem: dict[str, Any] = Field(default_factory=dict)

    # Optional identifiers. When all three are present (and the
    # problem has reference solutions) /turn runs the adaptive
    # session; state is kept per (session_id, question_id).
    candidate_id: str | None = Field(
        default=None,
        pattern=SAFE_ID_PATTERN,
    )

    session_id: str | None = Field(
        default=None,
        pattern=SAFE_ID_PATTERN,
    )

    question_id: str | None = Field(
        default=None,
        pattern=SAFE_ID_PATTERN,
    )

    # Seconds left for the candidate; the backend knows the clock.
    time_remaining_seconds: int | None = Field(
        default=None,
        ge=1,
    )

    # Candidate-turn cap for this question.
    max_turns: int | None = Field(
        default=None,
        ge=1,
        le=50,
    )

    # /final only: every question of the interview. When present,
    # the result is the cumulative result of these questions.
    questions: list[InterviewQuestionInput] | None = Field(
        default=None,
        max_length=50,
    )

    candidate_answer: str = Field(
        default="",
        max_length=MAX_CANDIDATE_ANSWER_CHARS,
    )

    history: list[dict[str, Any]] = Field(
        default_factory=list,
        max_length=MAX_HISTORY_TURNS,
    )


class EvaluationUnavailableError(RuntimeError):
    """The LLM evaluation failed; no trustworthy result exists."""


def run_llm_evaluation(
    features: dict[str, Any],
    problem: dict[str, Any],
    history: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Stateless evaluation (used when there is no adaptive session).

    Passes the problem's reference solutions to the evaluator when the
    dataset has them, and refuses to return a failed evaluation as if
    it were a real (all NOT_ASSESSED) result.
    """

    reference_solutions = None

    try:
        reference_solutions, _ = load_evaluation_context(
            problem
        )

    except (FileNotFoundError, ValueError) as error:
        # The problem has no references in the dataset
        # (see the `reference_supported` flag on problems).
        logger.warning(
            "Evaluating without reference data: %s",
            error,
        )

    evaluation = evaluate_with_llm(
        candidate_features=features,
        problem=problem,
        reference_solution=reference_solutions,
        rubric=None,
        candidate_state={
            "history": history,
        },
    )

    if evaluation.get("evaluation_failed"):
        raise EvaluationUnavailableError(
            "LLM evaluation failed: "
            + "; ".join(evaluation.get("errors", []))
        )

    return evaluation


# ============================================================
# TURN EVALUATION
# ============================================================

def evaluate_answer(
    request: EvaluationRequest,
) -> dict[str, Any]:

    # --------------------------------------------------------
    # Adaptive path: identifiers present and references exist
    # --------------------------------------------------------

    if (
        request.candidate_id
        and request.session_id
        and request.question_id
        and interview_service.has_references(request.problem)
    ):

        if not request.candidate_answer.strip():
            raise HTTPException(
                status_code=400,
                detail="candidate_answer cannot be empty.",
            )

        return interview_service.run_adaptive_turn(
            candidate_id=request.candidate_id,
            session_id=request.session_id,
            question_id=request.question_id,
            problem=request.problem,
            candidate_answer=request.candidate_answer,
            time_remaining_seconds=request.time_remaining_seconds,
            max_turns=request.max_turns,
        )

    # --------------------------------------------------------
    # Stateless fallback (no identifiers or no references)
    # --------------------------------------------------------

    if not request.problem:
        raise HTTPException(
            status_code=422,
            detail="problem is required.",
        )

    features = extract_candidate_features(
        request.candidate_answer,
        request.problem,
    )

    evaluation = run_llm_evaluation(
        features,
        request.problem,
        request.history,
    )

    classification = classify_answer(
        features,
        evaluation,
    )

    follow_up = generate_followup_question(
        problem=request.problem,
        candidate_answer=request.candidate_answer,
        candidate_state={
            "history": request.history,
            "nlp_state": features,
            "scores": evaluation.get(
                "scores",
                {},
            ),
        },
        followup_strategy={
            "adaptive_gap": classification.get(
                "primary_adaptive_gap",
                "concept coverage",
            ),
            "objective": (
                "clarify the candidate's reasoning"
            ),
            "focus": classification.get(
                "adaptive_classifications",
                [],
            ),
            "instruction": (
                "Ask the next most useful interview "
                "question based on the evidence."
            ),
        },
    )

    if not follow_up or not follow_up.strip():
        raise RuntimeError(
            "The evaluation layer did not produce "
            "a follow-up question"
        )

    return {
        "message": follow_up.strip(),
        "evaluation": evaluation,
        "classification": classification,
        "features": features,
        "adaptive": {
            "enabled": False,
            "finished": False,
        },
    }


# ============================================================
# CUMULATIVE INTERVIEW EVALUATION
# ============================================================

def evaluate_question_stateless(
    question: InterviewQuestionInput,
) -> dict[str, Any]:
    """Evaluate one question from its combined answer text."""

    features = extract_candidate_features(
        question.candidate_answer.strip(),
        question.problem,
    )

    evaluation = run_llm_evaluation(
        features,
        question.problem,
        question.history,
    )

    classification = classify_answer(
        features,
        evaluation,
    )

    return interview_service.question_result(
        question_id=question.question_id,
        source="stateless",
        scores=evaluation.get("scores", {}),
        classification=classification,
    )


def build_interview_evaluation(
    request: EvaluationRequest,
) -> dict[str, Any]:
    """
    One result for the whole interview: the cumulative result of the
    per-question results (adaptive state when it exists, otherwise a
    stateless evaluation of the question's answer).
    """

    results = []

    for question in request.questions or []:

        result = None

        if request.candidate_id and request.session_id:
            result = interview_service.load_question_result(
                request.candidate_id,
                request.session_id,
                question.question_id,
            )

        if result is None and question.candidate_answer.strip():
            result = evaluate_question_stateless(question)

        if result is None:
            result = interview_service.unanswered_result(
                question.question_id
            )

        results.append(result)

    aggregate = interview_service.aggregate_question_results(
        results
    )

    if aggregate["answered"]:
        reasoning = (
            f"Evaluated {aggregate['answered']} of "
            f"{aggregate['total']} questions; the overall score is "
            "the average of the per-question scores."
        )
    else:
        reasoning = "No candidate response was submitted."

    return {
        "overallScore": aggregate["overallScore"],

        "evaluation": {
            "scores": aggregate["scores"],
            "errors": [],
            "reasoning": reasoning,
        },

        "questions": results,

        "coverage": {
            "answered": aggregate["answered"],
            "total": aggregate["total"],
        },

        "features": {},
    }


# ============================================================
# FINAL EVALUATION
# ============================================================

# EVALUATION_DIMENSIONS is imported from
# AI.evaluation.scoring.dimensions (single source of truth).


def build_final_evaluation(
    request: EvaluationRequest,
) -> dict[str, Any]:
    """
    Evaluate the candidate's final interview response.

    Unlike the turn endpoint, this endpoint does NOT generate
    another follow-up question.

    It only produces the structured evaluation needed by the
    backend to persist the final interview result.
    """

    if request.questions is not None:
        return build_interview_evaluation(request)

    if not request.problem:
        raise HTTPException(
            status_code=422,
            detail="problem is required.",
        )

    candidate_answer = (
        request.candidate_answer.strip()
    )

    # --------------------------------------------------------
    # No candidate answer
    # --------------------------------------------------------

    if not candidate_answer:

        empty_scores = {
            dimension: {
                "score": 0,
                "assessment_status": "NOT_ASSESSED",
                "evidence": (
                    "No candidate response was provided."
                ),
            }
            for dimension in EVALUATION_DIMENSIONS
        }

        return {
            "overallScore": 0,

            "evaluation": {
                "scores": empty_scores,

                "errors": [],

                "reasoning": (
                    "No candidate response was submitted."
                ),
            },

            "features": {},
        }

    # --------------------------------------------------------
    # Extract candidate features
    # --------------------------------------------------------

    features = extract_candidate_features(
        candidate_answer,
        request.problem,
    )

    # --------------------------------------------------------
    # Run final LLM evaluation
    # --------------------------------------------------------

    evaluation = run_llm_evaluation(
        features,
        request.problem,
        request.history,
    )

    # --------------------------------------------------------
    # Calculate overall score
    #
    # Only numeric / assessed dimensions are included.
    # --------------------------------------------------------

    scores = evaluation.get(
        "scores",
        {},
    )

    numeric_scores: list[float] = []

    for dimension in EVALUATION_DIMENSIONS:

        dimension_data = scores.get(
            dimension,
            {},
        )

        if not isinstance(
            dimension_data,
            dict,
        ):
            continue

        value = dimension_data.get(
            "score"
        )

        if (
            isinstance(
                value,
                (int, float),
            )
            and not isinstance(
                value,
                bool,
            )
        ):
            numeric_scores.append(
                float(value)
            )

    if numeric_scores:

        overall_score = round(
            sum(numeric_scores)
            / len(numeric_scores)
        )

    else:

        overall_score = 0

    return {
        "overallScore": overall_score,

        "evaluation": evaluation,

        "features": features,
    }


# ============================================================
# SEARCH PROBLEMS
# ============================================================

@app.get(
    "/v1/problems/search",
    dependencies=[Depends(require_api_key)],
)
def search_problems(
    query: str = Query(
        default="",
        max_length=120,
    ),

    difficulty: str | None = Query(
        default=None,
    ),

    limit: int = Query(
        default=5,
        ge=1,
        le=100,
    ),

    skip: int = Query(
        default=0,
        ge=0,
    ),
) -> dict[str, Any]:

    try:

        problems, has_next_page = (
            search_problem_catalog(
                query=query,
                difficulty=difficulty,
                limit=limit,
                skip=skip,
            )
        )

        return {
            "success": True,

            "data": problems,

            "pagination": {
                "page": (
                    skip // limit
                ) + 1,

                "limit": limit,

                "skip": skip,

                "hasNextPage": (
                    has_next_page
                ),
            },
        }

    except ValueError as error:

        # Invalid client input (difficulty / skip / limit).
        raise HTTPException(
            status_code=400,
            detail=str(error),
        ) from error

    except (
        ProblemProviderError,
        FileNotFoundError,
    ) as error:

        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error

    except Exception as error:

        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error


# ============================================================
# GET PROBLEM
# ============================================================

@app.get(
    "/v1/problems/{title_slug}",
    dependencies=[Depends(require_api_key)],
)
def get_problem(
    title_slug: str,
) -> dict[str, Any]:

    try:

        problem = (
            problem_provider.get_problem(
                title_slug
            )
        )

        supported_ids = (
            problem_provider
            .get_reference_supported_problem_ids()
        )

        problem["reference_supported"] = (
            str(
                problem.get(
                    "problem_id",
                    "",
                )
            )
            .strip()
            .upper()
            in supported_ids
        )

        return {
            "success": True,
            "data": problem,
        }

    except LeetCodeAPIError as error:

        # Upstream failure, not a missing problem.
        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error

    except (
        ProblemProviderError,
        ValueError,
        FileNotFoundError,
    ) as error:

        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health() -> dict[str, bool]:

    return {
        "ok": True,
    }


# ============================================================
# TURN EVALUATION
# ============================================================

@app.post(
    "/v1/evaluate/turn",
    dependencies=[Depends(require_api_key)],
)
def evaluate_turn(
    request: EvaluationRequest,
) -> dict[str, Any]:

    try:

        return {
            "success": True,

            "data": evaluate_answer(
                request
            ),
        }

    except (
        EvaluationUnavailableError,
        AdaptiveEvaluationError,
    ) as error:

        raise HTTPException(
            status_code=503,
            detail=str(error),
        ) from error

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error


# ============================================================
# OPENING MESSAGE
# ============================================================

@app.post(
    "/v1/evaluate/opening",
    dependencies=[Depends(require_api_key)],
)
def evaluate_opening(
    request: EvaluationRequest,
) -> dict[str, Any]:

    try:

        message = (
            "Hello! Please begin by explaining "
            "how you would approach this problem."
        )

        return {
            "success": True,

            "data": {
                "message": message,
            },
        }

    except Exception as error:

        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error


# ============================================================
# FINAL EVALUATION ENDPOINT
# ============================================================

@app.post(
    "/v1/evaluate/final",
    dependencies=[Depends(require_api_key)],
)
def evaluate_final(
    request: EvaluationRequest,
) -> dict[str, Any]:

    try:

        return {
            "success": True,

            "data": build_final_evaluation(
                request
            ),
        }

    except (
        EvaluationUnavailableError,
        AdaptiveEvaluationError,
    ) as error:

        raise HTTPException(
            status_code=503,
            detail=str(error),
        ) from error

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error