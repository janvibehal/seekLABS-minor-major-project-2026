from AI.evaluation.interviewer.interview_session import (
    InterviewSession
)


def test_final_interview():

    print()
    print("=" * 60)
    print("       STEP 15.2 — FINAL INTERVIEW")
    print("=" * 60)

    # ==================================================
    # PROBLEM
    # ==================================================

    problem = {
        "title": "Two Sum",

        "description": (
            "Given an array of integers nums and "
            "an integer target, return the indices "
            "of two numbers that add up to target."
        )
    }

    # ==================================================
    # CREATE REAL SESSION
    # ==================================================

    session = InterviewSession(
        candidate_id="candidate_001",

        question_id="two_sum",

        problem=problem
    )

    print()
    print("INTERVIEW SESSION CREATED")

    # ==================================================
    # TURN 1
    # ==================================================

    answer_1 = (
        "I would use a HashMap. For every number, "
        "I calculate the complement and check whether "
        "it already exists in the map."
    )

    features_1 = {
        "normalized_answer": answer_1,

        "concepts_detected": [
            "HashMap"
        ],

        "reasoning": [
            "Calculate complement",
            "Check HashMap"
        ],

        "complexity_claim": {
            "time": None,
            "space": None
        }
    }

    print()
    print("=" * 60)
    print("TURN 1")
    print("=" * 60)

    state = session.submit_answer(
        candidate_answer=answer_1,

        candidate_features=features_1
    )

    print()
    print("Turn Number:")
    print(state.turn_number)

    print()
    print("Should Continue:")
    print(
        not session.is_finished()
    )

    print()
    print("Follow-Up:")
    print(
        session.get_next_question()
    )

    assert (
        not session.is_finished()
        is True
    )

    assert (
        session.get_next_question()
        is not None
    )

    print()
    print("TURN 1 PASSED")

    # ==================================================
    # TURN 2
    # ==================================================

    answer_2 = (
        "The HashMap solution takes O(n) time and "
        "O(n) space. I would handle duplicate values, "
        "negative numbers, arrays with fewer than two "
        "elements, and cases where no solution exists."
    )

    features_2 = {
        "normalized_answer": answer_2,

        "concepts_detected": [
            "HashMap",
            "complement",
            "indices",
            "complexity",
            "edge cases"
        ],

        "reasoning": [
            "Calculate complement as target minus current value",
            "Check HashMap before storing current value",
            "Store values with their indices",
            "Return indices when complement is found",
            "Avoid using the same element twice",
            "Process each element once",
            "Handle duplicate values",
            "Handle negative values",
            "Handle insufficient input",
            "Handle no solution"
        ],

        "complexity_claim": {
            "time": "O(n)",
            "space": "O(n)"
        }
    }

    print()
    print("=" * 60)
    print("TURN 2")
    print("=" * 60)

    state = session.submit_answer(
        candidate_answer=answer_2,

        candidate_features=features_2
    )

    print()
    print("Turn Number:")
    print(state.turn_number)

    print()
    print("Should Continue:")
    print(
        not session.is_finished()
    )

    print()
    print("Session Finished:")
    print(
        session.is_finished()
    )

    assert (
        session.is_finished()
        is True
    )

    print()
    print("TURN 2 PASSED")

    # ==================================================
    # FINAL RESULT
    # ==================================================

    print()
    print("=" * 60)
    print("FINAL RESULT")
    print("=" * 60)

    final_result = (
        session.get_final_result()
    )

    print()
    print("Candidate ID:")
    print(
        final_result[
            "candidate_id"
        ]
    )

    print()
    print("Question ID:")
    print(
        final_result[
            "question_id"
        ]
    )

    print()
    print("Status:")
    print(
        final_result[
            "status"
        ]
    )

    print()
    print("Average Score:")
    print(
        final_result[
            "average_score"
        ]
    )

    print()
    print("Assessed Dimensions:")
    print(
        final_result[
            "assessed_dimensions"
        ]
    )

    print()
    print("Primary Classification:")
    print(
        final_result[
            "primary_classification"
        ]
    )

    print()
    print("Scores:")

    for dimension, data in (
        final_result[
            "scores"
        ].items()
    ):

        print(
            f"  {dimension}: "
            f"{data['score']}"
        )

    # ==================================================
    # ASSERTIONS
    # ==================================================

    assert (
        final_result[
            "candidate_id"
        ]
        == "candidate_001"
    )

    assert (
        final_result[
            "question_id"
        ]
        == "two_sum"
    )

    assert (
        final_result[
            "status"
        ]
        == "COMPLETED"
    )

    assert (
        final_result[
            "assessed_dimensions"
        ]
        == 7
    )

    assert (
        final_result[
            "total_dimensions"
        ]
        == 7
    )

    assert (
        final_result[
            "average_score"
        ]
        is not None
    )

    assert (
        len(
            final_result[
                "scores"
            ]
        )
        == 7
    )

    # ==================================================
    # FINAL SUCCESS
    # ==================================================

    print()
    print("=" * 60)
    print("       STEP 15.2 TEST PASSED")
    print("=" * 60)


if __name__ == "__main__":

    test_final_interview()