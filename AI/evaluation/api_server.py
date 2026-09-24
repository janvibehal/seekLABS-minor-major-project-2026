from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from AI.evaluation.extraction.extraction_service import (
    extract_candidate_features,
)
from AI.evaluation.llm.llm_evaluator import evaluate_with_llm
from AI.evaluation.interviewer.followup_generator import (
    generate_followup_question,
)
from AI.evaluation.scoring.classification import classify_answer


app = FastAPI(title="Interview Evaluation API")


class EvaluationRequest(BaseModel):
    problem: dict[str, Any]
    candidate_answer: str = Field(default="")
    history: list[dict[str, Any]] = Field(default_factory=list)


def evaluate_answer(
    request: EvaluationRequest,
) -> dict[str, Any]:

    # IMPORTANT:
    # extract_candidate_features() expects:
    #
    #     extract_candidate_features(answer, problem)
    #
    # The previous API server passed the arguments in the opposite
    # order, which caused the problem dictionary to reach the
    # extractor as `answer` and produced:
    #
    #     Candidate answer must be a string.
    #
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
            "scores": evaluation.get("scores", {}),
        },
        followup_strategy={
            "adaptive_gap": classification.get(
                "primary_adaptive_gap",
                "concept coverage",
            ),
            "objective": "clarify the candidate's reasoning",
            "focus": classification.get(
                "adaptive_classifications",
                [],
            ),
            "instruction": (
                "Ask the next most useful interview question "
                "based on the evidence."
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


@app.get("/health")
def health() -> dict[str, bool]:
    return {"ok": True}


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


@app.post("/v1/evaluate/final")
def evaluate_final(
    request: EvaluationRequest,
) -> dict[str, Any]:

    try:
        # IMPORTANT:
        # extract_candidate_features() expects:
        #
        #     extract_candidate_features(answer, problem)
        #
        # Keep the same argument order as the turn endpoint.
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

        scores = evaluation.get(
            "scores",
            {},
        )

        numeric_scores = [
            value["score"]
            for value in scores.values()
            if (
                isinstance(value, dict)
                and isinstance(
                    value.get("score"),
                    (int, float),
                )
            )
        ]

        overall_score = (
            round(
                sum(numeric_scores)
                / len(numeric_scores)
            )
            if numeric_scores
            else 0
        )

        return {
            "success": True,
            "data": {
                "message": (
                    "Interview evaluation completed"
                ),
                "evaluation": evaluation,
                "classification": classification,
                "features": features,
                "overallScore": overall_score,
            },
        }

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=str(error),
        ) from error


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
    )
