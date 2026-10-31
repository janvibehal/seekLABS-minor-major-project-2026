
from typing import Any, Optional


# ============================================================
# DIMENSION MAPPING
# ============================================================

# Evaluation dimension aliases -> canonical evaluation dimension.
DIMENSION_MAPPING = {
    "data_structure_usage": "data_structure",
}


# Adaptive gap labels -> canonical evaluation dimensions.
GAP_TO_DIMENSION = {
    "Algorithm-Correctness Gap": "algorithm_correctness",
    "Reasoning Gap": "logical_reasoning",
    "Concept Gap": "concept_coverage",
    "Completeness Gap": "completeness",
    "Data-Structure Gap": "data_structure",
    "Complexity Gap": "complexity",
    "Edge-Case Gap": "edge_cases",
}


# Canonical evaluation dimensions -> adaptive gap labels.
DIMENSION_TO_GAP = {
    dimension: gap
    for gap, dimension in GAP_TO_DIMENSION.items()
}


# Lower number means higher priority when scores are tied.
PRIORITY_ORDER = {
    "Algorithm-Correctness Gap": 1,
    "Reasoning Gap": 2,
    "Concept Gap": 3,
    "Data-Structure Gap": 4,
    "Complexity Gap": 5,
    "Edge-Case Gap": 6,
    "Completeness Gap": 7,
}


# Canonical dimensions in a stable assessment order.
DIMENSION_ORDER = (
    "algorithm_correctness",
    "logical_reasoning",
    "concept_coverage",
    "completeness",
    "data_structure",
    "complexity",
    "edge_cases",
)


UNASSESSED_STATUSES = {
    "not_assessed",
    "unassessed",
    "not_evaluated",
    "pending",
    "not_available",
    "not_applicable",
}


# ============================================================
# NORMALIZATION HELPERS
# ============================================================

def _normalize_dimension(dimension: Any) -> Optional[str]:
    """Normalize an evaluation dimension name."""

    if not isinstance(dimension, str):
        return None

    dimension = dimension.strip().lower()

    if not dimension:
        return None

    return DIMENSION_MAPPING.get(dimension, dimension)


def _normalize_status(value: Any) -> Optional[str]:
    """Normalize common assessment status formats."""

    if value is None:
        return None

    return (
        str(value)
        .strip()
        .lower()
        .replace("-", "_")
        .replace(" ", "_")
    )


def _normalize_scores(scores: Any) -> dict[str, Any]:
    """
    Normalize score dictionary keys.

    If both an alias and its canonical name exist, prefer the
    canonical key rather than allowing an alias to overwrite it.
    """
    if not isinstance(scores, dict):
        return {}

    normalized = {}

    # Process aliases first.
    for dimension, value in scores.items():
        canonical = _normalize_dimension(dimension)

        if canonical is None or canonical == dimension:
            continue

        normalized.setdefault(canonical, value)

    # Canonical keys take precedence over aliases.
    for dimension, value in scores.items():
        canonical = _normalize_dimension(dimension)

        if canonical is None:
            continue

        if dimension == canonical:
            normalized[canonical] = value

    return normalized


def _get_dimension_score(
    dimension_data: Any,
) -> Optional[float]:
    """
    Extract a valid 0-100 score.

    Supports:
        "complexity": 60

    And:
        "complexity": {
            "score": 60,
            "assessment_status": "ASSESSED"
        }

    Explicitly unassessed dimensions are ignored.
    """
    if dimension_data is None:
        return None

    if isinstance(dimension_data, dict):
        status = _normalize_status(
            dimension_data.get(
                "assessment_status",
                dimension_data.get(
                    "assessment_status_label",
                    dimension_data.get("status"),
                ),
            )
        )

        if status in UNASSESSED_STATUSES:
            return None

        value = dimension_data.get("score")
    else:
        value = dimension_data

    if value is None or isinstance(value, bool):
        return None

    try:
        score = float(value)
    except (TypeError, ValueError, OverflowError):
        return None

    if not 0.0 <= score <= 100.0:
        return None

    return score


def _is_explicitly_unassessed(value: Any) -> bool:
    """Return True when a dimension explicitly says it is unassessed."""

    if value is None:
        return True

    if not isinstance(value, dict):
        return False

    status = _normalize_status(
        value.get(
            "assessment_status",
            value.get(
                "assessment_status_label",
                value.get("status"),
            ),
        )
    )

    if status in UNASSESSED_STATUSES:
        return True

    return value.get("score") is None


# ============================================================
# GAP ANALYSIS
# ============================================================

