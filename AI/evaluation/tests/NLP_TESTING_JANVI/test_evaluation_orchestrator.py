from unittest.mock import patch

from AI.evaluation.scoring.candidate_state import (
    CandidateEvaluationState,
)

from AI.evaluation.scoring.evaluation_orchestrator import (
    evaluate_candidate_turn,
)


REFERENCES = [
    {
        "Reference ID": "P001-R1",
        "Expected Approach": "Brute force pair search",
    },
    {
        "Reference ID": "P001-R2",
        "Expected Approach": "Sorting with two pointers",
    },
    {
        "Reference ID": "P001-R3",
        "Expected Approach": "Hash map complement lookup",
    },
    {
        "Reference ID": "P001-R4",
        "Expected Approach": "Alternative lookup approach",
    },
]


PROBLEM = {
    "problem_id": "P001",
    "title": "Two Sum",
}


CANDIDATE_FEATURES = {
    "approach": "complement lookup",
    "algorithms": [],
    "concepts": ["lookup"],
    "operations": ["iterate", "lookup"],
    "data_structures": ["hash map"],
    "time_complexity": "O(n)",
    "space_complexity": "O(n)",
    "edge_cases": [],
    "reasoning_summary": (
        "Store previously seen values and look for "
        "the complement."
    ),
    "assumptions": [],
    "optimization": None,
    "implementation_details": [],
}


def _evaluation_result():
    dimensions = [
        "algorithm_correctness",
        "logical_reasoning",
        "concept_coverage",
        "completeness",
        "data_structure",
        "complexity",
        "edge_cases",
    ]

    return {
        "scores": {
            dimension: {
                "score": 80,
                "assessment_status": "ASSESSED",
                "evidence": "Test evidence.",
            }
            for dimension in dimensions
        },
        "errors": [],
    }


def test_orchestrator_matches_reference_and_passes_it_to_evaluator():

    state = CandidateEvaluationState(
        candidate_id="candidate_test",
        question_id="P001",
    )

    with patch(
        "AI.evaluation.scoring.evaluation_orchestrator."
        "load_evaluation_context"
    ) as mock_context, patch(
        "AI.evaluation.scoring.evaluation_orchestrator."
        "match_reference_solution_with_confidence"
    ) as mock_matcher, patch(
        "AI.evaluation.scoring.evaluation_orchestrator."
        "evaluate_with_llm"
    ) as mock_evaluator, patch(
        "AI.evaluation.scoring.evaluation_orchestrator."
        "classify_answer"
    ) as mock_classify:

        mock_context.return_value = (
            REFERENCES,
            {"rubric": "test"},
        )

        mock_matcher.return_value = (
            "P001-R3",
            0.9,
        )

        mock_evaluator.return_value = _evaluation_result()

        mock_classify.return_value = {
            "primary_classification": "GOOD",
            "secondary_classification": None,
            "adaptive_classifications": [],
        }

        result = evaluate_candidate_turn(
            state=state,
            candidate_answer=(
                "I store previous values and look for "
                "the complement."
            ),
            problem=PROBLEM,
            candidate_features=CANDIDATE_FEATURES,
        )

    assert result.reference_answer_id == "P001-R3"

    assert result.reference_match_confidence == 0.9

    mock_matcher.assert_called_once_with(
        candidate_state=state.nlp_state.to_dict(),
        reference_solutions=REFERENCES,
    )

    mock_evaluator.assert_called_once()

    evaluator_kwargs = (
        mock_evaluator.call_args.kwargs
    )

    assert (
        evaluator_kwargs["reference_solution"]
        == REFERENCES[2]
    )

    assert (
        evaluator_kwargs["rubric"]
        == {"rubric": "test"}
    )


def test_orchestrator_rejects_invalid_reference_match():

    state = CandidateEvaluationState(
        candidate_id="candidate_test",
        question_id="P001",
    )

    with patch(
        "AI.evaluation.scoring.evaluation_orchestrator."
        "load_evaluation_context"
    ) as mock_context, patch(
        "AI.evaluation.scoring.evaluation_orchestrator."
        "match_reference_solution_with_confidence"
    ) as mock_matcher:

        mock_context.return_value = (
            REFERENCES,
            {"rubric": "test"},
        )

        mock_matcher.return_value = (
            "P001-R999",
            0.95,
        )

        # The orchestrator should reject a matched ID
        # that is not present in the loaded references.

        try:
            evaluate_candidate_turn(
                state=state,
                candidate_answer="test answer",
                problem=PROBLEM,
                candidate_features=CANDIDATE_FEATURES,
            )

        except RuntimeError as error:
            assert (
                "Matched reference ID was not found"
                in str(error)
            )

        else:
            raise AssertionError(
                "Expected RuntimeError for unknown reference ID."
            )