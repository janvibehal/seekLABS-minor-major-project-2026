from AI.evaluation.interviewer.followup_generator import (
    generate_followup_question
)


def create_problem():

    return {
        "title": "Two Sum",

        "description": (
            "Given an array of integers nums and an integer "
            "target, return the indices of the two numbers "
            "such that they add up to target."
        )
    }


def create_strategy():

    return {
        "adaptive_gap": "Complexity Gap",

        "objective": (
            "Evaluate whether the candidate understands "
            "the time and space complexity of their approach "
            "and can reason about possible optimization."
        ),

        "focus": [
            "Time complexity",
            "Space complexity",
            "Why the stated complexity is correct",
            "Whether the approach can be optimized"
        ],

        "instruction": (
            "Ask the candidate to explain the time and space "
            "complexity of their current approach."
        )
    }


def create_state():

    return {
        "scores": {
            "algorithm_correctness": 85,
            "logical_reasoning": 80,
            "concept_coverage": 75,
            "completeness": 70,
            "data_structure": 90,
            "complexity": 45,
            "edge_cases": None
        },

        "evidence": {
            "algorithm_correctness":
                "Correct HashMap approach.",

            "logical_reasoning":
                "Reasoning is mostly clear.",

            "concept_coverage":
                "HashMap concept demonstrated.",

            "completeness":
                "Core approach explained.",

            "data_structure":
                "HashMap is appropriate.",

            "complexity":
                "Candidate has not sufficiently "
                "justified complexity.",

            "edge_cases":
                None
        },

        "history": []
    }


def test_first_followup():

    print("\n")
    print("=" * 60)
    print("       TEST 1 — FIRST FOLLOW-UP")
    print("=" * 60)

    question = generate_followup_question(
        problem=create_problem(),

        candidate_answer=(
            "I would use a HashMap to store previously "
            "seen values and check for the complement."
        ),

        candidate_state=create_state(),

        followup_strategy=create_strategy()
    )

    print("\nGenerated question:")
    print(question)

    assert isinstance(
        question,
        str
    )

    assert len(
        question.strip()
    ) > 0

    print("\nTEST 1 PASSED")


def test_repeated_gap():

    print("\n")
    print("=" * 60)
    print("       TEST 2 — REPEATED GAP")
    print("=" * 60)

    state = create_state()

    state["history"] = [

        {
            "turn_number": 1,

            "interviewer_question": (
                "Can you explain the time and space "
                "complexity of your approach?"
            ),

            "candidate_answer": (
                "The time complexity is O(n)."
            )
        }
    ]

    question = generate_followup_question(
        problem=create_problem(),

        candidate_answer=(
            "The time complexity is O(n), but I am "
            "not sure about the space complexity."
        ),

        candidate_state=state,

        followup_strategy=create_strategy()
    )

    print("\nPrevious question:")
    print(
        state["history"][0][
            "interviewer_question"
        ]
    )

    print("\nNew generated question:")
    print(question)

    assert isinstance(
        question,
        str
    )

    assert len(
        question.strip()
    ) > 0

    previous_question = (
        state["history"][0][
            "interviewer_question"
        ]
    )

    assert (
        question.strip().lower()
        != previous_question.strip().lower()
    )

    print("\nTEST 2 PASSED")


if __name__ == "__main__":

    test_first_followup()

    test_repeated_gap()

    print("\n")
    print("=" * 60)
    print("       STEP 9.3 TESTS PASSED")
    print("=" * 60)