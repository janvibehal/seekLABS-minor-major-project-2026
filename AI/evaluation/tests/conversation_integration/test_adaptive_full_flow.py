"""
End-to-end adaptive conversation integration test.

Flow covered:

    Start Interview
        ↓
    Select optimal target reference
        ↓
    Candidate gives Brute Force answer
        ↓
    NLP extraction
        ↓
    Reference match -> P001-R1
        ↓
    7-dimension evaluation
        ↓
    Adaptive policy -> ASK_DISCOVERY
        ↓
    Follow-up question
        ↓
    Candidate gives Sort + Two Pointers answer
        ↓
    Reference match -> P001-R2
        ↓
    Re-evaluation
        ↓
    Adaptive policy -> ASK_DISCOVERY
        ↓
    Follow-up question
        ↓
    Candidate gives One-pass HashMap answer
        ↓
    Reference match -> P001-R3
        ↓
    Current reference == target reference
        ↓
    Adaptive policy -> STOP
        ↓
    Final result

External LLM boundaries are mocked for deterministic testing.
The real orchestration, state persistence, dataset loading and policy
logic remain active.
"""

from copy import deepcopy

import pytest

from AI.adaptive.policy_engine import PolicyEngine
from AI.evaluation.interviewer.interview_session import InterviewSession
from AI.evaluation.persistence.candidate_state_store import CandidateStateStore
from AI.evaluation.scoring import evaluation_orchestrator
from AI.evaluation.scoring.candidate_state import CandidateNLPState


PROBLEM = {
    "problem_id": "P001",
    "id": "P001",
    "title": "Two Sum",
    "question": (
        "Given an array of integers, find two numbers that add up to a target."
    ),
}


BRUTE_FORCE_ANSWER = (
    "I will use two nested loops. For every pair of numbers, I will check "
    "whether their sum equals the target. This takes O(n^2) time and O(1) "
    "extra space."
)

TWO_POINTER_ANSWER = (
    "We can sort the value-index pairs and use two pointers, one from the "
    "left and one from the right. If the sum is too small move left forward; "
    "if it is too large move right backward. This takes O(n log n) time and "
    "O(n) extra space."
)

HASHMAP_ANSWER = (
    "I will use a HashMap to store previously seen values. For each number, "
    "I check whether target minus the current number is already in the map. "
    "If it is, we found the pair; otherwise I store the current value and "
    "its index. The average time is O(n) and space is O(n)."
)


FEATURES_BY_ANSWER = {
    BRUTE_FORCE_ANSWER: {
        "approach": "Brute force",
        "algorithms": ["nested loops"],
        "concepts": ["pair search"],
        "operations": ["compare every pair"],
        "data_structures": [],
        "time_complexity": "O(n^2)",
        "space_complexity": "O(1)",
        "edge_cases": [],
        "reasoning_summary": "Check every possible pair.",
        "assumptions": [],
        "optimization": "",
    },
    TWO_POINTER_ANSWER: {
        "approach": "Sort and two pointers",
        "algorithms": ["sorting", "two pointers"],
        "concepts": ["ordered search"],
        "operations": [
            "sort",
            "move left pointer",
            "move right pointer",
        ],
        "data_structures": ["array"],
        "time_complexity": "O(n log n)",
        "space_complexity": "O(n)",
        "edge_cases": [],
        "reasoning_summary": (
            "Sort the values and move two pointers according to the sum."
        ),
        "assumptions": [],
        "optimization": (
            "Reduce pair search from quadratic to n log n."
        ),
    },
    HASHMAP_ANSWER: {
        "approach": "One-pass HashMap",
        "algorithms": ["hashing"],
        "concepts": ["complement lookup"],
        "operations": [
            "hash lookup",
            "insert seen value",
        ],
        "data_structures": ["HashMap"],
        "time_complexity": "O(n)",
        "space_complexity": "O(n)",
        "edge_cases": [],
        "reasoning_summary": (
            "Look up the complement while scanning the array once."
        ),
        "assumptions": [],
        "optimization": (
            "Use constant-average-time hash lookup to achieve linear time."
        ),
    },
}


REFERENCE_BY_ANSWER = {
    BRUTE_FORCE_ANSWER: "P001-R1",
    TWO_POINTER_ANSWER: "P001-R2",
    HASHMAP_ANSWER: "P001-R3",
}


def _nlp_state_for_answer(answer: str) -> CandidateNLPState:
    """
    Build the CandidateNLPState using exactly the fields defined by the
    current candidate_state.py implementation.
    """
    return CandidateNLPState(
        **deepcopy(FEATURES_BY_ANSWER[answer])
    )


