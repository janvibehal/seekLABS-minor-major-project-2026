from typing import Any


class QuestionGenerator:
    """
    Converts an adaptive policy decision into a natural
    follow-up question.

    This component does not decide:
    - which dimension should be tested
    - whether a follow-up is needed
    - the candidate's score

    Those decisions come from the adaptive/policy layer.
    """

    QUESTION_TEMPLATES = {
        "algorithm_correctness": {
            "default": (
                "Can you explain why your approach correctly solves "
                "the problem?"
            ),
            "easy": (
                "Can you walk me through why your approach produces "
                "the correct result?"
            ),
            "medium": (
                "Can you explain the key reasoning that makes your "
                "approach correct?"
            ),
            "hard": (
                "Can you justify your approach for cases where the "
                "input behaves differently from the typical case?"
            ),
        },
        "logical_reasoning": {
            "default": (
                "Can you explain your reasoning step by step and "
                "why each step is necessary?"
            ),
            "easy": (
                "Can you walk me through the main steps of your reasoning?"
            ),
            "medium": (
                "Can you explain why you chose these steps and how "
                "they lead to the result?"
            ),
            "hard": (
                "Can you justify the reasoning behind each major "
                "decision in your approach?"
            ),
        },
        "concept_coverage": {
            "default": (
                "Can you explain which programming concepts are "
                "important for your approach?"
            ),
            "easy": (
                "What main programming concept are you using here?"
            ),
            "medium": (
                "Which concepts are central to your approach, "
                "and why are they useful?"
            ),
            "hard": (
                "Can you explain the underlying concepts that make "
                "your approach work?"
            ),
        },
        "completeness": {
            "default": (
                "Can you explain any important steps or details "
                "that your current explanation has not covered?"
            ),
            "easy": (
                "Is there any important step in your solution "
                "that you have not explained yet?"
            ),
            "medium": (
                "Can you walk through any missing details needed "
                "to fully understand your solution?"
            ),
            "hard": (
                "What additional details would be necessary to make "
                "your explanation complete?"
            ),
        },
        "data_structure": {
            "default": (
                "Why did you choose this data structure, and would "
                "another data structure work better?"
            ),
            "easy": (
                "Why did you choose this data structure?"
            ),
            "medium": (
                "Why is this data structure suitable for your "
                "approach, and are there alternatives?"
            ),
            "hard": (
                "How does your choice of data structure affect "
                "the efficiency of your solution?"
            ),
        },
        "complexity": {
            "default": (
                "Can you explain the time and space complexity "
                "of your approach and whether either can be improved?"
            ),
            "easy": (
                "Can you explain the time and space complexity "
                "of your approach?"
            ),
            "medium": (
                "Can you explain the time and space complexity "
                "of your approach and whether either can be improved?"
            ),
            "hard": (
                "How would your approach perform as the input size "
                "becomes very large, and can its complexity be improved?"
            ),
        },
        "edge_cases": {
            "default": (
                "What edge cases would you consider for your solution?"
            ),
            "easy": (
                "Can you think of any unusual or boundary cases "
                "your solution should handle?"
            ),
            "medium": (
                "What important edge cases could cause your approach "
                "to behave differently?"
            ),
            "hard": (
                "Can you identify boundary cases that could expose "
                "a weakness in your approach and explain how you "
                "would handle them?"
            ),
        },
    }

    def generate(self, policy_decision: dict[str, Any]) -> str:
        """
        Generate a follow-up question from a policy decision.
        """

        target_dimension = policy_decision.get("target_dimension")
        difficulty = policy_decision.get("difficulty", "medium")

        if not target_dimension:
            raise ValueError(
                "Policy decision must contain 'target_dimension'."
            )

        if target_dimension not in self.QUESTION_TEMPLATES:
            raise ValueError(
                f"Unsupported target dimension: {target_dimension}"
            )

        templates = self.QUESTION_TEMPLATES[target_dimension]

        question = templates.get(
            difficulty,
            templates["default"]
        )

        # The policy layer can explicitly prevent solution revealing.
        # Our current templates are designed not to reveal the solution.
        if policy_decision.get("do_not_reveal_solution", True):
            return question

        return question

    def supported_dimensions(self) -> list[str]:
        """Return the dimensions supported by the generator."""

        return list(self.QUESTION_TEMPLATES.keys())