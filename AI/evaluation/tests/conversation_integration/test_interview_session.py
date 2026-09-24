from pathlib import Path

import pytest

from AI.evaluation.interviewer.interview_session import InterviewSession
from AI.evaluation.persistence.candidate_state_store import CandidateStateStore
from AI.evaluation.scoring.candidate_state import CandidateEvaluationState


PROBLEM = {
    "problem_id": "P001",
    "id": "P001",
    "title": "Two Sum",
    "question": "Given an array of integers, find two numbers that add up to a target.",
}


REFERENCES = [
    {
        "Reference ID": "P001-R1",
        "Approach": "Brute force",
        "Time Complexity": "O(n^2)",
        "Space Complexity": "O(1)",
    },
    {
        "Reference ID": "P001-R2",
        "Approach": "Sort and two pointers",
        "Time Complexity": "O(n log n)",
        "Space Complexity": "O(n)",
    },
    {
        "Reference ID": "P001-R3",
        "Approach": "One-pass HashMap",
        "Time Complexity": "O(n)",
        "Space Complexity": "O(n)",
    },
]


def make_store(tmp_path: Path) -> CandidateStateStore:
    return CandidateStateStore(
        root_dir=str(tmp_path / "states")
    )


def test_initial_question_uses_problem_question(tmp_path, monkeypatch):
    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.load_evaluation_context",
        lambda problem: (REFERENCES, {}),
    )

    session = InterviewSession(
        candidate_id="candidate-1",
        question_id="P001",
        problem=PROBLEM,
        max_turns=3,
        time_remaining=600,
        state_store=make_store(tmp_path),
    )

    assert session.get_next_question() == PROBLEM["question"]


def test_initial_question_falls_back_to_title(tmp_path, monkeypatch):
    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.load_evaluation_context",
        lambda problem: (REFERENCES, {}),
    )

    problem = {
        "problem_id": "P001",
        "title": "Two Sum",
    }

    session = InterviewSession(
        candidate_id="candidate-2",
        question_id="P001",
        problem=problem,
        max_turns=3,
        time_remaining=600,
        state_store=make_store(tmp_path),
    )

    assert (
        session.get_next_question()
        == "Please explain your approach for solving Two Sum."
    )


def test_initial_question_has_generic_fallback(tmp_path, monkeypatch):
    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.load_evaluation_context",
        lambda problem: (REFERENCES, {}),
    )

    session = InterviewSession(
        candidate_id="candidate-3",
        question_id="P001",
        problem={"problem_id": "P001"},
        max_turns=3,
        time_remaining=600,
        state_store=make_store(tmp_path),
    )

    assert (
        session.get_next_question()
        == "Please explain your approach for solving the problem."
    )


def test_resume_preserves_existing_interviewer_question(
    tmp_path,
    monkeypatch,
):
    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.load_evaluation_context",
        lambda problem: (REFERENCES, {}),
    )

    store = make_store(tmp_path)

    state = CandidateEvaluationState(
        candidate_id="candidate-resume",
        question_id="P001",
        target_reference_id="P001-R3",
        current_interviewer_question="How would you improve the complexity?",
        should_continue=True,
    )

    store.save(state)

    session = InterviewSession(
        candidate_id="candidate-resume",
        question_id="P001",
        problem=PROBLEM,
        max_turns=4,
        time_remaining=600,
        state_store=store,
        resume_existing=True,
    )

    assert (
        session.get_next_question()
        == "How would you improve the complexity?"
    )


def test_target_reference_is_selected_and_persisted(
    tmp_path,
    monkeypatch,
):
    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.load_evaluation_context",
        lambda problem: (REFERENCES, {}),
    )

    select_target = lambda references: "P001-R3"

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.PolicyEngine.select_target_reference",
        lambda self, references: select_target(references),
    )

    store = make_store(tmp_path)

    session = InterviewSession(
        candidate_id="candidate-target",
        question_id="P001",
        problem=PROBLEM,
        max_turns=3,
        time_remaining=600,
        state_store=store,
    )

    assert session.get_state().target_reference_id == "P001-R3"

    saved = store.load(
        "candidate-target",
        "P001",
    )

    assert saved.target_reference_id == "P001-R3"


