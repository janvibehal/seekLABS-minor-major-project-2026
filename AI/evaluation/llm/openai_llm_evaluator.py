from AI.evaluation.llm.llm_evaluator import evaluate_with_llm


def evaluate_with_openai(
    candidate_features: dict,
    problem: dict,
    reference_solution=None,
    rubric=None,
    candidate_state=None
) -> dict:
    """
    Cloud-based evaluation wrapper.

    The actual evaluation logic remains in the existing
    evaluate_with_llm() implementation.

    The existing evaluator already handles:
        - candidate features
        - problem
        - reference solution
        - evaluation rubric
        - candidate state
        - conversation history
        - evaluation prompt construction
        - seven evaluation dimensions
        - score validation
        - ASSESSED / NOT_ASSESSED
        - evidence validation

    The LLM transport used underneath evaluate_with_llm()
    has been switched from Ollama to OpenAI.
    """

    return evaluate_with_llm(
        candidate_features=candidate_features,
        problem=problem,
        reference_solution=reference_solution,
        rubric=rubric,
        candidate_state=candidate_state,
    )