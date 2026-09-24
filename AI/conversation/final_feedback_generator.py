from typing import Any


class FinalFeedbackGenerator:
    """
    Converts final evaluation results into candidate-facing feedback.

    This component does not calculate evaluation scores.
    It only formats the results into a clear summary.
    """

    DIMENSIONS = [
        "algorithm_correctness",
        "logical_reasoning",
        "concept_coverage",
        "completeness",
        "data_structure",
        "complexity",
        "edge_cases",
    ]

    DIMENSION_LABELS = {
        "algorithm_correctness": "Algorithm Correctness",
        "logical_reasoning": "Logical Reasoning",
        "concept_coverage": "Concept Coverage",
        "completeness": "Completeness",
        "data_structure": "Data Structure",
        "complexity": "Complexity",
        "edge_cases": "Edge Cases",
    }

    def generate(
        self,
        evaluation_result: dict[str, Any]
    ) -> dict[str, Any]:
        """
        Generate candidate-facing feedback from evaluation results.

        Expected input:

        {
            "overall_score": 82.5,
            "classification": "Correct",
            "dimensions": {
                "algorithm_correctness": 90,
                ...
            }
        }
        """

        if not isinstance(evaluation_result, dict):
            raise ValueError("Evaluation result must be a dictionary.")

        if "overall_score" not in evaluation_result:
            raise ValueError(
                "Evaluation result must contain 'overall_score'."
            )

        if "classification" not in evaluation_result:
            raise ValueError(
                "Evaluation result must contain 'classification'."
            )

        dimensions = evaluation_result.get("dimensions", {})

        if not isinstance(dimensions, dict):
            raise ValueError("'dimensions' must be a dictionary.")

        strengths = []
        areas_to_improve = []

        for dimension in self.DIMENSIONS:
            if dimension not in dimensions:
                continue

            score = dimensions[dimension]

            if not isinstance(score, (int, float)):
                raise ValueError(
                    f"Score for {dimension} must be numeric."
                )

            label = self.DIMENSION_LABELS[dimension]

            if score >= 80:
                strengths.append({
                    "dimension": label,
                    "score": score,
                })
            elif score < 60:
                areas_to_improve.append({
                    "dimension": label,
                    "score": score,
                })

        overall_score = evaluation_result["overall_score"]
        classification = evaluation_result["classification"]

        summary = (
            f"Your overall score is {overall_score:.1f}/100. "
            f"Your solution was classified as {classification}."
        )

        return {
            "overall_score": overall_score,
            "classification": classification,
            "summary": summary,
            "strengths": strengths,
            "areas_to_improve": areas_to_improve,
        }

    def generate_text(
        self,
        evaluation_result: dict[str, Any]
    ) -> str:
        """
        Generate a simple readable feedback message.
        """

        feedback = self.generate(evaluation_result)

        lines = [
            feedback["summary"],
            "",
            "Strengths:",
        ]

        if feedback["strengths"]:
            for strength in feedback["strengths"]:
                lines.append(
                    f"- {strength['dimension']}: "
                    f"{strength['score']}/100"
                )
        else:
            lines.append("- No major strengths identified.")

        lines.append("")
        lines.append("Areas to improve:")

        if feedback["areas_to_improve"]:
            for area in feedback["areas_to_improve"]:
                lines.append(
                    f"- {area['dimension']}: "
                    f"{area['score']}/100"
                )
        else:
            lines.append("- No major areas for improvement identified.")

        return "\n".join(lines)