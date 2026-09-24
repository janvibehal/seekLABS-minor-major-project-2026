def get_adaptive_priority(
    llm_evaluation: dict,
    adaptive_classifications: list
) -> str | None:
    """
    Select the highest-priority adaptive gap.

    Priority is determined by the lowest assessed score.

    If multiple gaps have the same score, a deterministic
    tie-break order is used.

    Returns:
        The primary adaptive gap, or None if no adaptive gap exists.
    """

    if not adaptive_classifications:
        return None

    scores = llm_evaluation.get(
        "scores",
        {}
    )

    # --------------------------------------------------
    # Map adaptive classifications to their dimensions
    # --------------------------------------------------

    gap_to_dimension = {
        "Complexity Gap": "complexity",
        "Edge-Case Gap": "edge_cases",
        "Concept Gap": "concept_coverage",
        "Data-Structure Gap": "data_structure",
        "Reasoning Gap": "logical_reasoning",
        "Completeness Gap": "completeness"
    }

    # --------------------------------------------------
    # Tie-break order
    #
    # Lower number = higher priority when scores are
    # equal.
    # --------------------------------------------------

    priority_order = {
        "Reasoning Gap": 1,
        "Concept Gap": 2,
        "Data-Structure Gap": 3,
        "Complexity Gap": 4,
        "Edge-Case Gap": 5,
        "Completeness Gap": 6
    }

    candidates = []

    # --------------------------------------------------
    # Examine every detected adaptive gap
    # --------------------------------------------------

    for gap in adaptive_classifications:

        dimension_name = gap_to_dimension.get(
            gap
        )

        if dimension_name is None:
            continue

        dimension = scores.get(
            dimension_name,
            {}
        )

        if not isinstance(dimension, dict):
            continue

        score = dimension.get(
            "score"
        )

        # --------------------------------------------------
        # Ignore NOT_ASSESSED dimensions.
        # An unassessed dimension is not a weakness.
        # --------------------------------------------------

        if score is None:
            continue

        try:
            score = float(score)
        except (TypeError, ValueError):
            continue

        candidates.append(
            (
                score,
                priority_order.get(
                    gap,
                    999
                ),
                gap
            )
        )

    # --------------------------------------------------
    # No valid assessed gaps
    # --------------------------------------------------

    if not candidates:
        return None

    # --------------------------------------------------
    # Lowest score wins.
    #
    # If scores are equal, the explicit priority order
    # determines the winner.
    # --------------------------------------------------

    candidates.sort(
        key=lambda item: (
            item[0],
            item[1]
        )
    )

    return candidates[0][2]