def classify_answer(
    candidate_features: dict,
    llm_evaluation: dict
) -> dict:

    scores = llm_evaluation.get("scores", {})

    # ==================================================
    # SCORE EXTRACTION
    # ==================================================

    def get_dimension(dimension_name: str) -> dict:
        dimension = scores.get(
            dimension_name,
            {}
        )

        if not isinstance(dimension, dict):
            return {
                "score": None,
                "assessment_status": "NOT_ASSESSED",
                "evidence": ""
            }

        return dimension

    def get_score(dimension_name: str):
        dimension = get_dimension(
            dimension_name
        )

        score = dimension.get("score")

        if score is None:
            return None

        try:
            return float(score)

        except (TypeError, ValueError):
            return None

    def is_assessed(score):
        return score is not None

    # ==================================================
    # EXTRACT SEVEN SCORES
    # ==================================================

    algorithm = get_score(
        "algorithm_correctness"
    )

    reasoning = get_score(
        "logical_reasoning"
    )

    concepts = get_score(
        "concept_coverage"
    )

    completeness = get_score(
        "completeness"
    )

    data_structure = get_score(
        "data_structure"
    )

    complexity = get_score(
        "complexity"
    )

    edge_cases = get_score(
        "edge_cases"
    )

    # ==================================================
    # CANDIDATE ANSWER
    # ==================================================

    answer = candidate_features.get(
        "normalized_answer",
        ""
    ).strip()

    word_count = len(
        answer.split()
    )

    # ==================================================
    # RESULT OBJECT
    # ==================================================

    result = {
        "primary_classification": None,
        "secondary_classification": None,
        "adaptive_classifications": []
    }

    # ==================================================
    # 1. PRIMARY CLASSIFICATION
    # ==================================================

    # --------------------------------------------------
    # Incorrect
    #
    # Algorithm Correctness < 40
    # --------------------------------------------------

    if (
        algorithm is not None
        and algorithm < 40
    ):

        result["primary_classification"] = (
            "Incorrect"
        )

    # --------------------------------------------------
    # Partially Correct
    #
    # 40 <= Algorithm Correctness < 75
    # --------------------------------------------------

    elif (
        is_assessed(algorithm)
        and algorithm is not None
        and algorithm >= 40
        and algorithm < 75
    ):

        result["primary_classification"] = (
            "Partially Correct"
        )

    # --------------------------------------------------
    # Correct
    #
    # Algorithm >= 80
    # Reasoning >= 75
    # Concepts >= 75
    # Completeness >= 70
    # Data Structure >= 75
    # Complexity >= 70
    # Edge Cases >= 70
    #
    # Every dimension must be assessed.
    # --------------------------------------------------

    elif (
        is_assessed(algorithm)
        and is_assessed(reasoning)
        and is_assessed(concepts)
        and is_assessed(completeness)
        and is_assessed(data_structure)
        and is_assessed(complexity)
        and is_assessed(edge_cases)
        and algorithm is not None
        and reasoning is not None
        and concepts is not None
        and completeness is not None
        and data_structure is not None
        and complexity is not None
        and edge_cases is not None
        and algorithm >= 80
        and reasoning >= 75
        and concepts >= 75
        and completeness >= 70
        and data_structure >= 75
        and complexity >= 70
        and edge_cases >= 70
    ):

        result["primary_classification"] = (
            "Correct"
        )

    # --------------------------------------------------
    # Fallback
    # --------------------------------------------------

    else:

        result["primary_classification"] = (
            "Partially Correct"
        )

    # ==================================================
    # 2. SECONDARY CLASSIFICATION
    # ==================================================
    #
    # Secondary classification is independent from the
    # primary classification.
    #
    # A candidate can therefore be:
    #
    # Correct + Concise
    #
    # or:
    #
    # Correct + Verbose
    # ==================================================

    if (
        is_assessed(algorithm)
        and is_assessed(reasoning)
        and algorithm is not None
        and reasoning is not None
        and algorithm >= 80
        and reasoning >= 75
        and word_count <= 20
    ):

        result["secondary_classification"] = (
            "Concise"
        )

    elif (
        is_assessed(algorithm)
        and is_assessed(reasoning)
        and algorithm is not None
        and reasoning is not None
        and algorithm >= 80
        and reasoning >= 75
        and word_count >= 80
    ):

        result["secondary_classification"] = (
            "Verbose"
        )

    # ==================================================
    # 3. ADAPTIVE CLASSIFICATIONS
    # ==================================================
    #
    # IMPORTANT:
    #
    # These are NOT mutually exclusive.
    #
    # A candidate may have:
    #
    # Complexity Gap
    # Edge-Case Gap
    #
    # at the same time.
    #
    # We therefore collect ALL applicable gaps here.
    #
    # Priority will be handled separately in the
    # next stage.
    # ==================================================

    adaptive_classifications = []

    # --------------------------------------------------
    # Complexity Gap
    #
    # Algorithm >= 70
    # Reasoning >= 60
    # Complexity < 60
    # --------------------------------------------------

    if (
        is_assessed(algorithm)
        and is_assessed(reasoning)
        and is_assessed(complexity)
        and algorithm is not None
        and algorithm >= 70 
        and reasoning >= 60
        and complexity < 60
    ):

        adaptive_classifications.append(
            "Complexity Gap"
        )

    # --------------------------------------------------
    # Edge-Case Gap
    #
    # Algorithm >= 70
    # Reasoning >= 60
    # Edge Cases < 60
    # --------------------------------------------------

    if (
        is_assessed(algorithm)
        and is_assessed(reasoning)
        and is_assessed(edge_cases)
        and algorithm >= 70
        and reasoning >= 60
        and edge_cases < 60
    ):

        adaptive_classifications.append(
            "Edge-Case Gap"
        )

    # --------------------------------------------------
    # Concept Gap
    #
    # Algorithm >= 70
    # Concepts < 60
    # --------------------------------------------------

    if (
        is_assessed(algorithm)
        and is_assessed(concepts)
        and algorithm >= 70
        and concepts < 60
    ):

        adaptive_classifications.append(
            "Concept Gap"
        )

    # --------------------------------------------------
    # Data-Structure Gap
    #
    # Algorithm >= 70
    # Data Structure < 60
    # --------------------------------------------------

    if (
        is_assessed(algorithm)
        and is_assessed(data_structure)
        and algorithm >= 70
        and data_structure < 60
    ):

        adaptive_classifications.append(
            "Data-Structure Gap"
        )

    # --------------------------------------------------
    # Reasoning Gap
    #
    # Algorithm >= 70
    # Reasoning < 60
    # --------------------------------------------------

    if (
        is_assessed(algorithm)
        and is_assessed(reasoning)
        and algorithm >= 70
        and reasoning < 60
    ):

        adaptive_classifications.append(
            "Reasoning Gap"
        )

    # --------------------------------------------------
    # Completeness Gap
    #
    # Algorithm >= 70
    # Completeness < 60
    # --------------------------------------------------

    if (
        is_assessed(algorithm)
        and is_assessed(completeness)
        and algorithm >= 70
        and completeness < 60
    ):

        adaptive_classifications.append(
            "Completeness Gap"
        )

    # --------------------------------------------------
    # Store adaptive classifications
    # --------------------------------------------------

    result["adaptive_classifications"] = (
        adaptive_classifications
    )

    # ==================================================
    # RETURN
    # ==================================================

    return result