from AI.adaptive.policy_engine import PolicyEngine
from AI.conversation.question_generator import QuestionGenerator


def test_policy_to_question_generation():
    engine = PolicyEngine()
    generator = QuestionGenerator()

    scores = {
        "algorithm_correctness": 85,
        "logical_reasoning": 70,
        "concept_coverage": 90,
        "completeness": 65,
        "data_structure_usage": 80,
        "complexity": 40,
        "edge_cases": 50
    }

    # Jia's adaptive policy decides what to ask next.
    policy_decision = engine.decide(
        scores=scores,
        time_remaining=180,
        candidate_level="medium"
    )

    # Dikshita's module generates the actual question.
    question = generator.generate(policy_decision)

    assert policy_decision["action"] == "ASK_FOLLOW_UP"
    assert policy_decision["target_dimension"] == "complexity"

    assert isinstance(question, str)
    assert len(question) > 0
def test_multi_turn_adaptive_flow():
    engine = PolicyEngine()
    generator = QuestionGenerator()

    # -------------------------
    # TURN 1
    # -------------------------
    first_scores = {
        "algorithm_correctness": 85,
        "logical_reasoning": 70,
        "concept_coverage": 90,
        "completeness": 65,
        "data_structure_usage": 80,
        "complexity": 30,
        "edge_cases": 50
    }

    first_decision = engine.decide(
        scores=first_scores,
        time_remaining=300,
        candidate_level="medium"
    )

    first_question = generator.generate(
        first_decision
    )

    assert first_decision["action"] == "ASK_FOLLOW_UP"
    assert first_decision["target_dimension"] == "complexity"
    assert isinstance(first_question, str)
    assert len(first_question) > 0

    # -------------------------
    # TURN 2
    # Candidate improved in complexity
    # -------------------------
    second_scores = {
        "algorithm_correctness": 85,
        "logical_reasoning": 70,
        "concept_coverage": 90,
        "completeness": 65,
        "data_structure_usage": 80,
        "complexity": 75,
        "edge_cases": 50
    }

    second_decision = engine.decide(
        scores=second_scores,
        time_remaining=180,
        candidate_level="medium"
    )

    second_question = generator.generate(
        second_decision
    )

    # Complexity is now resolved,
    # so the system moves to edge_cases.
    assert second_decision["action"] == "ASK_FOLLOW_UP"
    assert second_decision["target_dimension"] == "edge_cases"
    assert isinstance(second_question, str)
    assert len(second_question) > 0
def test_evaluation_output_to_adaptive_policy():
    engine = PolicyEngine()

    # Simulated structure returned by the Evaluation module.
    evaluation_result = {
        "llm_evaluation": {
            "scores": {
                "algorithm_correctness": 85,
                "logical_reasoning": 70,
                "concept_coverage": 90,
                "completeness": 65,
                "data_structure_usage": 80,
                "complexity": 35,
                "edge_cases": 55
            }
        }
    }

    # Extract scores exactly as the integrated system will.
    scores = evaluation_result["llm_evaluation"]["scores"]

    policy_decision = engine.decide(
        scores=scores,
        time_remaining=180,
        candidate_level="medium"
    )

    assert policy_decision["action"] == "ASK_FOLLOW_UP"
    assert policy_decision["target_dimension"] == "complexity"
    assert policy_decision["difficulty"] == "easy"
    assert policy_decision["goal"] == "clarify_complexity"