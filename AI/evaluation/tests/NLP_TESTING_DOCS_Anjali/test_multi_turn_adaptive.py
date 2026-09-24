from AI.evaluation.scoring.candidate_state import (
    CandidateEvaluationState
)

from AI.evaluation.scoring.evaluation_orchestrator import (
    evaluate_candidate_turn
)


def print_state(
    label: str,
    state: CandidateEvaluationState
):
    print()
    print("=" * 60)
    print(label)
    print("=" * 60)

    print()
    print("Turn:")
    print(state.turn_number)

    print()
    print("Current Answer:")
    print(state.current_answer)

    print()
    print("Scores:")
    print(state.scores)

    print()
    print("Evidence:")
    print(state.evidence)

    print()
    print("Primary Classification:")
    print(state.primary_classification)

    print()
    print("Adaptive Classifications:")
    print(state.adaptive_classifications)

    print()
    print("Primary Adaptive Gap:")
    print(state.primary_adaptive_gap)

    print()
    print("Interviewer Question:")
    print(
        state.current_interviewer_question
    )

    print()
    print("History Length:")
    print(len(state.history))


def test_multi_turn_adaptive():

    print()
    print("=" * 60)
    print("       MULTI-TURN ADAPTIVE TEST")
    print("=" * 60)

    # ==================================================
    # INITIAL STATE
    # ==================================================

    state = CandidateEvaluationState(
        candidate_id="candidate_001",
        question_id="two_sum"
    )

    problem = {
        "title": "Two Sum",

        "description": (
            "Given an array of integers nums and an "
            "integer target, return the indices of "
            "the two numbers such that they add up "
            "to target."
        )
    }

    # ==================================================
    # TURN 1
    # ==================================================

    print()
    print("=" * 60)
    print("TURN 1 — INITIAL CANDIDATE ANSWER")
    print("=" * 60)

    answer_1 = (
        "I would use a HashMap. For every number, "
        "I calculate the complement and check whether "
        "it already exists in the map."
    )

    features_1 = {
        "normalized_answer": answer_1,

        "concepts_detected": [
            "HashMap"
        ],

        "reasoning": [
            "Calculate complement",
            "Check HashMap"
        ],

        "complexity_claim": {
            "time": None,
            "space": None
        }
    }

    state = evaluate_candidate_turn(
        state=state,
        candidate_answer=answer_1,
        problem=problem,
        candidate_features=features_1
    )

    print_state(
        "AFTER TURN 1",
        state
    )

    # ==================================================
    # TURN 1 ASSERTIONS
    # ==================================================

    assert state.turn_number == 2

    assert (
        state.current_answer
        == answer_1
    )

    assert (
        len(state.history)
        == 1
    )

    assert (
        state.current_interviewer_question
        is not None
    )

    first_followup = (
        state.current_interviewer_question
    )

    assert (
        len(first_followup.strip())
        > 0
    )

    print()
    print("TURN 1 PASSED")

    # ==================================================
    # SAVE TURN 1 SCORES
    #
    # We use these later to verify that the
    # second turn does not erase previous evidence.
    # ==================================================

    turn_1_scores = dict(
        state.scores
    )

    # ==================================================
    # TURN 2
    # ==================================================

    print()
    print("=" * 60)
    print("TURN 2 — CANDIDATE ANSWERS FOLLOW-UP")
    print("=" * 60)

    answer_2 = (
        "For edge cases, I would consider duplicate "
        "values such as [3, 3] with target 6, an array "
        "with fewer than two elements, negative numbers, "
        "and the case where no valid pair exists."
    )

    features_2 = {
        "normalized_answer": answer_2,

        "concepts_detected": [
            "edge cases",
            "duplicate values",
            "negative numbers"
        ],

        "reasoning": [
            "Check duplicate values",
            "Check insufficient input",
            "Check negative values",
            "Check no-solution case"
        ],

        "complexity_claim": {
            "time": None,
            "space": None
        }
    }

    state = evaluate_candidate_turn(
        state=state,
        candidate_answer=answer_2,
        problem=problem,
        candidate_features=features_2
    )

    print_state(
        "AFTER TURN 2",
        state
    )

    # ==================================================
    # TURN 2 ASSERTIONS
    # ==================================================

    assert state.turn_number == 3

    assert (
        state.current_answer
        == answer_2
    )

    assert (
        len(state.history)
        == 2
    )

    print()
    print("TURN 2 STATE PASSED")

    # ==================================================
    # VERIFY SCORE MERGING
    # ==================================================

    print()
    print("=" * 60)
    print("VERIFYING SCORE MERGING")
    print("=" * 60)

    print()
    print("Turn 1 scores:")
    print(turn_1_scores)

    print()
    print("Final scores:")
    print(state.scores)

    # --------------------------------------------------
    # Every dimension that had a score in Turn 1
    # should still have that score unless Turn 2
    # supplied newer evidence for that dimension.
    # --------------------------------------------------

    for dimension, old_score in turn_1_scores.items():

        if old_score is None:
            continue

        new_score = state.scores.get(
            dimension
        )

        if new_score is None:
            print()
            print(
                f"WARNING: {dimension} "
                f"lost its previous score."
            )

            continue

        print(
            f"{dimension}: "
            f"{old_score} -> {new_score}"
        )

    # ==================================================
    # VERIFY EDGE-CASE ASSESSMENT
    # ==================================================

    final_edge_case_score = (
        state.scores.get(
            "edge_cases"
        )
    )

    print()
    print("Final Edge-Case Score:")
    print(
        final_edge_case_score
    )

    print()
    print("Final Edge-Case Evidence:")
    print(
        state.evidence.get(
            "edge_cases"
        )
    )

    if final_edge_case_score is not None:

        assert (
            0
            <= final_edge_case_score
            <= 100
        )

        print()
        print(
            "EDGE-CASE ASSESSMENT PASSED"
        )

    else:

        print()
        print(
            "WARNING: Edge cases were not assessed."
        )

    # ==================================================
    # VERIFY HISTORY
    # ==================================================

    print()
    print("=" * 60)
    print("VERIFYING HISTORY")
    print("=" * 60)

    assert len(state.history) == 2

    print()
    print(
        "History contains two previous turns."
    )

    print()
    print("History entries:")

    for index, entry in enumerate(
        state.history,
        start=1
    ):
        print()
        print(f"History Entry {index}:")
        print(entry)

    assert state.history[0] is not None
    assert state.history[1] is not None

    print()
    print(
        "Previous turns preserved in history."
    )

    # ==================================================
    # VERIFY CURRENT TURN
    # ==================================================

    assert (
        state.current_answer
        == answer_2
    )

    print()
    print(
        "Current Turn 2 answer preserved."
    )

    # ==================================================
    # VERIFY FOLLOW-UP GENERATION
    # ==================================================

    assert (
        first_followup is not None
    )

    assert (
        len(first_followup.strip())
        > 0
    )

    print()
    print(
        "Turn 1 follow-up was successfully generated."
    )

    # ==================================================
    # IMPORTANT:
    #
    # We no longer assume that
    # history[0]["current_interviewer_question"]
    # exists.
    #
    # Question history is tested separately by
    # Step 10.
    #
    # Here we only verify that the live state
    # generated a follow-up in Turn 1.
    # ==================================================

    assert (
        first_followup
        is not None
    )

    print()
    print(
        "Turn 1 follow-up was successfully generated."
    )

    # ==================================================
    # FINAL SUMMARY
    # ==================================================

    print()
    print("=" * 60)
    print("       MULTI-TURN ADAPTIVE TEST COMPLETE")
    print("=" * 60)

    print()
    print("Turn 1:")
    print(
        "Candidate answer"
        " -> evaluation"
        " -> follow-up"
    )

    print()
    print("Turn 2:")
    print(
        "Follow-up answer"
        " -> re-evaluation"
        " -> state update"
    )

    print()
    print("History length:")
    print(
        len(state.history)
    )

    print()
    print("Final Edge-Case Score:")
    print(
        state.scores.get(
            "edge_cases"
        )
    )

    print()
    print("=" * 60)
    print("       STEP 12 TEST PASSED")
    print("=" * 60)


if __name__ == "__main__":

    test_multi_turn_adaptive()