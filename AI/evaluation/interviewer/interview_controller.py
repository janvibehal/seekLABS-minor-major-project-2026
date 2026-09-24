from typing import Optional


# ==========================================================
# Configuration
# ==========================================================

DEFAULT_MAX_FOLLOWUPS = 5


# ==========================================================
# Required dimensions
# ==========================================================

REQUIRED_DIMENSIONS = [
    "algorithm_correctness",
    "logical_reasoning",
    "concept_coverage",
    "completeness",
    "data_structure",
    "complexity",
    "edge_cases"
]


# ==========================================================
# Check whether a dimension has been assessed
# ==========================================================

def is_assessed(
    llm_evaluation: dict,
    dimension_name: str
) -> bool:

    scores = llm_evaluation.get(
        "scores",
        {}
    )

    dimension = scores.get(
        dimension_name,
        {}
    )

    if not isinstance(
        dimension,
        dict
    ):
        return False

    status = dimension.get(
        "assessment_status"
    )

    score = dimension.get(
        "score"
    )

    return (
        status == "ASSESSED"
        and score is not None
    )


# ==========================================================
# Check whether all dimensions are assessed
# ==========================================================

def all_dimensions_assessed(
    llm_evaluation: dict
) -> bool:

    for dimension_name in REQUIRED_DIMENSIONS:

        if not is_assessed(
            llm_evaluation,
            dimension_name
        ):
            return False

    return True


# ==========================================================
# Check whether a real adaptive gap exists
# ==========================================================

def has_adaptive_gap(
    adaptive_classifications: list
) -> bool:

    if not adaptive_classifications:
        return False

    return True


# ==========================================================
# Count previous follow-ups
# ==========================================================

def count_followups(
    state
) -> int:

    history = getattr(
        state,
        "history",
        []
    )

    if not isinstance(
        history,
        list
    ):
        return 0

    count = 0

    for entry in history:

        if not isinstance(
            entry,
            dict
        ):
            continue

        question = entry.get(
            "current_interviewer_question"
        )

        if question:
            count += 1

    return count


# ==========================================================
# Main Continue / Stop Decision
# ==========================================================

def should_continue_interview(
    state,
    llm_evaluation: dict,
    adaptive_classifications: Optional[list] = None,
    adaptive_probe: Optional[str] = None,
    max_followups: int = DEFAULT_MAX_FOLLOWUPS
) -> bool:
    """
    Decide whether the adaptive interview should continue.

    Returns:

        True
            → Continue interview

        False
            → Stop interview and produce final evaluation
    """

    if adaptive_classifications is None:
        adaptive_classifications = []

    # ======================================================
    # 1. Maximum follow-up safety limit
    # ======================================================

    followup_count = count_followups(
        state
    )

    if followup_count >= max_followups:
        return False

    # ======================================================
    # 2. A demonstrated adaptive gap
    # ======================================================
    #
    # Example:
    #
    # Complexity Gap
    # Edge-Case Gap
    #
    # Candidate demonstrated weakness.
    # Therefore we should continue.
    # ======================================================

    if has_adaptive_gap(
        adaptive_classifications
    ):
        return True

    # ======================================================
    # 3. An unassessed dimension exists
    # ======================================================
    #
    # NOT_ASSESSED is not a weakness.
    #
    # But it means we still need evidence.
    # ======================================================

    if adaptive_probe:
        return True

    # ======================================================
    # 4. If not all dimensions are assessed,
    #    continue the interview.
    # ======================================================

    if not all_dimensions_assessed(
        llm_evaluation
    ):
        return True

    # ======================================================
    # 5. Everything important is assessed
    #    and no gap remains.
    #
    #    Stop the interview.
    # ======================================================

    return False