from AI.evaluation.scoring.confidence import calculate_confidence


def test_confidence_score():
    llm_evaluation = {
        "scores": {
            "algorithm_correctness": 100,
            "logical_reasoning": 100,
            "concept_coverage": 100,
            "completeness": 100,
            "data_structure_usage": 100,
            "complexity": 100,
            "edge_cases": 100
        }
    }

    semantic_similarity = 0.8

    result = calculate_confidence(
        llm_evaluation,
        semantic_similarity
    )

    assert result == 0.94


def test_zero_confidence():
    llm_evaluation = {
        "scores": {
            "algorithm_correctness": 0,
            "logical_reasoning": 0,
            "concept_coverage": 0,
            "completeness": 0,
            "data_structure_usage": 0,
            "complexity": 0,
            "edge_cases": 0
        }
    }

    result = calculate_confidence(
        llm_evaluation,
        0.0
    )

    assert result == 0.0