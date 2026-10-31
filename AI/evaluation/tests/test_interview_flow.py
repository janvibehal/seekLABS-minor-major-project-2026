"""
Tests for the adaptive turn plumbing and the cumulative interview result.

InterviewSession itself needs live LLM calls, so it is replaced by a
fake that produces real CandidateEvaluationState objects; everything
around it (API, state store, aggregation) runs for real.
"""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from AI.evaluation import api_server, interview_service
from AI.evaluation.dataset_loader import (
    load_evaluation_context,
    resolve_reference_problem_id,
)
from AI.evaluation.persistence.candidate_state_store import (
    CandidateStateStore,
)
from AI.evaluation.scoring.candidate_state import (
    CandidateEvaluationState,
)

client = TestClient(api_server.app)

# A backend question: database id + title, no reference id.
DB_PROBLEM = {"id": "cmq1abc", "title": "Two Sum", "description": "d"}

IDS = {
    "candidate_id": "cand1",
    "session_id": "sess1",
    "question_id": "q1",
}


@pytest.fixture(autouse=True)
def _isolated(monkeypatch, tmp_path):
    monkeypatch.setattr(api_server, "API_ACCESS_KEY", None)
    monkeypatch.setattr(
        interview_service,
        "state_store",
        CandidateStateStore(str(tmp_path)),
    )


class FakeSession:
    """Stands in for InterviewSession; records how it was built."""

    instances = []
    finish_after_submit = False
    already_finished = False
    fail = False

    def __init__(self, **kwargs):
        self.kwargs = kwargs
        self.submitted = []
        store = kwargs["state_store"]

        if store.exists(kwargs["candidate_id"], kwargs["question_id"]):
            self.state = store.load(
                kwargs["candidate_id"], kwargs["question_id"]
            )
        else:
            self.state = CandidateEvaluationState(
                candidate_id=kwargs["candidate_id"],
                question_id=kwargs["question_id"],
            )

        self.finished = FakeSession.already_finished
        FakeSession.instances.append(self)

    def is_finished(self):
        return self.finished

    def submit_answer(self, answer):
        if FakeSession.fail:
            raise RuntimeError("LLM down")

        self.submitted.append(answer)
        self.state.update(
            candidate_answer=answer,
            scores={
                "algorithm_correctness": 80.0,
                "complexity": 60.0,
                "edge_cases": None,
            },
            primary_classification="Correct but Non-Optimal",
            interviewer_question="What about duplicates?",
        )
        self.state.reference_answer_id = "P001-R2"
        self.state.target_reference_id = "P001-R3"
        self.finished = FakeSession.finish_after_submit
        self.kwargs["state_store"].save(self.state)
        return self.state

    def get_state(self):
        return self.state

    def get_next_question(self):
        return None if self.finished else "What about duplicates?"


@pytest.fixture(autouse=True)
def _fake_session(monkeypatch):
    FakeSession.instances = []
    FakeSession.finish_after_submit = False
    FakeSession.already_finished = False
    FakeSession.fail = False
    monkeypatch.setattr(interview_service, "InterviewSession", FakeSession)


def _turn(answer="hash map", **extra):
    body = {"problem": DB_PROBLEM, "candidate_answer": answer, **IDS}
    body.update(extra)
    return client.post("/v1/evaluate/turn", json=body)


# ---------------------------------------------------------------
# reference lookup without recruiter input
# ---------------------------------------------------------------

def test_database_question_resolves_to_references_by_title():

    assert resolve_reference_problem_id(DB_PROBLEM) == "P001"
    assert resolve_reference_problem_id({"title": " two  SUM "}) == "P001"
    assert resolve_reference_problem_id({"id": "P003"}) == "P003"
    assert resolve_reference_problem_id(
        {"id": "x", "title": "Not In Dataset"}
    ) is None

    references, rubric = load_evaluation_context(DB_PROBLEM)

    assert len(references) == 4
    assert rubric is None


# ---------------------------------------------------------------
# adaptive turn
# ---------------------------------------------------------------

def test_turn_runs_the_adaptive_session_and_returns_policy_data():

    response = _turn(time_remaining_seconds=300, max_turns=4)

    assert response.status_code == 200

    data = response.json()["data"]

    assert data["message"] == "What about duplicates?"
    assert data["adaptive"]["enabled"] is True
    assert data["adaptive"]["finished"] is False
    assert data["adaptive"]["matched_reference_id"] == "P001-R2"
    assert data["adaptive"]["target_reference_id"] == "P001-R3"
    assert data["evaluation"]["scores"]["algorithm_correctness"][
        "score"
    ] == 80.0
    assert data["classification"]["primary_classification"] == (
        "Correct but Non-Optimal"
    )

    kwargs = FakeSession.instances[0].kwargs

    assert kwargs["candidate_id"] == "cand1"
    assert kwargs["question_id"] == "sess1_q1"
    assert kwargs["time_remaining"] == 300
    assert kwargs["max_turns"] == 4
    assert kwargs["resume_existing"] is True


