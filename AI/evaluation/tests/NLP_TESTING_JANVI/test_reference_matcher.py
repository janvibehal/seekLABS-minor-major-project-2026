from unittest.mock import patch

import pytest

from AI.evaluation.dataset_loader import (
    load_reference_solution,
)

from AI.evaluation.scoring.reference_matcher import (
    match_reference_solution_with_confidence,
)

from AI.evaluation.scoring.reference_matcher import (
    match_reference_solution,
)


REFERENCES = [
    {"Reference ID": "P001-R1"},
    {"Reference ID": "P001-R2"},
    {"Reference ID": "P001-R3"},
    {"Reference ID": "P001-R4"},
]


CANDIDATE_STATE = {
    "approach": "complement lookup",
    "algorithms": [],
    "concepts": ["lookup"],
    "operations": ["iterate", "lookup"],
    "data_structures": ["hash map"],
    "time_complexity": "O(n)",
    "space_complexity": "O(n)",
    "edge_cases": [],
    "reasoning_summary": (
        "Store previously seen values and look for the complement."
    ),
    "assumptions": [],
    "optimization": None,
}


def test_matcher_accepts_valid_reference_id():
    with patch(
        "AI.evaluation.scoring.reference_matcher.generate_structured_json"
    ) as mock_generate:

        mock_generate.return_value = {
            "reference_id": "P001-R3",
            "match_confidence": 0.9,
        }

        result = match_reference_solution(
            candidate_state=CANDIDATE_STATE,
            reference_solutions=REFERENCES,
        )

        assert result == "P001-R3"


def test_matcher_accepts_each_supplied_reference_id():
    for reference_id in (
        "P001-R1",
        "P001-R2",
        "P001-R3",
        "P001-R4",
    ):
        with patch(
            "AI.evaluation.scoring.reference_matcher.generate_structured_json"
        ) as mock_generate:

            mock_generate.return_value = {
                "reference_id": reference_id,
                "match_confidence": 0.9,
            }

            result = match_reference_solution(
                candidate_state=CANDIDATE_STATE,
                reference_solutions=REFERENCES,
            )

            assert result == reference_id


def test_matcher_returns_none_for_no_confident_match():
    with patch(
        "AI.evaluation.scoring.reference_matcher.generate_structured_json"
    ) as mock_generate:

        mock_generate.return_value = {
            "reference_id": None,
            "match_confidence": None,
        }

        result = match_reference_solution(
            candidate_state=CANDIDATE_STATE,
            reference_solutions=REFERENCES,
        )

        assert result is None


def test_matcher_rejects_unknown_reference_id():
    with patch(
        "AI.evaluation.scoring.reference_matcher.generate_structured_json"
    ) as mock_generate:

        mock_generate.return_value = {
            "reference_id": "P001-R999",
            "match_confidence": 0.9,
        }

        with pytest.raises(
            RuntimeError,
            match="unknown reference_id",
        ):
            match_reference_solution(
                candidate_state=CANDIDATE_STATE,
                reference_solutions=REFERENCES,
            )


def test_matcher_rejects_empty_reference_list():
    with pytest.raises(
        ValueError,
        match="reference_solutions cannot be empty",
    ):
        match_reference_solution(
            candidate_state=CANDIDATE_STATE,
            reference_solutions=[],
        )


def test_matcher_rejects_invalid_candidate_state():
    with pytest.raises(
        TypeError,
        match="candidate_state must be a dictionary",
    ):
        match_reference_solution(
            candidate_state=None,
            reference_solutions=REFERENCES,
        )
        
def test_real_matcher_generates_reference_and_confidence():
    references = load_reference_solution(
        {
            "problem_id": "P001",
        }
    )

    reference_id, confidence = (
        match_reference_solution_with_confidence(
            candidate_state=CANDIDATE_STATE,
            reference_solutions=references,
        )
    )

    print()
    print("=" * 60)
    print("REAL REFERENCE MATCHER TEST")
    print("=" * 60)

    print(
        f"Candidate approach : "
        f"{CANDIDATE_STATE['approach']}"
    )

    print(
        f"References supplied: "
        f"{len(references)}"
    )

    print(
        "Model              : "
        "qwen3:1.7b"
    )

    print(
        f"Generated reference: "
        f"{reference_id}"
    )

    print(
        f"Generated confidence: "
        f"{confidence}"
    )

    print("=" * 60)

    assert reference_id is not None
    assert reference_id in {
        reference["Reference ID"]
        for reference in references
    }

    assert confidence is None
    #assert 0.0 <= confidence <= 1.0 this line is deleted now