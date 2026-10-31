from AI.evaluation.scoring.confidence import calculate_confidence


def test_confidence_score():
    llm_evaluation = {
        "scores": {
            "algorithm_correctness": 100,
            "logical_reasoning": 100,
            "concept_coverage": 100,
            "completeness": 100,
            "data_structure": 100,
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
            "data_structure": 0,
            "complexity": 0,
            "edge_cases": 0
        }
    }

    result = calculate_confidence(
        llm_evaluation,
        0.0
    )

    assert result == 0.0


def test_data_structure_dimension_is_counted():
    """The runtime key must contribute to the score (regression)."""

    only_data_structure = {
        "scores": {"data_structure": 100}
    }

    assert calculate_confidence(only_data_structure, 0.0) == round(
        0.7 * (100 / 700), 4
    )


def test_legacy_data_structure_usage_key_still_accepted():

    legacy = {"scores": {"data_structure_usage": 100}}
    current = {"scores": {"data_structure": 100}}

    assert calculate_confidence(legacy, 0.0) == calculate_confidence(
        current, 0.0
    )


def test_not_assessed_dimension_counts_as_zero():
    """Documents the current behaviour for unassessed dimensions."""

    evaluation = {
        "scores": {
            "algorithm_correctness": {
                "score": 100,
                "assessment_status": "ASSESSED",
            },
            "edge_cases": {
                "score": None,
                "assessment_status": "NOT_ASSESSED",
            },
        }
    }

    assert calculate_confidence(evaluation, 0.0) == round(
        0.7 * (100 / 700), 4
    )