def test_default_turn_cap_comes_from_config():

    _turn()

    assert FakeSession.instances[0].kwargs["max_turns"] == (
        interview_service.MAX_TURNS_PER_QUESTION
    )


def test_finished_question_returns_no_next_message():

    FakeSession.finish_after_submit = True

    data = _turn().json()["data"]

    assert data["message"] is None
    assert data["adaptive"]["finished"] is True


def test_finished_question_is_not_evaluated_again():

    FakeSession.already_finished = True

    data = _turn().json()["data"]

    assert FakeSession.instances[0].submitted == []
    assert data["adaptive"]["finished"] is True


def test_adaptive_failure_returns_503():

    FakeSession.fail = True

    assert _turn().status_code == 503


def test_blank_adaptive_answer_is_rejected():

    assert _turn("   ").status_code == 400


def test_unsafe_identifiers_are_rejected():

    assert _turn(candidate_id="../evil").status_code == 422
    assert _turn(session_id="a/b").status_code == 422


def test_without_identifiers_the_stateless_path_is_used():

    with patch.object(
        api_server,
        "extract_candidate_features",
        return_value={"normalized_answer": "a"},
    ), patch.object(
        api_server,
        "evaluate_with_llm",
        return_value={
            "scores": {
                d: {"score": 70, "assessment_status": "ASSESSED"}
                for d in api_server.EVALUATION_DIMENSIONS
            },
            "errors": [],
        },
    ), patch.object(
        api_server,
        "generate_followup_question",
        return_value="Next?",
    ):

        response = client.post(
            "/v1/evaluate/turn",
            json={"problem": DB_PROBLEM, "candidate_answer": "x"},
        )

    assert response.status_code == 200
    assert response.json()["data"]["adaptive"]["enabled"] is False
    assert FakeSession.instances == []


# ---------------------------------------------------------------
# cumulative interview result
# ---------------------------------------------------------------

def _final(questions, **extra):
    body = {
        "candidate_id": "cand1",
        "session_id": "sess1",
        "questions": questions,
        **extra,
    }
    return client.post("/v1/evaluate/final", json=body)


def _question(question_id, answer=""):
    return {
        "question_id": question_id,
        "problem": DB_PROBLEM,
        "candidate_answer": answer,
    }


def test_final_is_the_cumulative_result_of_all_questions():

    # Two adaptive questions, answered in separate turns.
    client.post(
        "/v1/evaluate/turn",
        json={
            "problem": DB_PROBLEM,
            "candidate_answer": "a",
            **{**IDS, "question_id": "q1"},
        },
    )
    client.post(
        "/v1/evaluate/turn",
        json={
            "problem": DB_PROBLEM,
            "candidate_answer": "b",
            **{**IDS, "question_id": "q2"},
        },
    )

    response = _final(
        [_question("q1"), _question("q2"), _question("q3")]
    )

    assert response.status_code == 200

    data = response.json()["data"]

    # Each answered question: mean(80, 60) = 70; q3 unanswered.
    assert data["overallScore"] == 70
    assert data["coverage"] == {"answered": 2, "total": 3}
    assert [q["answered"] for q in data["questions"]] == [
        True,
        True,
        False,
    ]
    assert data["questions"][0]["source"] == "adaptive"

    scores = data["evaluation"]["scores"]

    assert scores["algorithm_correctness"]["score"] == 80
    assert scores["complexity"]["score"] == 60
    assert scores["edge_cases"]["assessment_status"] == "NOT_ASSESSED"


def test_final_with_no_answers_is_zero_not_an_error():

    data = _final([_question("q1")]).json()["data"]

    assert data["overallScore"] == 0
    assert data["coverage"] == {"answered": 0, "total": 1}


def test_final_failure_in_stateless_question_returns_503():

    with patch.object(
        api_server,
        "extract_candidate_features",
        return_value={"normalized_answer": "a"},
    ), patch.object(
        api_server,
        "evaluate_with_llm",
        return_value={
            "scores": {},
            "errors": ["boom"],
            "evaluation_failed": True,
        },
    ):

        response = _final([_question("q9", "my answer")])

    assert response.status_code == 503


def test_aggregate_ignores_unassessed_dimensions_and_questions():

    results = [
        interview_service.question_result(
            "a", "adaptive", {"complexity": 100.0}, {}
        ),
        interview_service.question_result(
            "b", "adaptive", {"complexity": 50.0, "edge_cases": 90.0}, {}
        ),
        interview_service.unanswered_result("c"),
    ]

    aggregate = interview_service.aggregate_question_results(results)

    assert aggregate["scores"]["complexity"]["score"] == 75.0
    assert aggregate["scores"]["edge_cases"]["score"] == 90.0
    assert aggregate["overallScore"] == round((100 + 70) / 2)
    assert (aggregate["answered"], aggregate["total"]) == (2, 3)
