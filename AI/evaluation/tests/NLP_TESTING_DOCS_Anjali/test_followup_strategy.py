from AI.evaluation.interviewer.followup_strategy import (
    get_followup_strategy
)


def test_followup_strategies():

    gaps = [
        "Complexity Gap",
        "Edge-Case Gap",
        "Concept Gap",
        "Data-Structure Gap",
        "Reasoning Gap",
        "Completeness Gap"
    ]

    print("\n==========================================")
    print("       FOLLOW-UP STRATEGY TEST")
    print("==========================================")

    for gap in gaps:

        strategy = get_followup_strategy(
            gap
        )

        assert strategy is not None

        print("\n------------------------------------------")
        print(f"Adaptive Gap: {gap}")
        print("------------------------------------------")

        print(
            "Objective:"
        )

        print(
            strategy["objective"]
        )

        print(
            "\nFocus:"
        )

        for item in strategy["focus"]:
            print(
                f"  - {item}"
            )

        print(
            "\nInstruction:"
        )

        print(
            strategy["instruction"] # type: ignore
        )

        assert strategy["adaptive_gap"] == gap
        assert len(strategy["focus"]) > 0
        assert strategy["objective"]
        assert strategy["instruction"]

    print("\nALL STRATEGY TESTS PASSED")


def test_no_gap():

    strategy = get_followup_strategy(
        None
    )

    assert strategy is None

    print(
        "NO-GAP TEST PASSED"
    )


def test_unknown_gap():

    strategy = get_followup_strategy(
        "Unknown Gap"
    )

    assert strategy is None

    print(
        "UNKNOWN-GAP TEST PASSED"
    )


if __name__ == "__main__":

    test_followup_strategies()

    test_no_gap()

    test_unknown_gap()

    print("\n==========================================")
    print("       STEP 9 TESTS PASSED")
    print("==========================================\n")