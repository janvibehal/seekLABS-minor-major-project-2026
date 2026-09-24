import json
from pathlib import Path

from AI.evaluation.embeddings.semantic_evaluator import (
    calculate_semantic_similarity
)


REFERENCE_ANSWER = (
    "Use a hash map to store previously seen values and their indices. "
    "For each current value, calculate the complement as target minus "
    "the current value. Check whether the complement exists in the hash map. "
    "If it exists, return the stored index together with the current index. "
    "Otherwise, store the current value and its index."
)


def test_p001_fully_correct_answer_similarity():

    candidate_answer = (
        "Use a hash map to store each previously seen value and its index. "
        "For each number, calculate target minus that number and check "
        "whether the complement is already in the map. If it is, return "
        "the stored index and current index. Otherwise, store the current "
        "number and index. This takes O(n) time and O(n) space."
    )

    similarity = calculate_semantic_similarity(
        candidate_answer,
        REFERENCE_ANSWER
    )

    print()
    print("P001 TA001 similarity:", similarity)

    assert similarity > 0.5


def test_p001_incomplete_answer_similarity():

    candidate_answer = (
        "Use a hash map to find the complement of each number "
        "and return the matching indices."
    )

    similarity = calculate_semantic_similarity(
        candidate_answer,
        REFERENCE_ANSWER
    )

    print()
    print("P001 TA002 similarity:", similarity)

    assert similarity > 0.5


def test_p001_inefficient_answer_similarity():

    candidate_answer = (
        "Use two nested loops to examine every pair of elements. "
        "If the two values add up to the target, return their indices. "
        "This takes O(n^2) time and O(1) additional space."
    )

    similarity = calculate_semantic_similarity(
        candidate_answer,
        REFERENCE_ANSWER
    )

    print()
    print("P001 TA003 similarity:", similarity)

    assert similarity > 0.3
def test_p001_wrong_answer_similarity():

    candidate_answer = (
        "Use binary search on the array to find two numbers "
        "that add up to the target. The array should be sorted "
        "before performing the search."
    )

    similarity = calculate_semantic_similarity(
        candidate_answer,
        REFERENCE_ANSWER
    )

    print()
    print("P001 WRONG ANSWER similarity:", similarity)

    assert similarity < 0.7

# ==========================================================
# DATASET-DRIVEN SEMANTIC TEST
# ==========================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

REFERENCES_DIR = PROJECT_ROOT / "dataset" / "references"
TEST_ANSWERS_DIR = PROJECT_ROOT / "dataset" / "test_answers"


def load_reference_answer(problem_id: str) -> str:
    """
    Load the reference solution and combine its main
    semantic components into one reference text.
    """

    reference_path = (
        REFERENCES_DIR / f"{problem_id}_reference.json"
    )

    with open(
        reference_path,
        "r",
        encoding="utf-8"
    ) as file:

        data = json.load(file)

    reference_solution = data["reference_solution"]

    parts = []

    if reference_solution.get("expected_approach"):
        parts.append(
            reference_solution["expected_approach"]
        )

    if reference_solution.get("why"):
        parts.append(
            reference_solution["why"]
        )

    parts.extend(
        reference_solution.get(
            "detailed_explanation",
            []
        )
    )

    parts.extend(
        reference_solution.get(
            "reasoning_steps",
            []
        )
    )

    return " ".join(parts)


def load_candidate_answers(problem_id: str) -> list:
    """
    Load all candidate test answers for a problem.
    """

    answers_path = (
        TEST_ANSWERS_DIR / f"{problem_id}_answers.json"
    )

    with open(
        answers_path,
        "r",
        encoding="utf-8"
    ) as file:

        data = json.load(file)

    return data["candidate_test_answers"]


def test_all_five_problem_embeddings():

    problem_ids = [
        "P001",
        "P002",
        "P003",
        "P004",
        "P005"
    ]

    for problem_id in problem_ids:

        reference_answer = load_reference_answer(
            problem_id
        )

        candidate_answers = load_candidate_answers(
            problem_id
        )

        assert reference_answer.strip()

        assert len(candidate_answers) > 0

        print()
        print("=" * 60)
        print(f"{problem_id} SEMANTIC SIMILARITY")
        print("=" * 60)

        for candidate in candidate_answers:

            answer = candidate["answer"]

            similarity = calculate_semantic_similarity(
                answer,
                reference_answer
            )

            print()
            print(
                f"Category: {candidate['category']}"
            )

            print(
                f"Similarity: {similarity:.4f}"
            )

            assert 0.0 <= similarity <= 1.0