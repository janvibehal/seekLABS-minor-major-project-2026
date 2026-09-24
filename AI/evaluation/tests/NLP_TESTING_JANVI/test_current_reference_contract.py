from AI.evaluation.scoring.reference_matcher import (
    build_current_reference_context,
)


def test_current_reference_contract_contains_current_reference_only():

    problem = {
        "problem_id": "P001",
    }

    context = build_current_reference_context(
        problem=problem,
        reference_id="P001-R3",
        match_confidence=0.94,
    )

    assert context is not None

    assert context["reference_id"] == "P001-R3"
    assert context["match_confidence"] == 0.94

    assert context["solution_type"] is not None
    assert context["expected_approach"] is not None
    assert context["data_structures"] is not None
    assert context["time_complexity"] is not None
    assert context["space_complexity"] is not None

    assert "next_better_reference_id" in context

    # Janvi must NOT decide whether this is the optimal target.
    assert "is_optimal_target" not in context
    assert "Is Optimal Target" not in context


def test_missing_reference_returns_none():

    problem = {
        "problem_id": "P001",
    }

    context = build_current_reference_context(
        problem=problem,
        reference_id=None,
        match_confidence=None,
    )

    assert context is None