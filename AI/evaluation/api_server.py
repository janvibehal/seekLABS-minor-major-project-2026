from typing import Any

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

from AI.evaluation.extraction.extraction_service import (
    extract_candidate_features,
)
from AI.evaluation.llm.llm_evaluator import evaluate_with_llm
from AI.evaluation.interviewer.followup_generator import (
    generate_followup_question,
)
from AI.evaluation.scoring.classification import classify_answer
from AI.evaluation.problem_provider import (
    ProblemProvider,
    ProblemProviderError,
)


app = FastAPI(title="Interview Evaluation API")

problem_provider = ProblemProvider()


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


class EvaluationRequest(BaseModel):
    problem: dict[str, Any]
    candidate_answer: str = Field(default="")
    history: list[dict[str, Any]] = Field(
        default_factory=list
    )


def evaluate_answer(
    request: EvaluationRequest,
) -> dict[str, Any]:

    features = extract_candidate_features(
        request.candidate_answer,
        request.problem,
    )

    evaluation = evaluate_with_llm(
        candidate_features=features,
        problem=request.problem,
        candidate_state={
            "history": request.history,
        },
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
    }


@app.get("/v1/problems/search")
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
        problems, has_next_page = search_problem_catalog(
            query=query,
            difficulty=difficulty,
            limit=limit,
            skip=skip,
        )

        return {
            "success": True,
            "data": problems,
            "pagination": {
                "page": (skip // limit) + 1,
                "limit": limit,
                "skip": skip,
                "hasNextPage": has_next_page,
            },
        }

    except (
        ProblemProviderError,
        ValueError,
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


@app.get("/v1/problems/{title_slug}")
def get_problem(
    title_slug: str,
) -> dict[str, Any]:

    try:
        problem = problem_provider.get_problem(
            title_slug
        )

        supported_ids = (
            problem_provider.get_reference_supported_problem_ids()
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

    except (
        ProblemProviderError,
        ValueError,
        FileNotFoundError,
    ) as error:
        raise HTTPException(
            status_code=404,
            detail=str(error),
        ) from error


@app.get("/health")
def health() -> dict[str, bool]:
    return {
        "ok": True,
    }


@app.post("/v1/evaluate/turn")
def evaluate_turn(
    request: EvaluationRequest,
) -> dict[str, Any]:

    try:
        return {
            "success": True,
            "data": evaluate_answer(request),
        }

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error


@app.post("/v1/evaluate/opening")
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