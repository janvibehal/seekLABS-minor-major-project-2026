from AI.evaluation.scoring.candidate_state import (
    CandidateEvaluationState
)

from AI.evaluation.scoring.final_result import (
    build_final_result
)


def test_final_result():

    print()
    print("=" * 60)
    print("       STEP 15.1 — FINAL RESULT")
    print("=" * 60)

    # ==================================================
    # CREATE COMPLETED STATE
    # ==================================================

    state = CandidateEvaluationState(
        candidate_id="candidate_001",
        question_id="two_sum"
    )

    # ==================================================
    # Simulate completed interview
    # ==================================================

    state.turn_number = 3

    state.current_answer = (
        "For edge cases, I would handle duplicate "
        "values, negative numbers, empty input, and "
        "cases where no solution exists."
    )

    state.scores = {
        "algorithm_correctness": 90,

        "logical_reasoning": 85,

        "concept_coverage": 90,

        "completeness": 80,

        "data_structure": 95,

        "complexity": 90,

        "edge_cases": 85
    }

    state.evidence = {

        "algorithm_correctness":
            "Correct HashMap approach.",

        "logical_reasoning":
            "Reasoning is clear.",

        "concept_coverage":
            "HashMap concept correctly applied.",

        "completeness":
            "Core solution requirements addressed.",

        "data_structure":
            "HashMap is appropriate.",

        "complexity":
            "O(n) time and O(n) space.",

        "edge_cases":
            "Duplicate and boundary cases discussed."
    }

    state.primary_classification = (
        "Correct"
    )

    state.secondary_classification = None

    state.adaptive_classifications = [
        "Complexity Gap",
        "Edge-Case Gap"
    ]

    state.primary_adaptive_gap = None

    state.history = [
        {
            "turn_number": 1,
            "current_answer":
                "I would use a HashMap."
        },

        {
            "turn_number": 2,
            "current_answer":
                "The solution takes O(n) time and O(n) space."
        }
    ]

    # ==================================================
    # BUILD FINAL RESULT
    # ==================================================

    result = build_final_result(
        state
    )

    # ==================================================
    # DISPLAY RESULT
    # ==================================================

    print()
    print("FINAL RESULT")
    print("-" * 60)

    print()
    print(
        "Candidate ID:",
        result["candidate_id"]
    )

    print(
        "Question ID:",
        result["question_id"]
    )

    print(
        "Status:",
        result["status"]
    )

    print(
        "Turns:",
        result["turn_number"]
    )

    print(
        "History Length:",
        result["history_length"]
    )

    print()
    print("SCORES")
    print("-" * 60)

    for dimension, data in (
        result["scores"].items()
    ):

        print(
            f"{dimension}: "
            f"{data['score']}"
        )

    print()
    print(
        "Average Score:",
        result["average_score"]
    )

    print(
        "Assessed Dimensions:",
        result["assessed_dimensions"]
    )

    print(
        "Total Dimensions:",
        result["total_dimensions"]
    )

    print()
    print("CLASSIFICATION")
    print("-" * 60)

    print(
        "Primary:",
        result["primary_classification"]
    )

    print(
        "Secondary:",
        result["secondary_classification"]
    )

    print()
    print("ADAPTIVE")
    print("-" * 60)

    print(
        "Adaptive Classifications:",
        result[
            "adaptive_classifications"
        ]
    )

    print(
        "Primary Adaptive Gap:",
        result[
            "primary_adaptive_gap"
        ]
    )

    # ==================================================
    # ASSERTIONS
    # ==================================================

    assert (
        result["candidate_id"]
        == "candidate_001"
    )

    assert (
        result["question_id"]
        == "two_sum"
    )

    assert (
        result["status"]
        == "COMPLETED"
    )

    assert (
        result["turn_number"]
        == 3
    )

    assert (
        result["history_length"]
        == 2
    )

    # --------------------------------------------------
    # Seven dimensions
    # --------------------------------------------------

    assert (
        len(
            result["scores"]
        )
        == 7
    )

    # --------------------------------------------------
    # Every score should be present
    # --------------------------------------------------

    for dimension in [
        "algorithm_correctness",
        "logical_reasoning",
        "concept_coverage",
        "completeness",
        "data_structure",
        "complexity",
        "edge_cases"
    ]:

        assert (
            result["scores"][
                dimension
            ]["score"]
            is not None
        )

        assert (
            result["scores"][
                dimension
            ]["assessment_status"]
            == "ASSESSED"
        )

    # --------------------------------------------------
    # Average
    #
    # (90 + 85 + 90 + 80 + 95 + 90 + 85) / 7
    # = 87.857...
    # --------------------------------------------------

    assert (
        result["average_score"]
        == 87.86
    )

    # --------------------------------------------------
    # All dimensions assessed
    # --------------------------------------------------

    assert (
        result["assessed_dimensions"]
        == 7
    )

    assert (
        result["total_dimensions"]
        == 7
    )

    # --------------------------------------------------
    # Classification
    # --------------------------------------------------

    assert (
        result["primary_classification"]
        == "Correct"
    )

    # --------------------------------------------------
    # Adaptive history
    # --------------------------------------------------

    assert (
        "Complexity Gap"
        in result[
            "adaptive_classifications"
        ]
    )

    assert (
        "Edge-Case Gap"
        in result[
            "adaptive_classifications"
        ]
    )

    print()
    print("=" * 60)
    print("       STEP 15.1 TEST PASSED")
    print("=" * 60)


if __name__ == "__main__":

    test_final_result()