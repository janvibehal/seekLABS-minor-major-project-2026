from AI.evaluation.dataset_loader import (
    load_reference_dataset,
    load_reference_solution,
)


def test_reference_dataset_loads():
    dataset = load_reference_dataset()

    assert dataset
    assert len(dataset) == 10


def test_each_problem_has_multiple_references():
    dataset = load_reference_dataset()

    for problem_id, problem_data in dataset.items():

        references = problem_data[
            "reference_solutions"
        ]

        assert len(references) >= 2

        reference_ids = {
            reference["Reference ID"]
            for reference in references
        }

        assert len(reference_ids) == len(references)


def test_p001_contains_four_reference_solutions():
    references = load_reference_solution(
        {
            "problem_id": "P001"
        }
    )

    reference_ids = {
        reference["Reference ID"]
        for reference in references
    }

    assert reference_ids == {
        "P001-R1",
        "P001-R2",
        "P001-R3",
        "P001-R4",
    }


def test_reference_repository_contains_solution_types():
    references = load_reference_solution(
        {
            "problem_id": "P001"
        }
    )

    solution_types = {
        reference["Solution Type"]
        for reference in references
    }

    assert "Brute Force" in solution_types
    assert "Improved" in solution_types
    assert "Alternative" in solution_types


def test_reference_repository_does_not_select_target():
    references = load_reference_solution(
        {
            "problem_id": "P001"
        }
    )

    # The repository only exposes reference data.
    # Target selection belongs to Jia's adaptive-policy layer.
    assert isinstance(references, list)

    for reference in references:
        assert "Reference ID" in reference
        assert "Expected Approach" in reference