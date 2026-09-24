from typing import Any, Dict, Optional


# ==========================================================
# Seven Evaluation Dimensions
# ==========================================================

DIMENSIONS = [
    "algorithm_correctness",
    "logical_reasoning",
    "concept_coverage",
    "completeness",
    "data_structure",
    "complexity",
    "edge_cases"
]


# ==========================================================
# Safely get a score
# ==========================================================

def get_score(
    scores: dict,
    dimension: str
) -> Optional[float]:

    value = scores.get(
        dimension
    )

    if value is None:
        return None

    try:
        return float(value)

    except (
        TypeError,
        ValueError
    ):
        return None


# ==========================================================
# Calculate average score
# ==========================================================

def calculate_average_score(
    scores: dict
) -> Optional[float]:

    assessed_scores = []

    for dimension in DIMENSIONS:

        score = get_score(
            scores,
            dimension
        )

        if score is not None:

            assessed_scores.append(
                score
            )

    if not assessed_scores:
        return None

    return round(
        sum(assessed_scores)
        / len(assessed_scores),
        2
    )


# ==========================================================
# Count assessed dimensions
# ==========================================================

def count_assessed_dimensions(
    scores: dict
) -> int:

    count = 0

    for dimension in DIMENSIONS:

        if (
            get_score(
                scores,
                dimension
            )
            is not None
        ):
            count += 1

    return count


# ==========================================================
# Build dimension result
# ==========================================================

def build_dimension_results(
    scores: dict,
    evidence: dict
) -> Dict[str, dict]:

    results = {}

    for dimension in DIMENSIONS:

        score = get_score(
            scores,
            dimension
        )

        results[dimension] = {
            "score": score,

            "assessment_status": (
                "ASSESSED"
                if score is not None
                else "NOT_ASSESSED"
            ),

            "evidence": (
                evidence.get(
                    dimension
                )
                if isinstance(
                    evidence,
                    dict
                )
                else None
            )
        }

    return results


# ==========================================================
# Build final interview result
# ==========================================================

def build_final_result(
    state
) -> dict:
    """
    Convert a completed CandidateEvaluationState
    into a clean final interview result.

    This function does NOT call Ollama.

    It only aggregates the state that has already
    been produced by the adaptive evaluation pipeline.
    """

    # ======================================================
    # Basic candidate information
    # ======================================================

    candidate_id = getattr(
        state,
        "candidate_id",
        None
    )

    question_id = getattr(
        state,
        "question_id",
        None
    )

    turn_number = getattr(
        state,
        "turn_number",
        0
    )

    # ======================================================
    # Scores
    # ======================================================

    scores = getattr(
        state,
        "scores",
        {}
    )

    if not isinstance(
        scores,
        dict
    ):
        scores = {}

    # ======================================================
    # Evidence
    # ======================================================

    evidence = getattr(
        state,
        "evidence",
        {}
    )

    if not isinstance(
        evidence,
        dict
    ):
        evidence = {}

    # ======================================================
    # Build seven dimension results
    # ======================================================

    dimension_results = (
        build_dimension_results(
            scores=scores,
            evidence=evidence
        )
    )

    # ======================================================
    # Average score
    # ======================================================

    average_score = (
        calculate_average_score(
            scores
        )
    )

    # ======================================================
    # Assessment count
    # ======================================================

    assessed_dimensions = (
        count_assessed_dimensions(
            scores
        )
    )

    total_dimensions = len(
        DIMENSIONS
    )

    # ======================================================
    # Classifications
    # ======================================================

    primary_classification = getattr(
        state,
        "primary_classification",
        None
    )

    secondary_classification = getattr(
        state,
        "secondary_classification",
        None
    )

    adaptive_classifications = getattr(
        state,
        "adaptive_classifications",
        []
    )

    if not isinstance(
        adaptive_classifications,
        list
    ):
        adaptive_classifications = []

    primary_adaptive_gap = getattr(
        state,
        "primary_adaptive_gap",
        None
    )

    # ======================================================
    # History
    # ======================================================

    history = getattr(
        state,
        "history",
        []
    )

    if not isinstance(
        history,
        list
    ):
        history = []

    # ======================================================
    # Interview status
    # ======================================================

    should_continue = getattr(
        state,
        "should_continue",
        False
    )

    if should_continue:
        status = "IN_PROGRESS"
    else:
        status = "COMPLETED"

    # ======================================================
    # Final result
    # ======================================================

    return {

        # ----------------------------------------------
        # Candidate information
        # ----------------------------------------------

        "candidate_id": candidate_id,

        "question_id": question_id,

        # ----------------------------------------------
        # Interview status
        # ----------------------------------------------

        "status": status,

        "turn_number": turn_number,

        "history_length": len(
            history
        ),

        # ----------------------------------------------
        # Dimension assessment
        # ----------------------------------------------

        "scores": dimension_results,

        "assessed_dimensions": (
            assessed_dimensions
        ),

        "total_dimensions": (
            total_dimensions
        ),

        # ----------------------------------------------
        # Overall score
        # ----------------------------------------------

        "average_score": average_score,

        # ----------------------------------------------
        # Classification
        # ----------------------------------------------

        "primary_classification": (
            primary_classification
        ),

        "secondary_classification": (
            secondary_classification
        ),

        # ----------------------------------------------
        # Adaptive evaluation
        # ----------------------------------------------

        "adaptive_classifications": (
            adaptive_classifications
        ),

        "primary_adaptive_gap": (
            primary_adaptive_gap
        ),

        # ----------------------------------------------
        # Complete history
        # ----------------------------------------------

        "history": history
    }