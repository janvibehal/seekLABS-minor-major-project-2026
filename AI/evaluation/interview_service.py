"""
Adaptive interview logic exposed to the API.

- run_adaptive_turn: one candidate turn through InterviewSession
  (reference matching -> evaluation -> adaptive policy -> follow-up),
  with per-question state persisted between turns.
- load_question_result: read a question's cumulative result from the
  persisted state (no LLM call).
- aggregate_question_results: combine per-question results into one
  cumulative interview result.
"""

import logging
import re
from typing import Any

from AI.evaluation.configs.ai_config import MAX_TURNS_PER_QUESTION
from AI.evaluation.dataset_loader import load_reference_solution
from AI.evaluation.interviewer.interview_session import (
    InterviewSession,
)
from AI.evaluation.persistence.candidate_state_store import (
    CandidateStateStore,
)
from AI.evaluation.scoring.dimensions import EVALUATION_DIMENSIONS
from AI.evaluation.scoring.final_result import build_final_result

logger = logging.getLogger(__name__)

# Identifiers become part of state file names, so only a safe
# character set is accepted (no path separators or dots).
SAFE_ID_PATTERN = r"^[A-Za-z0-9_-]{1,100}$"

_SAFE_ID = re.compile(SAFE_ID_PATTERN)

state_store = CandidateStateStore()


class AdaptiveEvaluationError(RuntimeError):
    """An adaptive turn failed; no trustworthy result exists."""


def validate_id(value: str, name: str) -> str:
    if not isinstance(value, str) or not _SAFE_ID.match(value):
        raise ValueError(
            f"{name} must match {SAFE_ID_PATTERN}"
        )

    return value


def has_references(problem: dict[str, Any]) -> bool:
    """True when the reference dataset covers this problem."""

    try:
        return bool(load_reference_solution(problem))

    except (FileNotFoundError, ValueError, TypeError):
        return False


def _state_question_id(session_id: str, question_id: str) -> str:
    # One persisted state per (interview session, question).
    return f"{session_id}_{question_id}"


def _classification_from_result(result: dict[str, Any]) -> dict:
    return {
        "primary_classification": result.get(
            "primary_classification"
        ),
        "secondary_classification": result.get(
            "secondary_classification"
        ),
        "adaptive_classifications": result.get(
            "adaptive_classifications", []
        ),
        "primary_adaptive_gap": result.get(
            "primary_adaptive_gap"
        ),
    }


def run_adaptive_turn(
    *,
    candidate_id: str,
    session_id: str,
    question_id: str,
    problem: dict[str, Any],
    candidate_answer: str,
    time_remaining_seconds: int | None = None,
    max_turns: int | None = None,
) -> dict[str, Any]:
    """
    Process one candidate answer through the adaptive session.

    `message` is the next interviewer question, or None when the
    session decided this question is finished.
    """

    validate_id(candidate_id, "candidate_id")
    validate_id(session_id, "session_id")
    validate_id(question_id, "question_id")

    session_kwargs: dict[str, Any] = {
        "candidate_id": candidate_id,
        "question_id": _state_question_id(session_id, question_id),
        "problem": problem,
        "state_store": state_store,
        "resume_existing": True,
        "max_turns": max_turns or MAX_TURNS_PER_QUESTION,
    }

    if time_remaining_seconds is not None:
        session_kwargs["time_remaining"] = time_remaining_seconds

    session = InterviewSession(**session_kwargs)

    # A question that already finished must not be re-evaluated.
    if not session.is_finished():

        try:
            session.submit_answer(candidate_answer)

        except Exception as error:
            logger.exception("Adaptive turn failed")

            raise AdaptiveEvaluationError(
                f"Adaptive evaluation failed: {error}"
            ) from error

    state = session.get_state()
    result = build_final_result(state)

    return {
        "message": session.get_next_question(),
        "evaluation": {
            "scores": result["scores"],
            "errors": [],
        },
        "classification": _classification_from_result(result),
        "features": state.nlp_state.to_dict(),
        "adaptive": {
            "enabled": True,
            "finished": session.is_finished(),
            "turn": result.get("history_length", 0),
            "matched_reference_id": state.reference_answer_id,
            "target_reference_id": state.target_reference_id,
            "match_confidence": state.reference_match_confidence,
            "average_score": result.get("average_score"),
        },
    }


def average_assessed(scores: dict[str, Any]) -> float | None:
    """Mean of the numeric dimension scores (None if none assessed)."""

    values = []

    for dimension in EVALUATION_DIMENSIONS:
        entry = scores.get(dimension)

        value = (
            entry.get("score")
            if isinstance(entry, dict)
            else entry
        )

        if (
            isinstance(value, (int, float))
            and not isinstance(value, bool)
        ):
            values.append(float(value))

    if not values:
        return None

    return sum(values) / len(values)


def question_result(
    question_id: str,
    source: str,
    scores: dict[str, Any],
    classification: dict[str, Any] | None,
    turns: int | None = None,
) -> dict[str, Any]:
    average = average_assessed(scores)

    return {
        "question_id": question_id,
        "source": source,
        "answered": True,
        "overallScore": (
            None if average is None else round(average)
        ),
        "scores": scores,
        "classification": classification or {},
        "turns": turns,
    }


def unanswered_result(question_id: str) -> dict[str, Any]:
    return {
        "question_id": question_id,
        "source": None,
        "answered": False,
        "overallScore": None,
        "scores": {},
        "classification": {},
        "turns": 0,
    }


def load_question_result(
    candidate_id: str,
    session_id: str,
    question_id: str,
) -> dict[str, Any] | None:
    """
    Cumulative result of a question from its persisted adaptive
    state, or None when no adaptive turn was recorded for it.
    No LLM call is made.
    """

    validate_id(candidate_id, "candidate_id")
    validate_id(session_id, "session_id")
    validate_id(question_id, "question_id")

    state_id = _state_question_id(session_id, question_id)

    if not state_store.exists(candidate_id, state_id):
        return None

    state = state_store.load(candidate_id, state_id)

    if not state.history:
        return None

    result = build_final_result(state)

    return question_result(
        question_id=question_id,
        source="adaptive",
        scores=result["scores"],
        classification=_classification_from_result(result),
        turns=result.get("history_length"),
    )


def aggregate_question_results(
    results: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Combine per-question results into one interview result.

    - Dimension score: mean over the answered questions in which that
      dimension was assessed.
    - Overall score: mean of the per-question overall scores.
    - Unanswered questions are reported but excluded from the means.
    """

    answered = [r for r in results if r["answered"]]

    dimension_scores: dict[str, Any] = {}

    for dimension in EVALUATION_DIMENSIONS:
        values = []

        for result in answered:
            entry = result["scores"].get(dimension)

            value = (
                entry.get("score")
                if isinstance(entry, dict)
                else entry
            )

            if (
                isinstance(value, (int, float))
                and not isinstance(value, bool)
            ):
                values.append(float(value))

        if values:
            dimension_scores[dimension] = {
                "score": round(sum(values) / len(values), 2),
                "assessment_status": "ASSESSED",
                "questions_assessed": len(values),
            }
        else:
            dimension_scores[dimension] = {
                "score": None,
                "assessment_status": "NOT_ASSESSED",
                "questions_assessed": 0,
            }

    overall_values = [
        r["overallScore"]
        for r in answered
        if r["overallScore"] is not None
    ]

    overall = (
        round(sum(overall_values) / len(overall_values))
        if overall_values
        else 0
    )

    return {
        "overallScore": overall,
        "scores": dimension_scores,
        "answered": len(answered),
        "total": len(results),
    }
