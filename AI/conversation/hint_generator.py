from typing import Any


class HintGenerator:
    """
    Generates progressive hints for a candidate.

    Hint levels:
        0 -> broad/no hint
        1 -> directional hint
        2 -> stronger hint

    This component does not decide when a hint should be given.
    That decision belongs to the adaptive/policy layer.
    """

    HINTS = {
        "algorithm_correctness": {
            0: "Can you think through why your approach should produce the correct result?",
            1: "Try checking whether your approach works for all valid input cases.",
            2: "Walk through your algorithm step by step on a small example and verify each result.",
        },
        "logical_reasoning": {
            0: "Can you explain your reasoning one step at a time?",
            1: "Focus on what must happen at each step and why that step is necessary.",
            2: "Try tracing your approach with a concrete example and justify each decision.",
        },
        "concept_coverage": {
            0: "What programming concept could help explain your approach?",
            1: "Think about the main algorithmic concept behind the operations you are performing.",
            2: "Try identifying the specific algorithmic technique that makes your approach work.",
        },
        "completeness": {
            0: "Is there any important part of your approach that you have not explained yet?",
            1: "Think about the steps, assumptions, and conditions that your explanation may be missing.",
            2: "Walk through the complete solution from input to output and identify any missing step.",
        },
        "data_structure": {
            0: "Is there a data structure that could make your operations easier or faster?",
            1: "Think about the operations you perform most often and which data structure supports them efficiently.",
            2: "Consider whether a HashMap, Stack, Queue, Set, or another structure could improve the required operation.",
        },
        "complexity": {
            0: "Can you think about how your solution behaves as the input gets larger?",
            1: "Count how many times the main operations can execute as the input size grows.",
            2: "Try expressing the number of operations in terms of n and determine the resulting time and space complexity.",
        },
        "edge_cases": {
            0: "Can you think of any unusual or boundary cases your solution should handle?",
            1: "Consider empty, minimum, maximum, duplicate, or missing-value cases where applicable.",
            2: "Take a boundary case and trace your solution through it to verify that it still behaves correctly.",
        },
    }

    def generate(
        self,
        target_dimension: str,
        hint_level: int
    ) -> str:
        """
        Generate a hint for the requested dimension and hint level.
        """

        if target_dimension not in self.HINTS:
            raise ValueError(
                f"Unsupported target dimension: {target_dimension}"
            )

        if hint_level not in (0, 1, 2):
            raise ValueError(
                "Hint level must be 0, 1, or 2."
            )

        return self.HINTS[target_dimension][hint_level]

    def generate_from_policy(
        self,
        policy_decision: dict[str, Any]
    ) -> str:
        """
        Generate a hint directly from a policy decision.

        Expected policy fields:
            target_dimension
            hint_level
        """

        target_dimension = policy_decision.get("target_dimension")
        hint_level = policy_decision.get("hint_level")

        if target_dimension is None:
            raise ValueError(
                "Policy decision must contain 'target_dimension'."
            )

        if hint_level is None:
            raise ValueError(
                "Policy decision must contain 'hint_level'."
            )

        return self.generate(
            target_dimension,
            hint_level
        )

    def supported_dimensions(self) -> list[str]:
        """Return all supported evaluation dimensions."""

        return list(self.HINTS.keys())