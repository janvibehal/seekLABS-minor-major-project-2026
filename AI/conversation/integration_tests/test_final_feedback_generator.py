from AI.conversation.final_feedback_generator import FinalFeedbackGenerator


def test_feedback_generation():

    generator = FinalFeedbackGenerator()

    evaluation = {
        "overall_score": 82.5,
        "classification": "Correct",
        "dimensions": {
            "algorithm_correctness": 95,
            "logical_reasoning": 85,
            "concept_coverage": 90,
            "completeness": 82,
            "data_structure": 88,
            "complexity": 75,
            "edge_cases": 45,
        },
    }

    feedback = generator.generate(evaluation)

    assert feedback["overall_score"] == 82.5
    assert feedback["classification"] == "Correct"

    assert len(feedback["strengths"]) == 5
    assert len(feedback["areas_to_improve"]) == 1

    assert (
        feedback["areas_to_improve"][0]["dimension"]
        == "Edge Cases"
    )


def test_text_feedback():

    generator = FinalFeedbackGenerator()

    evaluation = {
        "overall_score": 91.0,
        "classification": "Correct",
        "dimensions": {
            "algorithm_correctness": 100,
            "logical_reasoning": 95,
            "concept_coverage": 100,
            "completeness": 95,
            "data_structure": 100,
            "complexity": 100,
            "edge_cases": 80,
        },
    }

    text = generator.generate_text(evaluation)

    assert isinstance(text, str)
    assert "91.0/100" in text
    assert "Correct" in text
    assert "Algorithm Correctness" in text
    assert "Strengths:" in text
    assert "Areas to improve:" in text


def test_no_major_weaknesses():

    generator = FinalFeedbackGenerator()

    evaluation = {
        "overall_score": 95,
        "classification": "Correct",
        "dimensions": {
            "algorithm_correctness": 100,
            "logical_reasoning": 90,
            "concept_coverage": 95,
            "completeness": 90,
            "data_structure": 95,
            "complexity": 90,
            "edge_cases": 85,
        },
    }

    feedback = generator.generate(evaluation)

    assert feedback["areas_to_improve"] == []


def test_invalid_evaluation():

    generator = FinalFeedbackGenerator()

    try:
        generator.generate({
            "classification": "Correct"
        })
        assert False
    except ValueError:
        assert True


def test_invalid_dimensions():

    generator = FinalFeedbackGenerator()

    try:
        generator.generate({
            "overall_score": 80,
            "classification": "Correct",
            "dimensions": []
        })
        assert False
    except ValueError:
        assert True