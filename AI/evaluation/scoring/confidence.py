from AI.evaluation.scoring.dimensions import (
    EVALUATION_DIMENSIONS,
    LEGACY_DIMENSION_ALIASES,
)


def calculate_confidence(
    llm_evaluation: dict,
    semantic_similarity: float
) -> float:
    """
    Calculate the final confidence score using
    LLM evaluation scores and semantic similarity.

    LLM evaluation contributes 70%.
    Semantic similarity contributes 30%.

    Supports both score formats:

    1. Numeric:
       "algorithm_correctness": 10

    2. Structured:
       "algorithm_correctness": {"score": 10}
    """

    scores = llm_evaluation.get("scores", {})

    dimensions = EVALUATION_DIMENSIONS

    legacy_keys = {
        canonical: legacy
        for legacy, canonical
        in LEGACY_DIMENSION_ALIASES.items()
    }

    if not scores:
        return 0.0

    total_score = 0.0

    for dimension in dimensions:

        value = scores.get(dimension)

        # Accept the legacy key name (e.g. data_structure_usage).
        if value is None and dimension in legacy_keys:
            value = scores.get(legacy_keys[dimension])

        if value is None:
            value = 0

        # --------------------------------------------------
        # Structured score format
        # --------------------------------------------------

        if isinstance(value, dict):
            value = value.get("score", 0)

        # --------------------------------------------------
        # Numeric score format
        # --------------------------------------------------

        try:
            value = float(value)
        except (TypeError, ValueError):
            value = 0.0

        total_score += value

    # --------------------------------------------------
    # Normalize LLM score to 0.0 - 1.0
    # --------------------------------------------------

    llm_score = (
        total_score /
        (len(dimensions) * 100)
    )

    # --------------------------------------------------
    # Normalize semantic similarity
    # --------------------------------------------------

    semantic_score = max(
        0.0,
        min(
            1.0,
            float(semantic_similarity)
        )
    )

    # --------------------------------------------------
    # Final confidence
    # --------------------------------------------------

    confidence = (
        0.7 * llm_score +
        0.3 * semantic_score
    )

    return round(
        confidence,4
    )