from AI.evaluation.scoring.candidate_state import (
    CandidateEvaluationState
)


def test_interviewer_question_storage():

    state = CandidateEvaluationState(
        candidate_id="candidate_001",
        question_id="two_sum"
    )

    # ==================================================
    # FIRST QUESTION
    # ==================================================

    first_question = (
        "Can you explain the time and space "
        "complexity of your HashMap approach?"
    )

    state.set_interviewer_question(
        first_question
    )

    assert (
        state.current_interviewer_question
        == first_question
    )

    print("\nFIRST QUESTION STORED:")
    print(
        state.current_interviewer_question
    )

    # ==================================================
    # FIRST CANDIDATE RESPONSE
    # ==================================================

    state.update(
        candidate_answer=(
            "The time complexity is O(n) and "
            "space complexity is O(n)."
        ),

        scores={
            "algorithm_correctness": 85,
            "logical_reasoning": 80,
            "concept_coverage": 75,
            "completeness": 70,
            "data_structure": 90,
            "complexity": 80,
            "edge_cases": None
        },

        primary_classification="Partially Correct",

        secondary_classification=None,

        adaptive_classifications=[
            "Edge-Case Gap"
        ],

        primary_adaptive_gap="Edge-Case Gap",

        evidence={
            "algorithm_correctness":
                "Correct approach.",

            "logical_reasoning":
                "Reasoning is clear.",

            "concept_coverage":
                "HashMap concept demonstrated.",

            "completeness":
                "Core approach explained.",

            "data_structure":
                "HashMap is appropriate.",

            "complexity":
                "Candidate explains O(n).",

            "edge_cases":
                None
        },

        interviewer_question=first_question
    )

    # ==================================================
    # VERIFY FIRST TURN
    # ==================================================

    assert (
        state.current_interviewer_question
        == first_question
    )

    assert len(
        state.history
    ) == 1

    assert (
        state.history[0][
            "current_interviewer_question"
        ]
        == first_question
    )

    print("\nFIRST TURN PASSED")

    # ==================================================
    # SECOND QUESTION
    # ==================================================

    second_question = (
        "What edge cases would you consider "
        "for this solution?"
    )

    state.set_interviewer_question(
        second_question
    )

    assert (
        state.current_interviewer_question
        == second_question
    )

    print("\nSECOND QUESTION STORED:")
    print(
        state.current_interviewer_question
    )

    # ==================================================
    # GET PREVIOUS QUESTIONS
    # ==================================================

    previous_questions = (
        state.get_previous_questions()
    )

    print("\nSTORED QUESTIONS:")

    for question in previous_questions:
        print(
            f"- {question}"
        )

    assert first_question in previous_questions

    assert second_question in previous_questions

    assert len(
        previous_questions
    ) == 2

    print("\nQUESTION HISTORY PASSED")

    # ==================================================
    # SERIALIZATION
    # ==================================================

    state_dict = state.to_dict()

    assert (
        state_dict[
            "current_interviewer_question"
        ]
        == second_question
    )

    assert (
        state_dict["history"][0][
            "current_interviewer_question"
        ]
        == first_question
    )

    print("\nSERIALIZATION PASSED")

    print("\n==========================================")
    print("       STEP 10 TESTS PASSED")
    print("==========================================\n")


if __name__ == "__main__":
    test_interviewer_question_storage()