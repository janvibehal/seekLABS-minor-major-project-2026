from AI.evaluation.scoring.candidate_state import CandidateNLPState


def test_candidate_nlp_state_is_cumulative_across_turns():

    state = CandidateNLPState()

    turn_1 = CandidateNLPState(
        approach="brute force",
        algorithms=["nested loops"],
        concepts=["pair comparison"],
        operations=["compare every pair"],
        data_structures=[],
        time_complexity="O(n^2)",
        space_complexity="O(1)",
        reasoning_summary="Check every possible pair.",
        edge_cases=[],
        assumptions=[],
        optimization=False,
    )

    state.merge(turn_1)

    assert state.approach == "brute force"
    assert "nested loops" in state.algorithms
    assert "pair comparison" in state.concepts
    assert state.time_complexity == "O(n^2)"


def test_second_turn_preserves_first_turn_information():

    state = CandidateNLPState()

    state.merge(
        CandidateNLPState(
            approach="brute force",
            algorithms=["nested loops"],
            concepts=["pair comparison"],
            operations=["compare every pair"],
            data_structures=[],
            time_complexity="O(n^2)",
            space_complexity="O(1)",
            reasoning_summary="Check every possible pair.",
            edge_cases=[],
            assumptions=[],
            optimization=False,
        )
    )

    state.merge(
        CandidateNLPState(
            approach="hash map",
            algorithms=[],
            concepts=["complement lookup"],
            operations=["hash lookup"],
            data_structures=["hash map"],
            time_complexity="O(n)",
            space_complexity="O(n)",
            reasoning_summary="Store previously seen values for constant-time lookup.",
            edge_cases=["duplicate values"],
            assumptions=[],
            optimization=True,
        )
    )

    # Turn 1 information remains.
    assert "nested loops" in state.algorithms
    assert "pair comparison" in state.concepts

    # Turn 2 information is added.
    assert "complement lookup" in state.concepts
    assert "hash map" in state.data_structures
    assert "hash lookup" in state.operations
    assert "duplicate values" in state.edge_cases

    # Latest explicitly stated values become current.
    assert state.time_complexity == "O(n)"
    assert state.space_complexity == "O(n)"
    assert state.approach == "hash map"
    assert state.optimization is True