from AI.evaluation.llm.evaluator import evaluate_candidate


# ==========================================================
# Shared test data
# ==========================================================

PROBLEM = (
    "Find two numbers in an array that add up to a target."
)

REFERENCE_SOLUTION = (
    "Use a hash map to store previously seen values and check "
    "whether the complement exists."
)

EXPECTED_CONCEPTS = [
    "hash map"
]

EXPECTED_COMPLEXITY = {
    "time": "O(n)",
    "space": "O(n)"
}

RUBRIC = (
    "Evaluate algorithm correctness, logical reasoning, "
    "concept coverage, completeness, data structure usage, "
    "complexity, and edge cases."
)


# ==========================================================
# Correct hash map solution
# ==========================================================

def test_correct_hash_map_solution():

    result = evaluate_candidate(
        PROBLEM,
        REFERENCE_SOLUTION,
        EXPECTED_CONCEPTS,
        EXPECTED_COMPLEXITY,
        [
            "I store previously seen values in a hash map.",
            "For each value I check whether its complement exists."
        ],
        RUBRIC
    )

    evaluation = result["evaluation"]

    assert "algorithm_correctness" in evaluation
    assert "logical_reasoning" in evaluation
    assert "concept_coverage" in evaluation
    assert "complexity" in evaluation
    assert "explanation" in evaluation


# ==========================================================
# Concise correct solution
# ==========================================================

def test_concise_correct_solution():

    result = evaluate_candidate(
        PROBLEM,
        REFERENCE_SOLUTION,
        EXPECTED_CONCEPTS,
        EXPECTED_COMPLEXITY,
        [
            "Use a hash map and check the complement."
        ],
        RUBRIC
    )

    evaluation = result["evaluation"]

    assert "algorithm_correctness" in evaluation
    assert "explanation" in evaluation


# ==========================================================
# Incorrect solution
# ==========================================================

def test_incorrect_solution():

    result = evaluate_candidate(
        PROBLEM,
        REFERENCE_SOLUTION,
        EXPECTED_CONCEPTS,
        EXPECTED_COMPLEXITY,
        [
            "I will return the first two elements without checking "
            "whether they add up to the target."
        ],
        RUBRIC
    )

    evaluation = result["evaluation"]

    assert "algorithm_correctness" in evaluation
    assert "explanation" in evaluation


# ==========================================================
# Alternative solution
# ==========================================================

def test_alternative_solution():

    result = evaluate_candidate(
        PROBLEM,
        REFERENCE_SOLUTION,
        EXPECTED_CONCEPTS,
        EXPECTED_COMPLEXITY,
        [
            "I will sort the array first and use two pointers "
            "to find the required pair."
        ],
        RUBRIC
    )

    evaluation = result["evaluation"]

    assert "algorithm_correctness" in evaluation
    assert "explanation" in evaluation


# ==========================================================
# Malformed LLM JSON
# ==========================================================

def test_malformed_llm_json():

    from unittest.mock import patch

    class FakeResponse:

        def read(self):
            payload = (
                '{"model":"qwen3:4b",'
                '"response":"{\\"scores\\": '
                '{\\"algorithm_correctness\\": 10"}'
            )

            return payload.encode("utf-8")

        def __enter__(self):
            return self

        def __exit__(
            self,
            exc_type,
            exc_value,
            traceback
        ):
            pass

    candidate_features = {
        "normalized_answer": "Use a hash map.",
        "concepts_detected": [
            "hash map"
        ],
        "reasoning": [
            "Use a hash map to check the complement."
        ],
        "complexity_claim": {
            "time": "O(n)",
            "space": "O(n)"
        }
    }

    problem = {
        "statement": (
            "Find two numbers that add to a target."
        )
    }

    with patch(
        "evaluation.llm.ollama_client.urllib.request.urlopen",
        return_value=FakeResponse()
    ):

        from AI.evaluation.llm.llm_evaluator import (
            evaluate_with_llm
        )

        result = evaluate_with_llm(
            candidate_features,
            problem
        )

    assert "scores" in result
    assert "errors" in result


# ==========================================================
# LLM timeout
# ==========================================================

def test_llm_timeout():

    from unittest.mock import patch

    candidate_features = {
        "normalized_answer": "Use a hash map.",
        "concepts_detected": [
            "hash map"
        ],
        "reasoning": [
            "Use a hash map to check the complement."
        ],
        "complexity_claim": {
            "time": "O(n)",
            "space": "O(n)"
        }
    }

    problem = {
        "statement": (
            "Find two numbers that add to a target."
        )
    }

    with patch(
        "evaluation.llm.ollama_client.urllib.request.urlopen",
        side_effect=TimeoutError(
            "LLM request timed out"
        )
    ):

        from AI.evaluation.llm.llm_evaluator import (
            evaluate_with_llm
        )

        result = evaluate_with_llm(
            candidate_features,
            problem
        )

    assert "scores" in result
    assert "errors" in result

    assert any(
        "LLM request timed out" in str(error)
        for error in result["errors"]
    )


# ==========================================================
# LLM HTTP error
# ==========================================================

def test_llm_http_error():

    from unittest.mock import patch
    from urllib.error import HTTPError

    candidate_features = {
        "normalized_answer": "Use a hash map.",
        "concepts_detected": [
            "hash map"
        ],
        "reasoning": [
            "Use a hash map to check the complement."
        ],
        "complexity_claim": {
            "time": "O(n)",
            "space": "O(n)"
        }
    }

    problem = {
        "statement": (
            "Find two numbers that add to a target."
        )
    }

    http_error = HTTPError(
        url="http://localhost:11434",
        code=500,
        msg="Server error",
        hdrs=None,
        fp=None
    )

    with patch(
        "evaluation.llm.ollama_client.urllib.request.urlopen",
        side_effect=http_error
    ):

        from AI.evaluation.llm.llm_evaluator import (
            evaluate_with_llm
        )

        result = evaluate_with_llm(
            candidate_features,
            problem
        )

    assert "scores" in result
    assert "errors" in result

    assert any(
        "500" in str(error)
        or "Server error" in str(error)
        for error in result["errors"]
    )


# ==========================================================
# Direct execution
# ==========================================================

if __name__ == "__main__":

    test_correct_hash_map_solution()
    test_concise_correct_solution()
    test_incorrect_solution()
    test_alternative_solution()
    test_malformed_llm_json()
    test_llm_timeout()
    test_llm_http_error()

    print()
    print("=" * 60)
    print("ALL LLM TESTS PASSED")
    print("=" * 60)