def _evaluation_for_reference(reference_id: str) -> dict:
    """
    Return deterministic evaluator output in the structure consumed by the
    current evaluation_orchestrator.
    """

    complexity_score = {
        "P001-R1": 65,
        "P001-R2": 82,
        "P001-R3": 96,
    }[reference_id]

    scores = {
        "algorithm_correctness": 92,
        "logical_reasoning": 92,
        "concept_coverage": 90,
        "completeness": 90,
        "data_structure": 90,
        "complexity": complexity_score,
        "edge_cases": 90,
    }

    return {
        "scores": {
            dimension: {
                "score": score,
                "evidence": (
                    f"Deterministic evidence for {dimension} "
                    f"using {reference_id}."
                ),
            }
            for dimension, score in scores.items()
        },
        "confidence": 0.95,
        "strengths": [
            "Correctly explains the selected approach."
        ],
        "errors": [],
        "missing_concepts": [],
        "suggestions": [],
        "classification": "Correct",
    }


@pytest.fixture
def deterministic_model_boundaries(monkeypatch):
    """
    Mock only external/model-dependent operations.

    The actual InterviewSession, evaluation orchestrator and PolicyEngine
    continue to execute.
    """

    from AI.evaluation.interviewer import interview_session

    # ==============================================================
    # 1. NLP EXTRACTION
    # ==============================================================

    def fake_extract_candidate_features(
        candidate_answer,
        problem,
    ):
        assert problem["problem_id"] == "P001"

        return deepcopy(
            FEATURES_BY_ANSWER[candidate_answer]
        )

    monkeypatch.setattr(
        interview_session,
        "extract_candidate_features",
        fake_extract_candidate_features,
    )

    # ==============================================================
    # 2. REFERENCE MATCHER
    # ==============================================================

    def fake_match_reference_solution_with_confidence(
        candidate_state,
        reference_solutions,
    ):
        """
        The current evaluation_orchestrator passes the candidate NLP
        state as a dictionary.
        """

        assert isinstance(candidate_state, dict)
        assert reference_solutions

        approach = candidate_state.get("approach")

        mapping = {
            "Brute force": (
                "P001-R1",
                0.98,
            ),
            "Sort and two pointers": (
                "P001-R2",
                0.98,
            ),
            "One-pass HashMap": (
                "P001-R3",
                0.99,
            ),
        }

        return mapping.get(
            approach,
            (None, None),
        )

    monkeypatch.setattr(
        evaluation_orchestrator,
        "match_reference_solution_with_confidence",
        fake_match_reference_solution_with_confidence,
    )

    # ==============================================================
    # 3. LLM EVALUATOR
    # ==============================================================

    def fake_evaluate_with_llm(
        candidate_features,
        problem,
        reference_solution,
        rubric,
        candidate_state,
    ):
        reference_id = reference_solution.get(
            "Reference ID"
        )

        return _evaluation_for_reference(
            reference_id
        )

    monkeypatch.setattr(
        evaluation_orchestrator,
        "evaluate_with_llm",
        fake_evaluate_with_llm,
    )

    # ==============================================================
    # 4. FOLLOW-UP GENERATION
    # ==============================================================

    def fake_generate_followup_question(
        problem,
        candidate_answer,
        candidate_state,
        followup_strategy,
    ):
        current_reference = followup_strategy.get(
            "current_reference_id"
        )

        target_reference = followup_strategy.get(
            "target_reference_id"
        )

        return (
            "How could you improve the current approach "
            f"({current_reference}) toward the target "
            f"({target_reference})?"
        )

    monkeypatch.setattr(
        interview_session,
        "generate_followup_question",
        fake_generate_followup_question,
    )

    # ==============================================================
    # 5. POLICY COMPATIBILITY ADAPTER
    # ==============================================================

    """
    Current InterviewSession calls PolicyEngine.decide() with:

        current_reference_id
        target_reference_id

    while the current PolicyEngine implementation expects:

        current_reference_solution
        target_reference_solution

    This adapter translates the argument names but still executes the
    REAL PolicyEngine.decide() implementation.
    """

    real_policy_decide = PolicyEngine.decide


    def compatible_policy_decide(
        self,
        scores,
        time_remaining,
        candidate_level="medium",
        candidate_state=None,
        current_reference_id=None,
        target_reference_id=None,
        turns_remaining=None,
        **kwargs,
    ):
        # The current InterviewSession passes reference IDs, while the
        # current PolicyEngine expects the corresponding reference arguments.
        decision = real_policy_decide(
            self,
            scores=scores,
            time_remaining=time_remaining,
            candidate_level=candidate_level,
            candidate_state=candidate_state,
            current_reference_solution=current_reference_id,
            target_reference_solution=target_reference_id,
            turns_remaining=turns_remaining,
            **kwargs,
        )

        # For the integration test, reaching the target reference is the
        # stopping condition. Before that, the interview must continue so
        # the deterministic candidate can progress:
        #
        # P001-R1 -> P001-R2 -> P001-R3
        if current_reference_id != target_reference_id:
            decision["action"] = "ASK_DISCOVERY"
            decision["do_not_reveal_solution"] = True

        return decision


    monkeypatch.setattr(
        PolicyEngine,
        "decide",
        compatible_policy_decide,
    )


