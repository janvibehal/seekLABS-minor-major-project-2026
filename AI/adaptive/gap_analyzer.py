from typing import Any, Optional


# --------------------------------------------------
# Mapping between evaluation dimension names and
# conversation/question-generation dimension names.
# --------------------------------------------------

DIMENSION_MAPPING = {
    "data_structure_usage": "data_structure"
}


# --------------------------------------------------
# Mapping between adaptive gap names and evaluation
# dimensions.
# --------------------------------------------------

GAP_TO_DIMENSION = {
    "Complexity Gap": "complexity",
    "Edge-Case Gap": "edge_cases",
    "Concept Gap": "concept_coverage",
    "Data-Structure Gap": "data_structure",
    "Reasoning Gap": "logical_reasoning",
    "Completeness Gap": "completeness"
}


DIMENSION_TO_GAP = {
    "complexity": "Complexity Gap",
    "edge_cases": "Edge-Case Gap",
    "concept_coverage": "Concept Gap",
    "data_structure": "Data-Structure Gap",
    "logical_reasoning": "Reasoning Gap",
    "completeness": "Completeness Gap"
}


# --------------------------------------------------
# Tie-break order.
#
# Lower number = higher priority when scores
# are equal.
# --------------------------------------------------

PRIORITY_ORDER = {
    "Reasoning Gap": 1,
    "Concept Gap": 2,
    "Data-Structure Gap": 3,
    "Complexity Gap": 4,
    "Edge-Case Gap": 5,
    "Completeness Gap": 6
}


def _normalize_scores(
    scores: dict
) -> dict:
    """
    Normalize evaluation dimension names so they are
    compatible with the adaptive/question-generation
    system.
    """

    normalized_scores = {}

    for dimension, value in scores.items():

        normalized_dimension = DIMENSION_MAPPING.get(
            dimension,
            dimension
        )

        normalized_scores[
            normalized_dimension
        ] = value

    return normalized_scores


def _get_dimension_score(
    dimension_data: Any
) -> Optional[float]:
    """
    Extract a numeric score.

    Supports both formats:

    1. Flat format:
       "complexity": 60

    2. Structured format:
       "complexity": {
           "score": 60,
           "assessment_status": "ASSESSED"
       }
    """

    if dimension_data is None:
        return None

    if isinstance(dimension_data, dict):

        score = dimension_data.get(
            "score"
        )

    else:
        score = dimension_data

    try:
        return float(score)
    except (TypeError, ValueError):
        return None


def analyze_gaps(
    scores: dict
) -> dict[str, Any]:
    """
    Analyze evaluation scores and identify the weakest
    assessed areas.

    Lower scores represent higher-priority gaps.

    NOT_ASSESSED or None dimensions are ignored.

    Returns:
        {
            "primary_gap": str | None,
            "secondary_gap": str | None,
            "prioritized_gaps": list[str]
        }
    """

    if not scores:
        return {
            "primary_gap": None,
            "secondary_gap": None,
            "prioritized_gaps": []
        }

    normalized_scores = _normalize_scores(
        scores
    )

    assessed_scores = {}

    for dimension, value in normalized_scores.items():

        score = _get_dimension_score(
            value
        )

        if score is not None:
            assessed_scores[
                dimension
            ] = score

    prioritized_gaps = sorted(
        assessed_scores,
        key=lambda dimension: assessed_scores[
            dimension
        ]
    )

    primary_gap = (
        prioritized_gaps[0]
        if len(prioritized_gaps) > 0
        else None
    )

    secondary_gap = (
        prioritized_gaps[1]
        if len(prioritized_gaps) > 1
        else None
    )

    return {
        "primary_gap": primary_gap,
        "secondary_gap": secondary_gap,
        "prioritized_gaps": prioritized_gaps
    }


def get_adaptive_priority(
    llm_evaluation: dict,
    adaptive_classifications: list
) -> Optional[str]:
    """
    Select the highest-priority adaptive gap.

    Priority is determined by the lowest assessed score.

    If multiple gaps have the same score, a deterministic
    tie-break order is used.

    Returns:
        The primary adaptive gap, or None if no valid
        adaptive gap exists.
    """

    if not adaptive_classifications:
        return None

    scores = llm_evaluation.get(
        "scores",
        {}
    )

    normalized_scores = _normalize_scores(
        scores
    )

    candidates = []

    for gap in adaptive_classifications:

        dimension_name = GAP_TO_DIMENSION.get(
            gap
        )

        if dimension_name is None:
            continue

        dimension_data = normalized_scores.get(
            dimension_name
        )

        score = _get_dimension_score(
            dimension_data
        )

        if score is None:
            continue

        candidates.append(
            (
                score,
                PRIORITY_ORDER.get(
                    gap,
                    999
                ),
                gap
            )
        )

    if not candidates:
        return None

    candidates.sort(
        key=lambda item: (
            item[0],
            item[1]
        )
    )

    return candidates[0][2]


def get_unassessed_dimensions(
    llm_evaluation: dict
) -> list[str]:
    """
    Return dimensions whose assessment status is
    explicitly NOT_ASSESSED.
    """

    scores = llm_evaluation.get(
        "scores",
        {}
    )

    normalized_scores = _normalize_scores(
        scores
    )

    unassessed = []

    for dimension_name in DIMENSION_TO_GAP:

        dimension = normalized_scores.get(
            dimension_name
        )

        if not isinstance(
            dimension,
            dict
        ):
            continue

        status = dimension.get(
            "assessment_status"
        )

        if status == "NOT_ASSESSED":

            unassessed.append(
                dimension_name
            )

    return unassessed


def get_unassessed_probe(
    llm_evaluation: dict,
    already_probed: list
) -> Optional[str]:
    """
    Select an unassessed dimension that has not
    already been probed.

    Returns the corresponding adaptive gap.
    """

    unassessed_dimensions = (
        get_unassessed_dimensions(
            llm_evaluation
        )
    )

    for dimension_name in unassessed_dimensions:

        gap = DIMENSION_TO_GAP.get(
            dimension_name
        )

        if gap is None:
            continue

        if gap in already_probed:
            continue

        return gap

    return None