def test_saved_target_reference_is_reused_on_resume(
    tmp_path,
    monkeypatch,
):
    store = make_store(tmp_path)

    state = CandidateEvaluationState(
        candidate_id="candidate-target-resume",
        question_id="P001",
        target_reference_id="P001-R3",
        current_interviewer_question=PROBLEM["question"],
        should_continue=True,
    )

    store.save(state)

    def fail_if_target_is_selected_again(self, references):
        raise AssertionError(
            "Target reference should not be selected again on resume."
        )

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.PolicyEngine.select_target_reference",
        fail_if_target_is_selected_again,
    )

    session = InterviewSession(
        candidate_id="candidate-target-resume",
        question_id="P001",
        problem=PROBLEM,
        max_turns=3,
        time_remaining=600,
        state_store=store,
        resume_existing=True,
    )

    assert session.get_state().target_reference_id == "P001-R3"


def test_submit_answer_connects_evaluation_policy_and_followup(
    tmp_path,
    monkeypatch,
):
    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.load_evaluation_context",
        lambda problem: (REFERENCES, {}),
    )

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.extract_candidate_features",
        lambda answer, problem: {
            "approach": "brute force",
            "algorithms": ["nested loops"],
            "concepts": ["array"],
            "operations": ["comparison"],
            "data_structures": ["array"],
            "time_complexity": "O(n^2)",
            "space_complexity": "O(1)",
            "edge_cases": [],
            "reasoning_summary": "Try every pair.",
            "assumptions": [],
            "optimization": None,
        },
    )

    def fake_evaluate(
        state,
        candidate_answer,
        problem,
        candidate_features,
    ):
        state.reference_answer_id = "P001-R1"
        state.reference_match_confidence = 0.95

        state.update(
            candidate_answer=candidate_answer,
            scores={
                "algorithm_correctness": 80.0,
                "logical_reasoning": 80.0,
                "concept_coverage": 70.0,
                "completeness": 70.0,
                "data_structure": 60.0,
                "complexity": 50.0,
                "edge_cases": 60.0,
            },
            primary_classification="Partially Correct",
            secondary_classification=None,
            adaptive_classifications=[],
            primary_adaptive_gap=None,
            evidence={},
        )

        return state

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.evaluate_candidate_turn",
        fake_evaluate,
    )

    policy_calls = []

    def fake_decide(self, **kwargs):
        policy_calls.append(kwargs)

        return {
            "action": "ASK_DISCOVERY",
            "reason": "Move toward the target reference.",
            "goal": "Improve complexity",
            "target_dimension": "complexity",
        }

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.PolicyEngine.decide",
        fake_decide,
    )

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.generate_followup_question",
        lambda **kwargs: "Can you reduce the time complexity?",
    )

    store = make_store(tmp_path)

    session = InterviewSession(
        candidate_id="candidate-cycle",
        question_id="P001",
        problem=PROBLEM,
        max_turns=3,
        time_remaining=600,
        state_store=store,
    )

    state = session.submit_answer(
        "I will check every pair.",
    )

    assert state.reference_answer_id == "P001-R1"
    assert state.target_reference_id == "P001-R3"
    assert state.current_interviewer_question == (
        "Can you reduce the time complexity?"
    )
    assert state.should_continue is True

    assert len(policy_calls) == 1
    assert policy_calls[0]["current_reference_id"] == "P001-R1"
    assert policy_calls[0]["target_reference_id"] == "P001-R3"

    reloaded = store.load(
        "candidate-cycle",
        "P001",
    )

    assert (
        reloaded.current_interviewer_question
        == "Can you reduce the time complexity?"
    )
    assert reloaded.should_continue is True


