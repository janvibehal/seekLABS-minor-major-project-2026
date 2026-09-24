from AI.evaluation.extraction import extraction_service


def test_problem_argument_is_not_forwarded_to_llm(
    monkeypatch,
):
    captured = {}

    def fake_extract_with_llm(
        candidate_answer,
    ):
        captured["candidate_answer"] = candidate_answer

        return {
            "approach": "hash map",
            "algorithms": [],
            "concepts": ["complement lookup"],
            "operations": ["lookup"],
            "data_structures": ["hash map"],
            "time_complexity": "O(n)",
            "space_complexity": "O(n)",
            "reasoning_summary": (
                "Use constant-time lookup."
            ),
            "edge_cases": [],
            "assumptions": [],
            "optimization": True,
        }

    monkeypatch.setattr(
        extraction_service,
        "extract_with_llm",
        fake_extract_with_llm,
    )

    result = (
        extraction_service.extract_candidate_features(
            "I will use a hash map.",
            problem={
                "problem_id": "P001",
                "title": "Two Sum",
            },
        )
    )

    assert (
        captured["candidate_answer"]
        == "I will use a hash map."
    )

    assert result["approach"] == "hash map"
    assert result["data_structures"] == ["hash map"]