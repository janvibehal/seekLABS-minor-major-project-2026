from typing import Optional


DIMENSION_TO_GAP = {
    "complexity": "Complexity Gap",
    "edge_cases": "Edge-Case Gap",
    "concept_coverage": "Concept Gap",
    "data_structure": "Data-Structure Gap",
    "logical_reasoning": "Reasoning Gap",
    "completeness": "Completeness Gap"
}


def get_unassessed_dimensions(
    llm_evaluation: dict
) -> list:

    scores = llm_evaluation.get(
        "scores",
        {}
    )

    unassessed = []

    for dimension_name in DIMENSION_TO_GAP:

        dimension = scores.get(
            dimension_name,
            {}
        )

        if not isinstance(
            dimension,
            dict
        ):
            continue

        status = dimension.get(
            "assessment_status"
        )

        if status == "NOT_ASSESSED":
            unassessed.append(
                dimension_name
            )

    return unassessed


def get_unassessed_probe(
    llm_evaluation: dict,
    already_probed: list
) -> Optional[str]:

    unassessed_dimensions = (
        get_unassessed_dimensions(
            llm_evaluation
        )
    )

    for dimension_name in unassessed_dimensions:

        gap = DIMENSION_TO_GAP.get(
            dimension_name
        )

        if gap is None:
            continue

        if gap in already_probed:
            continue

        return gap

    return None