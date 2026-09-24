from AI.evaluation.interviewer.interview_controller import (
    should_continue_interview
)


class FakeState:

    def __init__(
        self,
        history=None
    ):
        self.history = (
            history
            if history is not None
            else []
        )


def make_evaluation(
    edge_case_status="ASSESSED",
    edge_case_score: int | None = 80
):

    return {
        "scores": {

            "algorithm_correctness": {
                "score": 90,
                "assessment_status": "ASSESSED"
            },

            "logical_reasoning": {
                "score": 85,
                "assessment_status": "ASSESSED"
            },

            "concept_coverage": {
                "score": 90,
                "assessment_status": "ASSESSED"
            },

            "completeness": {
                "score": 85,
                "assessment_status": "ASSESSED"
            },

            "data_structure": {
                "score": 90,
                "assessment_status": "ASSESSED"
            },

            "complexity": {
                "score": 90,
                "assessment_status": "ASSESSED"
            },

            "edge_cases": {
                "score": edge_case_score,
                "assessment_status": edge_case_status
            }
        }
    }


# ==========================================================
# TEST 1
# Real adaptive gap → CONTINUE
# ==========================================================

def test_gap_means_continue():

    state = FakeState()

    evaluation = make_evaluation()

    result = should_continue_interview(
        state=state,

        llm_evaluation=evaluation,

        adaptive_classifications=[
            "Complexity Gap"
        ],

        adaptive_probe=None
    )

    print()
    print("TEST 1 — REAL GAP")
    print("Result:", result)

    assert result is True

    print("TEST 1 PASSED")


# ==========================================================
# TEST 2
# No gap + all assessed → STOP
# ==========================================================

def test_no_gap_means_stop():

    state = FakeState()

    evaluation = make_evaluation()

    result = should_continue_interview(
        state=state,

        llm_evaluation=evaluation,

        adaptive_classifications=[],

        adaptive_probe=None
    )

    print()
    print("TEST 2 — NO GAP")
    print("Result:", result)

    assert result is False

    print("TEST 2 PASSED")


# ==========================================================
# TEST 3
# Unassessed dimension → CONTINUE
# ==========================================================

def test_unassessed_dimension_means_continue():

    state = FakeState()

    evaluation = make_evaluation(
        edge_case_status="NOT_ASSESSED",
        edge_case_score=None
    )

    result = should_continue_interview(
        state=state,

        llm_evaluation=evaluation,

        adaptive_classifications=[],

        adaptive_probe="Edge-Case Gap"
    )

    print()
    print("TEST 3 — UNASSESSED DIMENSION")
    print("Result:", result)

    assert result is True

    print("TEST 3 PASSED")


# ==========================================================
# TEST 4
# Maximum follow-ups → STOP
# ==========================================================

def test_max_followups_means_stop():

    state = FakeState(
        history=[
            {
                "current_interviewer_question":
                    "Question 1"
            },

            {
                "current_interviewer_question":
                    "Question 2"
            },

            {
                "current_interviewer_question":
                    "Question 3"
            },

            {
                "current_interviewer_question":
                    "Question 4"
            },

            {
                "current_interviewer_question":
                    "Question 5"
            }
        ]
    )

    evaluation = make_evaluation()

    result = should_continue_interview(
        state=state,

        llm_evaluation=evaluation,

        adaptive_classifications=[
            "Complexity Gap"
        ],

        adaptive_probe=None,

        max_followups=5
    )

    print()
    print("TEST 4 — MAX FOLLOW-UPS")
    print("Result:", result)

    assert result is False

    print("TEST 4 PASSED")


# ==========================================================
# TEST 5
# Not all dimensions assessed → CONTINUE
# ==========================================================

def test_missing_assessment_means_continue():

    state = FakeState()

    evaluation = make_evaluation(
        edge_case_status="NOT_ASSESSED",
        edge_case_score=None
    )

    result = should_continue_interview(
        state=state,

        llm_evaluation=evaluation,

        adaptive_classifications=[],

        adaptive_probe=None
    )

    print()
    print("TEST 5 — MISSING ASSESSMENT")
    print("Result:", result)

    assert result is True

    print("TEST 5 PASSED")


# ==========================================================
# RUN ALL TESTS
# ==========================================================

if __name__ == "__main__":

    print()
    print("=" * 50)
    print("       INTERVIEW CONTROLLER TEST")
    print("=" * 50)

    test_gap_means_continue()

    test_no_gap_means_stop()

    test_unassessed_dimension_means_continue()

    test_max_followups_means_stop()

    test_missing_assessment_means_continue()

    print()
    print("=" * 50)
    print("       STEP 13 TESTS PASSED")
    print("=" * 50)

    