def test_current_reference_reaches_target_and_session_stops(
    tmp_path,
    monkeypatch,
):
    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.load_evaluation_context",
        lambda problem: (REFERENCES, {}),
    )

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.extract_candidate_features",
        lambda answer, problem: {
            "approach": "hashmap",
            "algorithms": ["hash lookup"],
            "concepts": ["hashing"],
            "operations": ["lookup"],
            "data_structures": ["hashmap"],
            "time_complexity": "O(n)",
            "space_complexity": "O(n)",
            "edge_cases": [],
            "reasoning_summary": "Store previously seen values.",
            "assumptions": [],
            "optimization": "One pass.",
        },
    )

    def fake_evaluate(
        state,
        candidate_answer,
        problem,
        candidate_features,
    ):
        state.reference_answer_id = "P001-R3"
        state.reference_match_confidence = 0.99

        state.update(
            candidate_answer=candidate_answer,
            scores={},
            primary_classification="Correct",
            secondary_classification=None,
            adaptive_classifications=[],
            primary_adaptive_gap=None,
            evidence={},
        )

        return state

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.evaluate_candidate_turn",
        fake_evaluate,
    )

    policy_calls = []

    def fake_decide(self, **kwargs):
        policy_calls.append(kwargs)

        return {
            "action": "STOP",
            "reason": "Current reference has reached target reference.",
        }

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.PolicyEngine.decide",
        fake_decide,
    )

    followup_calls = []

    def fake_followup(**kwargs):
        followup_calls.append(kwargs)
        return "This question should never be generated."

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.generate_followup_question",
        fake_followup,
    )

    store = make_store(tmp_path)

    session = InterviewSession(
        candidate_id="candidate-stop",
        question_id="P001",
        problem=PROBLEM,
        max_turns=3,
        time_remaining=600,
        state_store=store,
    )

    state = session.submit_answer(
        "Use a HashMap in one pass.",
    )

    assert state.reference_answer_id == "P001-R3"
    assert state.target_reference_id == "P001-R3"
    assert state.should_continue is False
    assert session.is_finished() is True

    assert len(policy_calls) == 1
    assert len(followup_calls) == 0


def test_followup_question_survives_reload(
    tmp_path,
    monkeypatch,
):
    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.load_evaluation_context",
        lambda problem: (REFERENCES, {}),
    )

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.extract_candidate_features",
        lambda answer, problem: {},
    )

    def fake_evaluate(
        state,
        candidate_answer,
        problem,
        candidate_features,
    ):
        state.reference_answer_id = "P001-R1"

        state.update(
            candidate_answer=candidate_answer,
            scores={},
            primary_classification="Partially Correct",
            secondary_classification=None,
            adaptive_classifications=[],
            primary_adaptive_gap=None,
            evidence={},
        )

        return state

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.evaluate_candidate_turn",
        fake_evaluate,
    )

    def fake_decide(self, **kwargs):
        return {
            "action": "ASK_DISCOVERY",
            "reason": "Continue discovery.",
            "goal": "Improve approach",
            "target_dimension": "algorithm",
        }


    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.PolicyEngine.decide",
        fake_decide,
    )

    expected_question = (
        "What change would let you avoid checking every pair?"
    )

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.generate_followup_question",
        lambda **kwargs: expected_question,
    )

    store = make_store(tmp_path)

    session = InterviewSession(
        candidate_id="candidate-followup",
        question_id="P001",
        problem=PROBLEM,
        max_turns=3,
        time_remaining=600,
        state_store=store,
    )

    session.submit_answer(
        "I will compare every pair."
    )

    resumed = InterviewSession(
        candidate_id="candidate-followup",
        question_id="P001",
        problem=PROBLEM,
        max_turns=3,
        time_remaining=600,
        state_store=store,
        resume_existing=True,
    )

    assert resumed.get_next_question() == expected_question


def test_max_turn_limit_prevents_another_followup(
    tmp_path,
    monkeypatch,
):
    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.load_evaluation_context",
        lambda problem: (REFERENCES, {}),
    )

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.extract_candidate_features",
        lambda answer, problem: {},
    )

    def fake_evaluate(
        state,
        candidate_answer,
        problem,
        candidate_features,
    ):
        state.reference_answer_id = "P001-R1"

        state.update(
            candidate_answer=candidate_answer,
            scores={},
            primary_classification="Partially Correct",
            secondary_classification=None,
            adaptive_classifications=[],
            primary_adaptive_gap=None,
            evidence={},
        )

        return state

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.evaluate_candidate_turn",
        fake_evaluate,
    )

    policy_calls = []

    def fake_policy(**kwargs):
        policy_calls.append(kwargs)
        return {
            "action": "ASK_DISCOVERY",
            "reason": "Continue.",
            "goal": "Improve",
            "target_dimension": "complexity",
        }

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.PolicyEngine.decide",
        fake_policy,
    )

    followup_calls = []

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.generate_followup_question",
        lambda **kwargs: followup_calls.append(kwargs)
        or "Another question",
    )

    session = InterviewSession(
        candidate_id="candidate-limit",
        question_id="P001",
        problem=PROBLEM,
        max_turns=1,
        time_remaining=600,
        state_store=make_store(tmp_path),
    )

    state = session.submit_answer(
        "My answer."
    )

    assert state.should_continue is False
    assert session.is_finished() is True

    # Conversation-layer hard limit means policy/follow-up
    # should not be allowed to continue after the final turn.
    assert len(policy_calls) == 0
    assert len(followup_calls) == 0


