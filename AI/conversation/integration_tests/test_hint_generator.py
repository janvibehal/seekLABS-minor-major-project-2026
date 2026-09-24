import pytest

from AI.conversation.hint_generator import HintGenerator


def test_level_zero_hint():

    generator = HintGenerator()

    hint = generator.generate(
        "complexity",
        0
    )

    assert isinstance(hint, str)
    assert len(hint) > 0


def test_level_one_hint():

    generator = HintGenerator()

    hint = generator.generate(
        "complexity",
        1
    )

    assert isinstance(hint, str)
    assert len(hint) > 0


def test_level_two_hint():

    generator = HintGenerator()

    hint = generator.generate(
        "complexity",
        2
    )

    assert isinstance(hint, str)
    assert len(hint) > 0


def test_hints_are_progressive():

    generator = HintGenerator()

    level_zero = generator.generate(
        "complexity",
        0
    )

    level_one = generator.generate(
        "complexity",
        1
    )

    level_two = generator.generate(
        "complexity",
        2
    )

    assert level_zero != level_one
    assert level_one != level_two
    assert level_zero != level_two


def test_all_dimensions_are_supported():

    generator = HintGenerator()

    expected_dimensions = {
        "algorithm_correctness",
        "logical_reasoning",
        "concept_coverage",
        "completeness",
        "data_structure",
        "complexity",
        "edge_cases"
    }

    assert set(generator.supported_dimensions()) == expected_dimensions


def test_policy_decision_input():

    generator = HintGenerator()

    policy_decision = {
        "target_dimension": "data_structure",
        "hint_level": 1,
        "do_not_reveal_solution": True
    }

    hint = generator.generate_from_policy(
        policy_decision
    )

    assert isinstance(hint, str)
    assert len(hint) > 0


def test_invalid_dimension():

    generator = HintGenerator()

    with pytest.raises(ValueError):
        generator.generate(
            "invalid_dimension",
            1
        )


def test_invalid_hint_level():

    generator = HintGenerator()

    with pytest.raises(ValueError):
        generator.generate(
            "complexity",
            3
        )


def test_missing_policy_dimension():

    generator = HintGenerator()

    with pytest.raises(ValueError):
        generator.generate_from_policy({
            "hint_level": 1
        })


def test_missing_policy_hint_level():

    generator = HintGenerator()

    with pytest.raises(ValueError):
        generator.generate_from_policy({
            "target_dimension": "complexity"
        })


def test_no_complete_solution_is_revealed():

    generator = HintGenerator()

    hint = generator.generate(
        "data_structure",
        1
    )

    # The directional hint should not directly prescribe
    # the complete Two Sum solution.
    assert "return the two indices" not in hint.lower()
    assert "target - current" not in hint.lower()