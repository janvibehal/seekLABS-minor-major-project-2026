from typing import Optional


# ==========================================================
# FOLLOW-UP STRATEGIES
# ==========================================================
#
# Each adaptive gap has:
#
# - objective:
#       What the interviewer should evaluate.
#
# - focus:
#       What the candidate should demonstrate.
#
# - instruction:
#       Guidance for generating the follow-up question.
#
# ==========================================================

FOLLOW_UP_STRATEGIES = {

    "Complexity Gap": {
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
            "complexity of their current approach. If appropriate, "
            "ask whether the solution can be optimized and why."
        )
    },


    "Edge-Case Gap": {
        "objective": (
            "Evaluate whether the candidate can identify "
            "important boundary conditions, special cases, "
            "and unusual inputs."
        ),

        "focus": [
            "Boundary conditions",
            "Empty input",
            "Minimum input",
            "Duplicate values",
            "Negative values",
            "Special input configurations"
        ],

        "instruction": (
            "Ask the candidate to identify and explain the "
            "important edge cases for their current solution. "
            "Do not provide the edge cases directly unless "
            "a hint is required."
        )
    },


    "Concept Gap": {
        "objective": (
            "Evaluate whether the candidate understands the "
            "core concepts required by the problem and can "
            "apply them correctly."
        ),

        "focus": [
            "Core algorithmic concepts",
            "Underlying data structures",
            "Why the concept applies",
            "Correct application of the concept"
        ],

        "instruction": (
            "Ask a conceptual question related to the "
            "candidate's current approach. The question should "
            "test understanding rather than simply asking "
            "the candidate to repeat their solution."
        )
    },


    "Data-Structure Gap": {
        "objective": (
            "Evaluate whether the candidate understands why "
            "the selected data structure is appropriate and "
            "whether another structure could improve the solution."
        ),

        "focus": [
            "Choice of data structure",
            "Operations supported",
            "Access/update complexity",
            "Alternative data structures",
            "Trade-offs"
        ],

        "instruction": (
            "Ask the candidate to justify their chosen data "
            "structure and discuss an appropriate alternative "
            "or the trade-offs involved."
        )
    },


    "Reasoning Gap": {
        "objective": (
            "Evaluate whether the candidate can logically "
            "justify their approach and explain why it works."
        ),

        "focus": [
            "Step-by-step reasoning",
            "Correctness justification",
            "Cause and effect",
            "Why the algorithm works"
        ],

        "instruction": (
            "Ask the candidate to explain why their current "
            "approach works, focusing on the reasoning behind "
            "the key algorithmic steps."
        )
    },


    "Completeness Gap": {
        "objective": (
            "Evaluate whether the candidate has addressed "
            "all essential parts of the solution."
        ),

        "focus": [
            "Missing implementation details",
            "Assumptions",
            "Required steps",
            "Input/output handling",
            "Unaddressed parts of the solution"
        ],

        "instruction": (
            "Ask the candidate about an important part of "
            "their solution that has not yet been sufficiently "
            "explained or demonstrated."
        )
    }
}


# ==========================================================
# GET FOLLOW-UP STRATEGY
# ==========================================================

def get_followup_strategy(
    adaptive_gap: Optional[str]
) -> Optional[dict]:
    """
    Return the follow-up strategy for the selected
    adaptive classification.

    Args:
        adaptive_gap:
            The primary adaptive gap selected by the
            adaptive priority system.

    Returns:
        Strategy dictionary if a valid gap exists.
        None otherwise.
    """

    if not adaptive_gap:
        return None

    strategy = FOLLOW_UP_STRATEGIES.get(
        adaptive_gap
    )

    if strategy is None:
        return None

    return {
        "adaptive_gap": adaptive_gap,
        "objective": strategy["objective"],
        "focus": strategy["focus"].copy(),
        "instruction": strategy["instruction"]
    }