from AI.evaluation.scoring.candidate_state import (
    CandidateEvaluationState
)

from AI.evaluation.scoring.evaluation_orchestrator import (
    evaluate_candidate_turn
)


def test_orchestrator_continue():

    state = CandidateEvaluationState(
        candidate_id="candidate_001",
        question_id="two_sum"
    )

    problem = {
        "title": "Two Sum",

        "description": (
            "Given an array of integers nums and "
            "an integer target, return the indices "
            "of two numbers that add up to target."
        )
    }

    candidate_answer = (
        "I would use a HashMap to store previously "
        "seen values and find the complement."
    )

    candidate_features = {
        "normalized_answer": candidate_answer,

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

    state = evaluate_candidate_turn(
        state=state,

        candidate_answer=candidate_answer,

        problem=problem,

        candidate_features=candidate_features
    )

    print()
    print("=" * 60)
    print("       ORCHESTRATOR CONTROLLER TEST")
    print("=" * 60)

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
    print("Adaptive Gap:")
    print(
        state.primary_adaptive_gap
    )

    print()
    print("Follow-Up Question:")
    print(
        state.current_interviewer_question
    )

    # The system should continue if Ollama
    # leaves an important dimension unassessed
    # or identifies a genuine gap.

    assert (
        state.should_continue # type: ignore
        is True
    )

    assert (
        state.current_interviewer_question
        is not None
    )

    assert (
        len(
            state.current_interviewer_question
            .strip()
        )
        > 0
    )

    print()
    print("CONTINUE DECISION PASSED")

    print()
    print("=" * 60)
    print("       TEST PASSED")
    print("=" * 60)


if __name__ == "__main__":
    test_orchestrator_continue()