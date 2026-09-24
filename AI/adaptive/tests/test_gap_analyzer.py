from AI.adaptive.gap_analyzer import analyze_gaps


def test_analyze_gaps():
    scores = {
        "algorithm_correctness": 85,
        "logical_reasoning": 70,
        "concept_coverage": 90,
        "completeness": 65,
        "data_structure_usage": 80,
        "complexity": 40,
        "edge_cases": 50
    }

    result = analyze_gaps(scores)

    assert result["primary_gap"] == "complexity"
    assert result["secondary_gap"] == "edge_cases"

    assert result["prioritized_gaps"] == [
        "complexity",
        "edge_cases",
        "completeness",
        "logical_reasoning",
        "data_structure",
        "algorithm_correctness",
        "concept_coverage"
    ]