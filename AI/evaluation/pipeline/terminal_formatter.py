def print_evaluation(result: dict) -> None:
    """
    Display the evaluation result in a clean terminal format.
    """

    problem = result.get("problem", {})
    candidate = result.get("candidate", {})
    llm_evaluation = result.get("llm_evaluation", {})
    scores = llm_evaluation.get("scores", {})
    errors = llm_evaluation.get("errors", [])

    classification = result.get(
        "ai_classification",
        "N/A"
    )

    semantic_similarity = result.get(
        "semantic_similarity",
        0.0
    )

    confidence = result.get(
        "confidence",
        0.0
    )

    # ==========================================================
    # HEADER
    # ==========================================================

    print()
    print("=" * 75)
    print("                 CODING SOLUTION EVALUATION")
    print("=" * 75)

    # ==========================================================
    # PROBLEM
    # ==========================================================

    print()
    print("PROBLEM")
    print("-" * 75)

    print(
        problem.get(
            "statement",
            "No problem statement provided."
        )
    )

    # ==========================================================
    # CANDIDATE ANSWER
    # ==========================================================

    print()
    print("CANDIDATE ANSWER")
    print("-" * 75)

    print(
        candidate.get(
            "original_answer",
            "No candidate answer provided."
        )
    )

    # ==========================================================
    # EVALUATION SCORES
    # ==========================================================

    print()
    print("EVALUATION SCORES")
    print("-" * 75)

    score_labels = {
        "algorithm_correctness": "Algorithm Correctness",
        "logical_reasoning": "Logical Reasoning",
        "concept_coverage": "Concept Coverage",
        "completeness": "Completeness",
        "data_structure": "Data Structure Usage",
        "complexity": "Complexity",
        "edge_cases": "Edge Cases"
    }

    for key, label in score_labels.items():

        score = scores.get(key, 0)

        if isinstance(score, dict):
            score = score.get("score") or 0

        print(f"{label:<30} : {score:>3}/100")

    # ==========================================================
    # CLASSIFICATION
    # ==========================================================

    print()
    print("CLASSIFICATION")
    print("-" * 75)

    print(
        f"{'AI Classification':<30} : "
        f"{classification}"
    )

    print(
        f"{'Semantic Similarity':<30} : "
        f"{semantic_similarity * 100:.2f}%"
    )

    print(
        f"{'Confidence':<30} : "
        f"{confidence * 100:.2f}%"
    )

    # ==========================================================
    # EVALUATION REASONING
    # ==========================================================

    print()
    print("EVALUATION REASONING")
    print("-" * 75)

    reasoning = llm_evaluation.get(
        "reasoning",
        "No reasoning provided."
    )

    print(reasoning)

    # ==========================================================
    # IDENTIFIED ISSUES
    # ==========================================================

    print()
    print("IDENTIFIED ISSUES")
    print("-" * 75)

    if errors:

        for index, error in enumerate(errors, start=1):
            print(f"{index}. {error}")

    else:

        print("No significant issues identified.")

    # ==========================================================
    # FOOTER
    # ==========================================================

    print()
    print("=" * 75)
    print()