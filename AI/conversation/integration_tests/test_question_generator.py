import pytest

from AI.conversation.question_generator import QuestionGenerator


def test_complexity_question():

    generator = QuestionGenerator()

    policy_decision = {
        "target_dimension": "complexity",
        "goal": "evaluate_time_and_space_complexity",
        "difficulty": "medium",
        "do_not_reveal_solution": True,
        "time_remaining": 180
    }

    question = generator.generate(policy_decision)

    assert isinstance(question, str)
    assert len(question) > 0

    assert "complexity" in question.lower()


def test_edge_case_question():

    generator = QuestionGenerator()

    policy_decision = {
        "target_dimension": "edge_cases",
        "goal": "evaluate_edge_cases",
        "difficulty": "medium",
        "do_not_reveal_solution": True,
        "time_remaining": 180
    }

    question = generator.generate(policy_decision)

    assert isinstance(question, str)
    assert len(question) > 0

    assert "edge" in question.lower()


def test_all_dimensions_are_supported():

    generator = QuestionGenerator()

    dimensions = generator.supported_dimensions()

    expected_dimensions = {
        "algorithm_correctness",
        "logical_reasoning",
        "concept_coverage",
        "completeness",
        "data_structure",
        "complexity",
        "edge_cases"
    }

    assert set(dimensions) == expected_dimensions


def test_different_difficulties():

    generator = QuestionGenerator()

    easy_question = generator.generate({
        "target_dimension": "complexity",
        "difficulty": "easy"
    })

    hard_question = generator.generate({
        "target_dimension": "complexity",
        "difficulty": "hard"
    })

    assert easy_question != hard_question


def test_missing_dimension_is_rejected():

    generator = QuestionGenerator()

    with pytest.raises(ValueError):
        generator.generate({
            "difficulty": "medium"
        })


def test_unsupported_dimension_is_rejected():

    generator = QuestionGenerator()

    with pytest.raises(ValueError):
        generator.generate({
            "target_dimension": "unknown_dimension",
            "difficulty": "medium"
        })


def test_solution_is_not_revealed():

    generator = QuestionGenerator()

    policy_decision = {
        "target_dimension": "complexity",
        "difficulty": "medium",
        "do_not_reveal_solution": True
    }

    question = generator.generate(policy_decision)

    assert "hashmap" not in question.lower()
    assert "hash map" not in question.lower()
    assert "use two pointers" not in question.lower()