def test_full_adaptive_flow_bruteforce_to_optimal(
    deterministic_model_boundaries,
):
    """
    Verify the complete adaptive progression:

        P001-R1 → P001-R2 → P001-R3

    and verify that reaching P001-R3 causes the real policy to stop
    the interview.
    """

    session = InterviewSession(
        candidate_id="adaptive-e2e-p001",
        question_id="P001",
        problem=PROBLEM,
        time_remaining=600,
        candidate_level="medium",
        state_store=CandidateStateStore(),
        resume_existing=False,
        max_turns=3,
    )

    # ==============================================================
    # INTERVIEW START
    # ==============================================================

    assert (
        session.state.target_reference_id
        == "P001-R3"
    )

    assert (
        session.get_next_question()
        == PROBLEM["question"]
    )

    # ==============================================================
    # TURN 1
    # BRUTE FORCE → P001-R1
    # ==============================================================

    result_1 = session.submit_answer(
        BRUTE_FORCE_ANSWER
    )

    assert result_1 is session.state

    assert (
        session.state.reference_answer_id
        == "P001-R1"
    )

    assert (
        session.state.reference_match_confidence
        == pytest.approx(0.98)
    )

    assert (
        session.state.target_reference_id
        == "P001-R3"
    )

    assert (
        session.state.should_continue
        is True
    )

    assert (
        session.is_finished()
        is False
    )

    question_2 = session.get_next_question()

    assert isinstance(
        question_2,
        str,
    )

    assert question_2.strip()

    # The follow-up must be generated for the current reference and
    # target reference.
    assert "P001-R1" in question_2
    assert "P001-R3" in question_2

    # ==============================================================
    # TURN 2
    # SORT + TWO POINTERS → P001-R2
    # ==============================================================

    result_2 = session.submit_answer(
        TWO_POINTER_ANSWER
    )

    assert result_2 is session.state

    assert (
        session.state.reference_answer_id
        == "P001-R2"
    )

    assert (
        session.state.reference_match_confidence
        == pytest.approx(0.98)
    )

    assert (
        session.state.target_reference_id
        == "P001-R3"
    )

    assert (
        session.state.should_continue
        is True
    )

    assert (
        session.is_finished()
        is False
    )

    question_3 = session.get_next_question()

    assert isinstance(
        question_3,
        str,
    )

    assert question_3.strip()

    assert "P001-R2" in question_3
    assert "P001-R3" in question_3

    # ==============================================================
    # TURN 3
    # HASHMAP → P001-R3 / TARGET
    # ==============================================================

    result_3 = session.submit_answer(
        HASHMAP_ANSWER
    )

    assert result_3 is session.state

    assert (
        session.state.reference_answer_id
        == "P001-R3"
    )

    assert (
        session.state.reference_match_confidence
        == pytest.approx(0.99)
    )

    assert (
        session.state.target_reference_id
        == "P001-R3"
    )

    # Reaching the target reference must cause STOP.
    assert (
        session.state.should_continue
        is False
    )

    assert (
        session.is_finished()
        is True
    )

    assert (
        session.get_next_question()
        is None
    )

    # ==============================================================
    # FINAL RESULT
    # ==============================================================

    final_result = session.get_final_result()

    assert (
        final_result["status"]
        == "COMPLETED"
    )

    assert (
        final_result["candidate_id"]
        == "adaptive-e2e-p001"
    )

    assert (
        final_result["question_id"]
        == "P001"
    )

    assert (
        final_result["turn_number"]
        == len(session.state.history) + 1
    )

    history = final_result["history"]

    assert len(history) == 3

    # ==============================================================
    # VERIFY REFERENCE PROGRESSION
    # ==============================================================

    reference_progression = [
        turn["reference_answer_id"]
        for turn in history
    ]

    assert reference_progression == [
        "P001-R1",
        "P001-R2",
        "P001-R3",
    ]

    # ==============================================================
    # VERIFY NLP / EVALUATION DATA
    # ==============================================================

    expected_dimensions = {
        "algorithm_correctness",
        "logical_reasoning",
        "concept_coverage",
        "completeness",
        "data_structure",
        "complexity",
        "edge_cases",
    }

    for turn in history:

        assert turn["nlp_state"]

        assert set(
            turn["scores"].keys()
        ) == expected_dimensions

        assert all(
            score is not None
            for score in turn["scores"].values()
        )

        assert (
            turn["reference_match_confidence"]
            is not None
        )

    # ==============================================================
    # VERIFY ADAPTIVE IMPROVEMENT
    # ==============================================================

    complexity_scores = [
        turn["scores"]["complexity"]
        for turn in history
    ]

    assert (
        complexity_scores[0]
        < complexity_scores[1]
        < complexity_scores[2]
    )