def test_timer_limit_prevents_followup(
    tmp_path,
    monkeypatch,
):
    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.load_evaluation_context",
        lambda problem: (REFERENCES, {}),
    )

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.extract_candidate_features",
        lambda answer, problem: {},
    )

    def fake_evaluate(
        state,
        candidate_answer,
        problem,
        candidate_features,
    ):
        state.reference_answer_id = "P001-R1"

        state.update(
            candidate_answer=candidate_answer,
            scores={},
            primary_classification="Partially Correct",
            secondary_classification=None,
            adaptive_classifications=[],
            primary_adaptive_gap=None,
            evidence={},
        )

        return state

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.evaluate_candidate_turn",
        fake_evaluate,
    )

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.PolicyEngine.decide",
        lambda **kwargs: pytest.fail(
            "Policy should not be called after the timer expires."
        ),
    )

    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.generate_followup_question",
        lambda **kwargs: pytest.fail(
            "Follow-up should not be generated after the timer expires."
        ),
    )

    store = make_store(tmp_path)

    session = InterviewSession(
        candidate_id="candidate-timer",
        question_id="P001",
        problem=PROBLEM,
        max_turns=5,
        time_remaining=600,
        state_store=store,
    )

    monkeypatch.setattr(
        session.timer_service,
        "get_time_remaining",
        lambda: 0,
    )

    state = session.submit_answer(
        "My answer."
    )

    assert state.should_continue is False
    assert session.is_finished() is True


def test_completed_saved_session_reopens_as_finished(
    tmp_path,
    monkeypatch,
):
    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.load_evaluation_context",
        lambda problem: (REFERENCES, {}),
    )

    store = make_store(tmp_path)

    state = CandidateEvaluationState(
        candidate_id="candidate-completed",
        question_id="P001",
        reference_answer_id="P001-R3",
        target_reference_id="P001-R3",
        current_answer="Use a HashMap.",
        current_interviewer_question="Use a HashMap.",
        should_continue=False,
    )

    state.history.append(
        {
            "turn_number": 1,
            "candidate_answer": "Use a HashMap.",
            "reference_answer_id": "P001-R3",
            "target_reference_id": "P001-R3",
            "current_interviewer_question": "Use a HashMap.",
        }
    )

    store.save(state)

    session = InterviewSession(
        candidate_id="candidate-completed",
        question_id="P001",
        problem=PROBLEM,
        max_turns=5,
        time_remaining=600,
        state_store=store,
        resume_existing=True,
    )

    assert session.is_finished() is True
    assert session.get_next_question() is None


def test_final_result_is_only_available_after_finish(
    tmp_path,
    monkeypatch,
):
    monkeypatch.setattr(
        "evaluation.interviewer.interview_session.load_evaluation_context",
        lambda problem: (REFERENCES, {}),
    )

    store = make_store(tmp_path)

    active_session = InterviewSession(
        candidate_id="candidate-final-active",
        question_id="P001",
        problem=PROBLEM,
        max_turns=3,
        time_remaining=600,
        state_store=store,
    )

    with pytest.raises(RuntimeError):
        active_session.get_final_result()

    finished_state = CandidateEvaluationState(
        candidate_id="candidate-final-done",
        question_id="P001",
        target_reference_id="P001-R3",
        reference_answer_id="P001-R3",
        should_continue=False,
    )

    finished_state.history.append(
        {
            "turn_number": 1,
            "candidate_answer": "Use HashMap.",
            "reference_answer_id": "P001-R3",
            "target_reference_id": "P001-R3",
        }
    )

    store.save(finished_state)

    finished_session = InterviewSession(
        candidate_id="candidate-final-done",
        question_id="P001",
        problem=PROBLEM,
        max_turns=3,
        time_remaining=600,
        state_store=store,
        resume_existing=True,
    )

    assert finished_session.is_finished() is True

    result = finished_session.get_final_result()

    assert result is not None