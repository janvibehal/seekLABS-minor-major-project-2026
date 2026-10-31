from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from AI.evaluation import api_server
from AI.evaluation.problem_provider import (
    LeetCodeAPIError,
    ProblemProviderError,
)
from AI.evaluation.scoring.dimensions import EVALUATION_DIMENSIONS

client = TestClient(api_server.app)

PROBLEM = {"problem_id": "P001", "title": "Two Sum"}


def _assessed(score):
    return {
        "score": score,
        "assessment_status": "ASSESSED",
        "evidence": "x",
    }


def _good_evaluation(score=80):
    return {
        "scores": {d: _assessed(score) for d in EVALUATION_DIMENSIONS},
        "errors": [],
    }


def _failed_evaluation():
    return {
        "scores": {
            d: {
                "score": None,
                "assessment_status": "NOT_ASSESSED",
                "evidence": "x",
            }
            for d in EVALUATION_DIMENSIONS
        },
        "errors": ["LLM evaluation request failed: boom"],
        "evaluation_failed": True,
    }


def _final(answer="I would use a hash map."):
    return client.post(
        "/v1/evaluate/final",
        json={"problem": PROBLEM, "candidate_answer": answer},
    )


@pytest.fixture(autouse=True)
def _no_auth(monkeypatch):
    monkeypatch.setattr(api_server, "API_ACCESS_KEY", None)


def test_final_passes_references_but_no_rubric_to_the_evaluator():

    with patch.object(
        api_server,
        "extract_candidate_features",
        return_value={"normalized_answer": "a"},
    ), patch.object(
        api_server,
        "load_evaluation_context",
        return_value=([{"reference_id": "R1"}], None),
    ), patch.object(
        api_server,
        "evaluate_with_llm",
        return_value=_good_evaluation(80),
    ) as evaluate:

        response = _final()

    assert response.status_code == 200
    assert response.json()["data"]["overallScore"] == 80

    kwargs = evaluate.call_args.kwargs
    assert kwargs["reference_solution"] == [{"reference_id": "R1"}]
    assert kwargs["rubric"] is None


def test_final_still_works_when_problem_has_no_reference_data():

    with patch.object(
        api_server,
        "extract_candidate_features",
        return_value={"normalized_answer": "a"},
    ), patch.object(
        api_server,
        "load_evaluation_context",
        side_effect=FileNotFoundError("none"),
    ), patch.object(
        api_server,
        "evaluate_with_llm",
        return_value=_good_evaluation(60),
    ) as evaluate:

        response = _final()

    assert response.status_code == 200
    assert evaluate.call_args.kwargs["reference_solution"] is None
    assert evaluate.call_args.kwargs["rubric"] is None


def test_failed_llm_evaluation_is_not_reported_as_a_score():

    with patch.object(
        api_server,
        "extract_candidate_features",
        return_value={"normalized_answer": "a"},
    ), patch.object(
        api_server,
        "load_evaluation_context",
        return_value=([], None),
    ), patch.object(
        api_server,
        "evaluate_with_llm",
        return_value=_failed_evaluation(),
    ):

        final = _final()

        turn = client.post(
            "/v1/evaluate/turn",
            json={"problem": PROBLEM, "candidate_answer": "x"},
        )

    assert final.status_code == 503
    assert turn.status_code == 503


def test_empty_final_answer_keeps_the_same_response_keys():

    response = _final("   ")

    assert response.status_code == 200

    data = response.json()["data"]

    assert data["overallScore"] == 0
    assert "features" in data
    assert set(data["evaluation"]["scores"]) == set(EVALUATION_DIMENSIONS)


def test_oversized_answer_is_rejected():

    response = _final("x" * (api_server.MAX_CANDIDATE_ANSWER_CHARS + 1))

    assert response.status_code == 422


def test_invalid_search_parameters_return_400_not_502():

    response = client.get(
        "/v1/problems/search",
        params={"difficulty": "IMPOSSIBLE"},
    )

    assert response.status_code == 400


def test_get_problem_distinguishes_missing_from_upstream_failure():

    with patch.object(
        api_server.problem_provider,
        "get_problem",
        side_effect=ProblemProviderError("not found"),
    ):
        assert client.get("/v1/problems/nope").status_code == 404

    with patch.object(
        api_server.problem_provider,
        "get_problem",
        side_effect=LeetCodeAPIError("upstream down"),
    ):
        assert client.get("/v1/problems/two-sum").status_code == 502


def test_api_key_is_enforced_only_when_configured(monkeypatch):

    monkeypatch.setattr(api_server, "API_ACCESS_KEY", "secret")

    assert _final("   ").status_code == 401

    ok = client.post(
        "/v1/evaluate/final",
        json={"problem": PROBLEM, "candidate_answer": "   "},
        headers={"X-API-Key": "secret"},
    )

    assert ok.status_code == 200
    assert client.get("/health").status_code == 200
