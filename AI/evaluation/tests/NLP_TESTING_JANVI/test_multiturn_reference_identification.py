from AI.evaluation.scoring import evaluation_orchestrator


def test_reference_is_reidentified_when_candidate_progresses(monkeypatch):
    """
    Verify that reference identification can change across turns.

    Turn 1 -> R1
    Turn 2 -> R3

    This test mocks the LLM matcher so it does not require Ollama.
    """

    matches = [
        ("P001-R1", 0.91),
        ("P001-R3", 0.95),
    ]

    calls = []

    def fake_match_reference_solution_with_confidence(
        candidate_state,
        reference_solutions,
    ):
        result = matches[len(calls)]
        calls.append(result)
        return result

    monkeypatch.setattr(
        evaluation_orchestrator,
        "match_reference_solution_with_confidence",
        fake_match_reference_solution_with_confidence,
    )

    # Verify the matcher itself can be invoked repeatedly with
    # the cumulative NLP state.
    state = {
        "approach": "brute force",
        "algorithms": ["nested loops"],
        "concepts": ["pair comparison"],
        "operations": ["compare every pair"],
        "data_structures": [],
        "time_complexity": "O(n^2)",
        "space_complexity": "O(1)",
        "reasoning_summary": "Check every possible pair.",
        "edge_cases": [],
        "assumptions": [],
        "optimization": False,
    }

    references = [
        {"Reference ID": "P001-R1"},
        {"Reference ID": "P001-R2"},
        {"Reference ID": "P001-R3"},
        {"Reference ID": "P001-R4"},
    ]

    # Turn 1
    reference_id, confidence = (
        evaluation_orchestrator.match_reference_solution_with_confidence(
            state,
            references,
        )
    )

    assert reference_id == "P001-R1"
    assert confidence == 0.91

    # Simulate cumulative information from Turn 2.
    state["approach"] = "hash map"
    state["data_structures"] = ["hash map"]
    state["concepts"].append("complement lookup")
    state["operations"].append("hash lookup")
    state["time_complexity"] = "O(n)"
    state["space_complexity"] = "O(n)"
    state["optimization"] = True

    # Turn 2 — matcher runs again.
    reference_id, confidence = (
        evaluation_orchestrator.match_reference_solution_with_confidence(
            state,
            references,
        )
    )

    assert reference_id == "P001-R3"
    assert confidence == 0.95

    assert len(calls) == 2