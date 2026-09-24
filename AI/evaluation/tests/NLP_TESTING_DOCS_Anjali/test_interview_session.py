from AI.evaluation.interviewer.interview_session import (
    InterviewSession
)


def test_interview_session():

    print()
    print("=" * 60)
    print("       STEP 14 — INTERVIEW SESSION")
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
    # CREATE SESSION
    # ==================================================

    session = InterviewSession(
        candidate_id="candidate_001",

        question_id="two_sum",

        problem=problem
    )

    assert (
        session.is_finished()
        is False
    )

    print()
    print("SESSION CREATED")

    # ==================================================
    # ANSWER 1
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
    print("SUBMITTING ANSWER 1")
    print("=" * 60)

    state = session.submit_answer(
        candidate_answer=answer_1,

        candidate_features=features_1
    )

    print()
    print("Turn:")
    print(state.turn_number)

    print()
    print("Should Continue:")
    print(
        getattr(
            state,
            "should_continue",
            None
        )
    )

    print()
    print("Follow-Up Question:")
    print(
        session.get_next_question()
    )

    # --------------------------------------------------
    # The first answer should normally produce a
    # follow-up because the answer is incomplete.
    # --------------------------------------------------

    assert (
        getattr(
            state,
            "should_continue",
            None
        )
        is True
    )

    assert (
        session.is_finished()
        is False
    )

    first_question = (
        session.get_next_question()
    )

    assert (
        first_question is not None
    )

    assert (
        len(first_question.strip())
        > 0
    )

    print()
    print("ANSWER 1 PASSED")

    # ==================================================
    # ANSWER 2
    # ==================================================

    answer_2 = (
        "The HashMap solution takes O(n) time and "
        "O(n) space. For edge cases, I would consider "
        "duplicate values, negative numbers, arrays "
        "with fewer than two elements, and cases where "
        "no valid pair exists."
    )

    features_2 = {
        "normalized_answer": answer_2,

        "concepts_detected": [
            "HashMap",
            "edge cases",
            "complexity"
        ],

        "reasoning": [
            "Calculate complement",
            "HashMap lookup",
            "Handle duplicate values",
            "Handle negative values",
            "Handle insufficient input"
        ],

        "complexity_claim": {
            "time": "O(n)",
            "space": "O(n)"
        }
    }

    print()
    print("=" * 60)
    print("SUBMITTING ANSWER 2")
    print("=" * 60)

    state = session.submit_answer(
        candidate_answer=answer_2,

        candidate_features=features_2
    )

    print()
    print("Turn:")
    print(state.turn_number)

    print()
    print("Scores:")
    print(state.scores)

    print()
    print("Should Continue:")
    print(
        getattr(
            state,
            "should_continue",
            None
        )
    )

    print()
    print("Next Question:")
    print(
        session.get_next_question()
    )

    print()
    print("History Length:")
    print(
        len(state.history)
    )

    assert (
        len(state.history)
        >= 2
    )

    print()
    print("ANSWER 2 PASSED")

    # ==================================================
    # FINAL STATUS
    # ==================================================

    if session.is_finished():

        print()
        print("=" * 60)
        print("INTERVIEW FINISHED")
        print("=" * 60)

        final_state = (
            session.get_final_state()
        )

        print()
        print("Final Scores:")
        print(
            final_state.scores
        )

        print()
        print("Final Classification:")
        print(
            final_state.primary_classification
        )

        print()
        print("Final History Length:")
        print(
            len(final_state.history)
        )

    else:

        print()
        print("=" * 60)
        print("INTERVIEW STILL CONTINUES")
        print("=" * 60)

        print()
        print(
            "Another candidate answer would be "
            "submitted here."
        )

    print()
    print("=" * 60)
    print("       STEP 14 TEST PASSED")
    print("=" * 60)


if __name__ == "__main__":

    test_interview_session()