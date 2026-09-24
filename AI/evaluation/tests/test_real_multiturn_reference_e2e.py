import AI.evaluation.scoring.evaluation_orchestrator as evaluation_orchestrator

from AI.evaluation.interviewer.interview_session import InterviewSession


def test_real_multiturn_reference_guided_e2e(monkeypatch):
    """
    Full real multi-turn pipeline test.

    Reference progression is deterministic for this orchestration test:
        Turn 1 -> P001-R1 (brute force)
        Turn 2 -> P001-R2 (sorting + two pointers)
        Turn 3 -> P001-R3 (one-pass HashMap / optimal)

    The real NLP extraction, LLM evaluation, adaptive policy,
    follow-up generation, state management and final result generation
    still execute.

    The reference matcher itself is tested separately because its
    LLM output is stochastic.
    """

    reference_sequence = iter([
        "P001-R1",
        "P001-R2",
        "P001-R3",
    ])

    def deterministic_reference_match(candidate_state, reference_solutions):
        reference_id = next(reference_sequence)

        available_ids = {
            str(reference.get("Reference ID"))
            for reference in reference_solutions
        }

        assert reference_id in available_ids

        return reference_id, 0.99

    # Control only reference matching so this E2E test validates
    # deterministic orchestration rather than stochastic LLM matching.
    monkeypatch.setattr(
        evaluation_orchestrator,
        "match_reference_solution_with_confidence",
        deterministic_reference_match,
    )

    problem = {
        "problem_id": "P001",
        "title": "Two Sum",
        "description": (
            "Given an array of integers nums and an integer target, "
            "return indices of the two numbers such that they add up to target."
        ),
    }

    session = InterviewSession(
        candidate_id="real-e2e-candidate",
        question_id="P001",
        problem=problem,
        time_remaining=3600,
        candidate_level="medium",
        resume_existing=False,
        max_turns=10,
    )

    assert session.state.target_reference_id == "P001-R3"

    # ---------------------------------------------------------
    # TURN 1 - BRUTE FORCE
    # ---------------------------------------------------------

    brute_force_answer = """
    I would solve this using a brute force approach.

    I will use two nested loops. For every element, I will check
    every element after it and see whether the two values add up
    to the target.

    This takes O(n^2) time and O(1) extra space.
    """

    result_1 = session.submit_answer(brute_force_answer)

    assert session.state.reference_answer_id == "P001-R1"
    assert session.state.target_reference_id == "P001-R3"
    assert session.finished is False

    assert result_1 is not None
    assert session.state.current_interviewer_question

    # ---------------------------------------------------------
    # TURN 2 - SORT + TWO POINTERS
    # ---------------------------------------------------------

    sorting_answer = """
    The brute force solution can be improved.

    I can store each value together with its original index,
    sort the values, and then use two pointers from the left
    and right.

    If the sum is smaller than the target I move the left pointer.
    If the sum is larger I move the right pointer.

    Sorting takes O(n log n) time and the additional storage
    is O(n).
    """

    result_2 = session.submit_answer(sorting_answer)

    assert session.state.reference_answer_id == "P001-R2"
    assert session.state.target_reference_id == "P001-R3"
    assert session.finished is False

    assert result_2 is not None
    assert session.state.current_interviewer_question

    # ---------------------------------------------------------
    # TURN 3 - OPTIMAL HASHMAP
    # ---------------------------------------------------------

    optimal_answer = """
    We can make this O(n) using a HashMap.

    I will scan the array once.

    For each number, I calculate target - number and check whether
    that complement is already present in the HashMap.

    If it is present, I return the stored index and the current index.

    Otherwise I store the current number with its index.

    This gives O(n) average time and O(n) space.
    """

    result_3 = session.submit_answer(optimal_answer)

    # Reaching the target reference should stop the interview.
    assert session.state.reference_answer_id == "P001-R3"
    assert session.state.target_reference_id == "P001-R3"
    assert session.finished is True

    assert result_3 is not None

    # ---------------------------------------------------------
    # FINAL STATE
    # ---------------------------------------------------------

    final_state = session.get_final_state()

    assert final_state is not None
    assert final_state.reference_answer_id == "P001-R3"
    assert final_state.target_reference_id == "P001-R3"

    assert len(final_state.history) == 3

    # The conversation should contain evidence from all three turns.
    assert final_state.history[0]["candidate_answer"]
    assert final_state.history[1]["candidate_answer"]
    assert final_state.history[2]["candidate_answer"]

    # ---------------------------------------------------------
    # FINAL RESULT / FEEDBACK
    # ---------------------------------------------------------

    final_result = session.get_final_result()

    assert final_result is not None
    assert isinstance(final_result, dict)

    # Final evaluation should contain accumulated evaluation data.
    assert final_state.scores
    assert final_state.history