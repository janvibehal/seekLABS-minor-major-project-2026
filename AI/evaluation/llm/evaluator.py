from AI.evaluation.llm.ollama_client import generate_evaluation


def build_evaluation_prompt(
    problem: str,
    reference_solution: str,
    expected_concepts: list,
    expected_complexity: dict,
    candidate_reasoning: list,
    rubric: str
) -> str:
    """
    Build the evaluation prompt using the information
    required by the evaluation design.
    """

    return f"""
You are an automated programming logic evaluator.

Evaluate the candidate's programming solution using the following information.

PROBLEM:
{problem}

REFERENCE SOLUTION:
{reference_solution}

EXPECTED CONCEPTS:
{expected_concepts}

EXPECTED COMPLEXITY:
{expected_complexity}

CANDIDATE REASONING:
{candidate_reasoning}

EVALUATION RUBRIC:
{rubric}

Evaluation principles:
- Evaluate the underlying programming logic, not wording similarity.
- Give credit to valid alternative approaches.
- Do not reward verbosity by itself.
- Do not penalize concise but correct reasoning.
- Separate algorithm correctness from complexity.
- Identify important missing concepts.
- Consider relevant edge cases.
- Evaluate data structure usage and reasoning.

Return ONLY valid JSON.

Use exactly these fields:

{{
  "algorithm_correctness": "correct | partially correct | incorrect",
  "logical_reasoning": "one short sentence",
  "concept_coverage": "one short sentence",
  "completeness": "one short sentence",
  "data_structure_usage": "one short sentence",
  "complexity": "one short sentence",
  "edge_case_handling": "one short sentence",
  "explanation": "one short sentence"
}}

Keep every value extremely concise.
Do not repeat the problem or candidate answer.
Do not write long explanations.
Do not include markdown.
Do not include text outside the JSON object.

Important:
A valid alternative algorithm must be recognized as algorithmically valid
even if its complexity differs from the reference solution.
Evaluate algorithm correctness and complexity separately.
"""


def evaluate_candidate(
    problem: str,
    reference_solution: str,
    expected_concepts: list,
    expected_complexity: dict,
    candidate_reasoning: list,
    rubric: str
) -> dict:
    """
    Build the evaluation prompt and send it to the local LLM.
    """

    prompt = build_evaluation_prompt(
        problem,
        reference_solution,
        expected_concepts,
        expected_complexity,
        candidate_reasoning,
        rubric
    )

    result = generate_evaluation(prompt)

    return {
        "model": result["model"],
        "evaluation": result["evaluation"]
    }