from AI.evaluation.interviewer.interview_session import (
    InterviewSession
)


def print_separator(title):
    print()
    print("=" * 60)
    print(title)
    print("=" * 60)


def build_features(
    answer: str,
    time_complexity=None,
    space_complexity=None
):
    """
    Build the candidate features required by
    the current LLM evaluation pipeline.
    """

    return {
        "normalized_answer": answer,

        "concepts_detected": [
            "HashMap"
        ],

        "reasoning": [
            "Calculate complement",
            "Check HashMap"
        ],

        "complexity_claim": {
            "time": time_complexity,
            "space": space_complexity
        }
    }


def test_end_to_end():

    print_separator(
        "STEP 16 — FULL END-TO-END ADAPTIVE INTERVIEW"
    )

    # ==================================================
    # PROBLEM
    # ==================================================

    problem = {
        "problem_id" : "P001",
        "title": "Two Sum",

        "description": (
            "Given an array of integers nums and "
            "an integer target, return the indices "
            "of two numbers that add up to target."
        )
    }

    # ==================================================
    # CREATE INTERVIEW SESSION
    # ==================================================

    session = InterviewSession(
        candidate_id="candidate_001",

        question_id="two_sum",

        problem=problem
    )

    print()
    print("Interview session created.")

    assert (
        session.is_finished()
        is False
    )

    # ==================================================
    # TURN 1
    # ==================================================

    answer_1 = (
        "I would use a HashMap to store previously "
        "seen values and calculate the complement "
        "for every number."
    )

    features_1 = build_features(
        answer=answer_1
    )

    print_separator(
        "TURN 1 — INITIAL ANSWER"
    )

    print()
    print("Candidate:")
    print(answer_1)

    state = session.submit_answer(
        candidate_answer=answer_1,

        candidate_features=features_1
    )

    print()
    print("Turn:", state.turn_number)

    print(
        "Classification:",
        state.primary_classification
    )

    print(
        "Adaptive Gaps:",
        state.adaptive_classifications
    )

    print(
        "Should Continue:",
        not session.is_finished()
    )

    question_1 = (
        session.get_next_question()
    )

    print()
    print("Interviewer Follow-Up:")
    print(question_1)

    assert (
        state.turn_number
        == 2
    )

    # ==================================================
    # TURN 1 DECISION
    # ==================================================

    if session.is_finished():

        print()
        print(
            "Interview finished after Turn 1."
        )

    else:

        assert (
            question_1 is not None
        )

        assert (
            isinstance(
                question_1,
                str
            )
        )

        assert (
            len(
                question_1.strip()
            )
            > 0
        )

        print()
        print(
            "TURN 1 → FOLLOW-UP GENERATED"
        )

        # ==================================================
        # TURN 2
        # ==================================================

        answer_2 = (
            "The HashMap solution takes O(n) time "
            "because we process the array once. "
            "It takes O(n) space because the HashMap "
            "can store up to n elements."
        )

        features_2 = build_features(
            answer=answer_2,

            time_complexity="O(n)",

            space_complexity="O(n)"
        )

        print_separator(
            "TURN 2 — FOLLOW-UP ANSWER"
        )

        print()
        print("Candidate:")
        print(answer_2)

        state = session.submit_answer(
            candidate_answer=answer_2,

            candidate_features=features_2
        )

        print()
        print("Turn:", state.turn_number)

        print(
            "Classification:",
            state.primary_classification
        )

        print(
            "Adaptive Gaps:",
            state.adaptive_classifications
        )

        print(
            "Should Continue:",
            not session.is_finished()
        )

        question_2 = (
            session.get_next_question()
        )

        print()
        print("Interviewer Follow-Up:")
        print(question_2)

        # ==================================================
        # TURN 2 DECISION
        # ==================================================

        if session.is_finished():

            print()
            print(
                "Interview finished after Turn 2."
            )

        else:

            assert (
                question_2 is not None
            )

            assert (
                isinstance(
                    question_2,
                    str
                )
            )

            assert (
                len(
                    question_2.strip()
                )
                > 0
            )

            print()
            print(
                "TURN 2 → ANOTHER FOLLOW-UP GENERATED"
            )

            # ==============================================
            # TURN 3
            # ==============================================

            answer_3 = (
                "For each number, I calculate its complement as "
                "target minus the current number. I first check whether "
                "that complement is already in the HashMap. The map stores "
                "previously processed values and their indices, so the "
                "lookup takes O(1) average time. I only add the current "
                "number after checking its complement, which prevents using "
                "the same element twice. Once a matching complement is "
                "found, I return its stored index and the current index. "
                "The overall time complexity is O(n) and the space complexity "
                "is O(n). This also handles duplicate values, negative "
                "numbers, empty arrays, arrays with fewer than two elements, "
                "and cases where no valid pair exists."
            )

            features_3 = build_features(
                answer=answer_3,
                time_complexity="O(n)",
                space_complexity="O(n)"
            )

            print_separator(
                "TURN 3 — FINAL FOLLOW-UP ANSWER"
            )

            print()
            print("Candidate:")
            print(answer_3)

            state = session.submit_answer(
                candidate_answer=answer_3,

                candidate_features=features_3
            )

            print()
            print("Turn:", state.turn_number)

            print(
                "Classification:",
                state.primary_classification
            )

            print(
                "Adaptive Gaps:",
                state.adaptive_classifications
            )

            print(
                "Should Continue:",
                not session.is_finished()
            )

            print()
            print(
                "Session Finished:",
                session.is_finished()
            )

    # ==================================================
    # FINAL RESULT
    # ==================================================

    print_separator(
        "FINAL INTERVIEW RESULT"
    )

    assert (
        session.is_finished()
        is True
    )

    final_result = (
        session.get_final_result()
    )

    print()
    print(
        "Candidate ID:",
        final_result[
            "candidate_id"
        ]
    )

    print(
        "Question ID:",
        final_result[
            "question_id"
        ]
    )

    print(
        "Status:",
        final_result[
            "status"
        ]
    )

    print(
        "Turns:",
        final_result[
            "turn_number"
        ]
    )

    print(
        "History Length:",
        final_result[
            "history_length"
        ]
    )

    print(
        "Average Score:",
        final_result[
            "average_score"
        ]
    )

    print(
        "Assessed Dimensions:",
        final_result[
            "assessed_dimensions"
        ],
        "/",
        final_result[
            "total_dimensions"
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
    print("Seven Dimension Scores:")

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
    # FINAL ASSERTIONS
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

    assert (
        final_result[
            "history_length"
        ]
        >= 1
    )

    # ==================================================
    # FINAL SUCCESS
    # ==================================================

    print()
    print("=" * 60)
    print(
        "       STEP 16 END-TO-END TEST PASSED"
    )
    print("=" * 60)


if __name__ == "__main__":

    test_end_to_end()