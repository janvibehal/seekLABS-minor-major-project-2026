from AI.evaluation.extraction.extraction_service import extract_candidate_features
from AI.evaluation.llm.evaluator import evaluate_candidate


PROBLEM = "Find two numbers in an array that add up to a target."

REFERENCE_SOLUTION = (
    "Use a hash map to store previously seen values and "
    "check whether the complement exists."
)

EXPECTED_CONCEPTS = ["hash map"]

EXPECTED_COMPLEXITY = {
    "time": "O(n)",
    "space": "O(n)"
}

RUBRIC = (
    "Evaluate algorithm correctness, logical reasoning, concept coverage, "
    "completeness, data structure usage, complexity, and edge cases."
)


def test_full_evaluation_pipeline():
    answer = (
        "First, I store previously seen values in a hash map. "
        "Then I check whether the complement exists. "
        "Finally, I return the indices. "
        "Time complexity: O(n), Space complexity: O(n)."
    )

    # Step 1: Extract candidate features
    features = extract_candidate_features(answer)

    assert features["original_answer"] == answer
    assert "hash map" in features["concepts_detected"]
    assert len(features["reasoning"]) > 0
    assert features["complexity_claim"]["time"] == "o(n)"
    assert features["complexity_claim"]["space"] == "o(n)"

    # Step 2: Send extracted features to the LLM evaluator
    result = evaluate_candidate(
        PROBLEM,
        REFERENCE_SOLUTION,
        EXPECTED_CONCEPTS,
        EXPECTED_COMPLEXITY,
        features["reasoning"],
        RUBRIC
    )

    # Step 3: Verify structured LLM evaluation
    evaluation = result["evaluation"]

    assert "algorithm_correctness" in evaluation
    assert "logical_reasoning" in evaluation
    assert "concept_coverage" in evaluation
    assert "completeness" in evaluation
    assert "data_structure_usage" in evaluation
    assert "complexity" in evaluation
    assert "edge_case_handling" in evaluation
    assert "explanation" in evaluation