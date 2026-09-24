from AI.evaluation.scoring.candidate_state import (
    CandidateEvaluationState
)

from AI.evaluation.scoring.evaluation_orchestrator import (
    evaluate_candidate_turn
)


def test_complete_adaptive_turn():

    # ==================================================
    # INITIAL STATE
    # ==================================================

    state = CandidateEvaluationState(
        candidate_id="candidate_001",
        question_id="two_sum"
    )

    # ==================================================
    # CANDIDATE ANSWER
    # ==================================================

    candidate_answer = (
        "I would use a HashMap. For every number, "
        "I calculate the complement and check whether "
        "it already exists in the map. The time complexity "
        "is O(n) and the space complexity is O(n)."
    )

    # ==================================================
    # CANDIDATE FEATURES
    # ==================================================

    candidate_features = {
        "normalized_answer": candidate_answer,

        "concepts_detected": [
            "hash map"
        ],

        "approach": "hash map",

        "algorithms": [],

        "concepts": [],

        "data_structures": [
            "hash map"
        ],

        "reasoning": [
            "Calculate complement",
            "Check whether complement exists",
            "Return matching indices"
        ],

        "complexity_claim": {
            "time": "O(n)",
            "space": "O(n)"
        },

        "edge_cases": [
            "empty_input",
            "duplicate_values"
        ]
    }

    # ==================================================
    # PROBLEM
    # ==================================================

    problem = {
        "title": "Two Sum",

        "description": (
            "Given an array of integers nums and an "
            "integer target, return the indices of the "
            "two numbers such that they add up to target."
        )
    }

    # ==================================================
    # EVALUATE COMPLETE TURN
    # ==================================================

    updated_state = evaluate_candidate_turn(
        state=state,

        candidate_answer=candidate_answer,

        problem=problem,

        candidate_features=candidate_features
    )

    # ==================================================
    # DISPLAY
    # ==================================================

    print()
    print("=" * 60)
    print("       COMPLETE ADAPTIVE TURN")
    print("=" * 60)

    print()
    print("Primary Classification:")
    print(
        updated_state.primary_classification
    )

    print()
    print("Adaptive Classifications:")
    print(
        updated_state.adaptive_classifications
    )

    print()
    print("Primary Adaptive Gap:")
    print(
        updated_state.primary_adaptive_gap
    )

    print()
    print("Scores:")
    print(
        updated_state.scores
    )

    print()
    print("Interviewer Follow-Up:")
    print(
        updated_state.current_interviewer_question
    )

    print()
    print("=" * 60)

    # ==================================================
    # BASIC ASSERTIONS
    # ==================================================

    assert updated_state.turn_number == 2

    assert (
        updated_state.current_answer
        == candidate_answer
    )

    assert isinstance(
        updated_state.scores,
        dict
    )

    # ==================================================
    # NLP STATE ASSERTIONS
    # ==================================================

    assert updated_state.nlp_state is not None

    assert (
        updated_state.nlp_state.approach
        == "hash map"
    )

    assert (
        updated_state.nlp_state.algorithms
        == []
    )

    assert (
        updated_state.nlp_state.concepts
        == []
    )

    assert (
        updated_state.nlp_state.data_structures
        == ["hash map"]
    )

    assert (
        updated_state.nlp_state.time_complexity
        == "O(n)"
    )

    assert (
        updated_state.nlp_state.space_complexity
        == "O(n)"
    )

    assert (
        "empty_input"
        in updated_state.nlp_state.edge_cases
    )

    assert (
        "duplicate_values"
        in updated_state.nlp_state.edge_cases
    )

    assert (
        "Calculate complement"
        in updated_state.nlp_state.reasoning_summary
    )

    print()
    print("STATE UPDATE PASSED")

    print()
    print("NLP STATE UPDATE PASSED")