def analyze_gaps(scores: dict) -> dict[str, Any]:
    """
    Rank assessed dimensions from weakest to strongest.

    Returns canonical evaluation dimension names because the
    PolicyEngine consumes names such as "logical_reasoning".

    Unassessed dimensions are not assigned a score of zero.

    Returns:
        {
            "primary_gap": "logical_reasoning" or None,
            "secondary_gap": "concept_coverage" or None,
            "prioritized_gaps": [...]
        }
    """
    normalized_scores = _normalize_scores(scores)

    assessed_scores = {}

    for dimension in DIMENSION_ORDER:
        if dimension not in normalized_scores:
            continue

        score = _get_dimension_score(
            normalized_scores[dimension]
        )

        if score is not None:
            assessed_scores[dimension] = score

    # Include other numeric dimensions in deterministic order,
    # without changing the priority of the known dimensions.
    for dimension in sorted(normalized_scores):
        if dimension in assessed_scores:
            continue

        score = _get_dimension_score(
            normalized_scores[dimension]
        )

        if score is not None:
            assessed_scores[dimension] = score

    dimension_order_index = {
        dimension: index
        for index, dimension in enumerate(DIMENSION_ORDER)
    }

    prioritized_gaps = sorted(
        assessed_scores,
        key=lambda dimension: (
            assessed_scores[dimension],
            dimension_order_index.get(
                dimension,
                len(DIMENSION_ORDER),
            ),
            dimension,
        ),
    )

    return {
        "primary_gap": (
            prioritized_gaps[0]
            if prioritized_gaps
            else None
        ),
        "secondary_gap": (
            prioritized_gaps[1]
            if len(prioritized_gaps) > 1
            else None
        ),
        "prioritized_gaps": prioritized_gaps,
    }


# ============================================================
# ADAPTIVE PRIORITY
# ============================================================

def get_adaptive_priority(
    llm_evaluation: dict,
    adaptive_classifications: list,
) -> Optional[str]:
    """
    Return the highest-priority assessed adaptive gap.

    The lowest valid score wins. PRIORITY_ORDER resolves ties.
    Invalid, unknown, and unassessed gaps are ignored.
    """
    if not isinstance(llm_evaluation, dict):
        return None

    if not isinstance(adaptive_classifications, (list, tuple, set)):
        return None

    scores = _normalize_scores(
        llm_evaluation.get("scores", {})
    )

    candidates = []
    seen = set()

    for gap in adaptive_classifications:
        if not isinstance(gap, str):
            continue

        gap = gap.strip()

        if gap in seen:
            continue

        seen.add(gap)

        dimension = GAP_TO_DIMENSION.get(gap)

        if dimension is None:
            continue

        score = _get_dimension_score(
            scores.get(dimension)
        )

        if score is None:
            continue

        candidates.append(
            (
                score,
                PRIORITY_ORDER.get(gap, 999),
                gap,
            )
        )

    if not candidates:
        return None

    candidates.sort(
        key=lambda item: (item[0], item[1], item[2])
    )

    return candidates[0][2]


# ============================================================
# UNASSESSED DIMENSIONS
# ============================================================

def get_unassessed_dimensions(
    llm_evaluation: dict,
) -> list[str]:
    """
    Return canonical dimensions explicitly marked unassessed,
    plus dimensions whose value is missing or None.

    The result uses evaluation dimension names.
    """
    if not isinstance(llm_evaluation, dict):
        return []

    scores = _normalize_scores(
        llm_evaluation.get("scores", {})
    )

    unassessed = []

    for dimension in DIMENSION_ORDER:
        value = scores.get(dimension)

        if _is_explicitly_unassessed(value):
            unassessed.append(dimension)

    return unassessed


def get_unassessed_probe(
    llm_evaluation: dict,
    already_probed: list,
) -> Optional[str]:
    """
    Select the first unassessed adaptive gap not already probed.

    Returns an adaptive gap label, for example "Reasoning Gap".
    """
    if not isinstance(already_probed, (list, tuple, set)):
        already_probed = []

    probed_gaps = {
        str(item).strip()
        for item in already_probed
        if item is not None
    }

    probed_dimensions = {
        _normalize_dimension(item)
        for item in already_probed
        if isinstance(item, str)
    }

    for dimension in get_unassessed_dimensions(llm_evaluation):
        gap = DIMENSION_TO_GAP.get(dimension)

        if gap is None:
            continue

        if gap in probed_gaps or dimension in probed_dimensions:
            continue

        return gap

    return None
