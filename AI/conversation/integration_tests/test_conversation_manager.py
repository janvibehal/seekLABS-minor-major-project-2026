from AI.conversation.conversation_manager import ConversationManager


def test_conversation_manager():

    manager = ConversationManager(
        session_id="session_001",
        initial_time=600
    )

    # -------------------------------------------------
    # 1. Set initial problem
    # -------------------------------------------------

    problem = {
        "problem_id": "P001",
        "title": "Two Sum"
    }

    manager.set_question(problem)

    assert manager.get_current_question() == problem

    # -------------------------------------------------
    # 2. Candidate gives initial response
    # -------------------------------------------------

    response = (
        "I'll use two nested loops and check every pair. "
        "If the sum equals the target, I'll return the indices."
    )

    manager.add_candidate_response(
        response=response,
        metadata={
            "turn": 1
        }
    )

    assert len(manager.get_candidate_responses()) == 1

    # -------------------------------------------------
    # 3. Mock candidate state from NLP layer
    # -------------------------------------------------

    candidate_state = {
        "approach": "brute_force",
        "algorithms": ["nested_loops"],
        "concepts": [],
        "data_structures": [],
        "time_complexity": "O(n^2)",
        "space_complexity": "O(1)",
        "edge_cases": [],
        "reasoning_summary": (
            "Checks every pair until a matching pair is found."
        ),
        "confidence": 0.92
    }

    manager.update_candidate_state(candidate_state)

    assert (
        manager.get_candidate_state()["approach"]
        == "brute_force"
    )

    # -------------------------------------------------
    # 4. Mock evaluation result
    # -------------------------------------------------

    evaluation = {
        "scores": {
            "algorithm_correctness": 75,
            "logical_reasoning": 75,
            "concept_coverage": 60,
            "completeness": 70,
            "data_structure": 50,
            "complexity": 30,
            "edge_cases": 20
        },
        "weighted_score": 56.25,
        "primary_classification": "Partially Correct",
        "adaptive_gaps": [
            "complexity",
            "edge_cases"
        ]
    }

    manager.add_evaluation_result(evaluation)

    assert manager.get_state()["current_score"] == 56.25

    # -------------------------------------------------
    # 5. Mock follow-up question
    # -------------------------------------------------

    follow_up_question = {
        "question_id": "Q002",
        "type": "follow_up",
        "target_dimension": "complexity",
        "text": (
            "How would your approach perform "
            "if the input contained one million elements?"
        )
    }

    manager.add_question(follow_up_question)

    assert (
        manager.get_current_question()
        == follow_up_question
    )

    # -------------------------------------------------
    # 6. Mock hint
    # -------------------------------------------------

    hint = {
        "level": 1,
        "target_dimension": "complexity",
        "text": (
            "Think about how many pairs your approach "
            "checks as the input grows."
        )
    }

    manager.add_hint(hint)

    assert len(manager.get_hints_given()) == 1

    # -------------------------------------------------
    # 7. Update timer
    # -------------------------------------------------

    manager.update_time_remaining(420)

    assert manager.get_time_remaining() == 420

    # -------------------------------------------------
    # 8. Mock final evaluation
    # -------------------------------------------------

    final_evaluation = {
        "initial_score": 56.25,
        "final_score": 86.0,
        "improvement": 29.75,
        "classification": "Correct"
    }

    manager.set_final_evaluation(final_evaluation)

    assert (
        manager.get_final_evaluation()
        == final_evaluation
    )

    assert manager.is_active() is False

    # -------------------------------------------------
    # 9. Print complete state for manual inspection
    # -------------------------------------------------

    print("\nFinal conversation state:")
    print(manager.get_state())


if __name__ == "__main__":
    test_conversation_manager()