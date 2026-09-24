import json

from AI.evaluation.configs.ai_config import FOLLOWUP_MODEL
from AI.evaluation.dataset_loader import load_evaluation_context
from AI.evaluation.llm.ollama_client import generate_groq_response


# ============================================================
# HELPERS
# ============================================================

def _safe_string(value):
    if value is None:
        return ""

    if isinstance(value, str):
        return value.strip()

    return str(value).strip()


def _safe_list(value):
    if not isinstance(value, list):
        return []

    return [
        item
        for item in value
        if item is not None
    ]


def _compact_dict(
    value,
    keys,
):
    if not isinstance(value, dict):
        return {}

    result = {}

    for key in keys:
        item = value.get(key)

        if item is not None:
            result[key] = item

    return result


def _extract_previous_questions(history):
    questions = []

    if not isinstance(history, list):
        return questions

    for turn in history:

        if not isinstance(turn, dict):
            continue

        question = turn.get(
            "current_interviewer_question"
        )

        if (
            isinstance(question, str)
            and question.strip()
        ):
            questions.append(
                question.strip()
            )

    return questions


def _compact_history(history):
    """
    Keep only information that can affect the next
    interviewer question.

    The full history can become very large and unnecessarily
    consume Groq TPM quota.
    """

    if not isinstance(history, list):
        return []

    compact = []

    for turn in history[-5:]:

        if not isinstance(turn, dict):
            continue

        compact_turn = {}

        for key in (
            "candidate_answer",
            "current_interviewer_question",
            "primary_classification",
            "secondary_classification",
            "primary_adaptive_gap",
        ):
            value = turn.get(key)

            if value is not None:
                compact_turn[key] = value

        if compact_turn:
            compact.append(
                compact_turn
            )

    return compact


def _compact_scores(scores):
    """
    Only send dimension + score.

    Evidence is handled separately and does not need the
    entire evaluation structure.
    """

    if not isinstance(scores, dict):
        return {}

    compact = {}

    for dimension, value in scores.items():

        if not isinstance(value, dict):
            continue

        score = value.get("score")

        if score is not None:
            compact[dimension] = score

    return compact


def _compact_evidence(evidence):
    """
    Keep evidence short enough for the follow-up prompt.
    """

    if not isinstance(evidence, dict):
        return {}

    compact = {}

    for key, value in evidence.items():

        if value is None:
            continue

        text = str(value).strip()

        if not text:
            continue

        # Prevent huge evaluation evidence from entering
        # the follow-up generation prompt.
        compact[key] = text[:500]

    return compact


def _compact_reference(reference):
    """
    Only include fields required to guide the adaptive
    question.

    Do not send the complete dataset reference object.
    """

    if not isinstance(reference, dict):
        return None

    allowed_keys = [
        "Reference ID",
        "Solution Type",
        "Expected Approach",
        "Expected Data Structures",
        "Time Complexity",
        "Space Complexity",
        "Reasoning Steps",
        "Edge Cases",
        "Optimization Goal",
        "Next Better Reference ID",
    ]

    result = {}

    for key in allowed_keys:

        value = reference.get(key)

        if value is None:
            continue

        if isinstance(value, list):
            result[key] = value[:10]

        elif isinstance(value, str):
            result[key] = value[:1000]

        else:
            result[key] = value

    return result


# ============================================================
# FOLLOW-UP GENERATOR
# ============================================================

def generate_followup_question(
    problem: dict,
    candidate_answer: str,
    candidate_state: dict,
    followup_strategy: dict
) -> str:
    """
    Generate exactly one adaptive follow-up question.

    The adaptive decision itself is NOT made here.

    This function only converts the already-selected
    adaptive target into a natural interviewer question.

    Groq is used as the text-generation backend.
    """

    # ========================================================
    # VALIDATION
    # ========================================================

    if not isinstance(
        problem,
        dict
    ):
        raise TypeError(
            "problem must be a dictionary."
        )

    if not isinstance(
        candidate_state,
        dict
    ):
        raise TypeError(
            "candidate_state must be a dictionary."
        )

    if not isinstance(
        followup_strategy,
        dict
    ):
        raise TypeError(
            "followup_strategy must be a dictionary."
        )

    if not isinstance(
        candidate_answer,
        str
    ):
        raise TypeError(
            "candidate_answer must be a string."
        )

    # ========================================================
    # EXTRACT STRATEGY
    # ========================================================

    adaptive_gap = _safe_string(
        followup_strategy.get(
            "adaptive_gap",
            ""
        )
    )

    objective = _safe_string(
        followup_strategy.get(
            "objective",
            ""
        )
    )

    focus = _safe_list(
        followup_strategy.get(
            "focus",
            []
        )
    )

    instruction = _safe_string(
        followup_strategy.get(
            "instruction",
            ""
        )
    )

    current_reference_id = (
        followup_strategy.get(
            "current_reference_id"
        )
    )

    target_reference_id = (
        followup_strategy.get(
            "target_reference_id"
        )
    )

    # ========================================================
    # EXTRACT PROBLEM
    # ========================================================

    problem_title = _safe_string(
        problem.get(
            "title",
            ""
        )
    )

    problem_description = _safe_string(
        problem.get(
            "description",
            ""
        )
    )

    # Keep the problem description bounded.
    problem_description = (
        problem_description[:2000]
    )

    # ========================================================
    # EXTRACT STATE
    # ========================================================

    scores = candidate_state.get(
        "scores",
        {}
    )

    evidence = candidate_state.get(
        "evidence",
        {}
    )

    history = candidate_state.get(
        "history",
        []
    )

    compact_scores = _compact_scores(
        scores
    )

    compact_evidence = _compact_evidence(
        evidence
    )

    compact_history = _compact_history(
        history
    )

    previous_questions = (
        _extract_previous_questions(
            history
        )
    )

    # Only keep the most recent questions.
    previous_questions = (
        previous_questions[-5:]
    )

    # ========================================================
    # REFERENCE SOLUTIONS
    # ========================================================

    current_reference = None
    target_reference = None

    if (
        current_reference_id
        or target_reference_id
    ):

        reference_solutions, _ = (
            load_evaluation_context(
                problem
            )
        )

        if not isinstance(
            reference_solutions,
            list
        ):
            reference_solutions = []

        for reference in reference_solutions:

            if not isinstance(
                reference,
                dict
            ):
                continue

            reference_id = reference.get(
                "Reference ID"
            )

            if (
                reference_id
                == current_reference_id
            ):
                current_reference = (
                    _compact_reference(
                        reference
                    )
                )

            if (
                reference_id
                == target_reference_id
            ):
                target_reference = (
                    _compact_reference(
                        reference
                    )
                )

    # ========================================================
    # COMPACT CANDIDATE ANSWER
    # ========================================================

    candidate_answer_for_prompt = (
        candidate_answer.strip()
    )

    # Prevent accidental enormous prompts.
    if len(candidate_answer_for_prompt) > 5000:
        candidate_answer_for_prompt = (
            candidate_answer_for_prompt[:5000]
        )

    # ========================================================
    # PROMPT
    # ========================================================

    prompt = f"""
You are an adaptive technical interviewer.

Generate exactly ONE natural follow-up question for the candidate.

Do not solve the problem.
Do not reveal scores.
Do not mention evaluation, rubrics, weaknesses, classifications,
adaptive gaps, or internal system information.
Do not give the answer.

PROBLEM
Title: {problem_title}

Description:
{problem_description}

CANDIDATE ANSWER
{candidate_answer_for_prompt}

CURRENT SCORES
{json.dumps(compact_scores, ensure_ascii=False)}

CURRENT EVIDENCE
{json.dumps(compact_evidence, ensure_ascii=False)}

RECENT CONVERSATION
{json.dumps(compact_history, ensure_ascii=False)}

PREVIOUS FOLLOW-UP QUESTIONS
{json.dumps(previous_questions, ensure_ascii=False)}

ADAPTIVE TARGET
Target: {adaptive_gap}
Objective: {objective}
Focus: {json.dumps(focus, ensure_ascii=False)}
Instruction: {instruction}

CURRENT REFERENCE
ID: {current_reference_id}
{json.dumps(current_reference, ensure_ascii=False)}

TARGET REFERENCE
ID: {target_reference_id}
{json.dumps(target_reference, ensure_ascii=False)}

RULES

1. Ask exactly ONE question.
2. Target the adaptive area.
3. Make the question specific to the candidate's actual approach.
4. Do not repeat a previous question.
5. If the same area was already questioned, probe a deeper aspect.
6. Do not mention scores or evaluation.
7. Do not reveal internal reasoning.
8. Do not provide the solution.
9. Keep the question concise.
10. Use the target reference only as internal guidance.
11. Do not reveal the target reference.
12. Do not directly state the target algorithm or solution.
13. Lead the candidate to discover the improvement themselves.
14. The candidate must still explain or derive the answer.

Return ONLY valid JSON.

Exactly this structure:

{{
    "question": "your question here"
}}
""".strip()

    # ========================================================
    # GROQ REQUEST
    # ========================================================

    try:

        response_text = generate_groq_response(
            prompt,
            temperature=0,
            max_tokens=300
        )

    except Exception as error:

        raise RuntimeError(
            f"Failed to generate follow-up question: {error}"
        ) from error

    # ========================================================
    # PARSE RESPONSE
    # ========================================================

    if not isinstance(
        response_text,
        str
    ):
        raise RuntimeError(
            "Groq follow-up response must be a string."
        )

    response_text = (
        response_text.strip()
    )

    if not response_text:
        raise RuntimeError(
            "Groq returned an empty follow-up response."
        )

    # --------------------------------------------------------
    # Remove markdown fences if Groq adds them.
    # --------------------------------------------------------

    if response_text.startswith(
        "```"
    ):

        lines = (
            response_text.splitlines()
        )

        if lines:
            lines = lines[1:]

        if (
            lines
            and lines[-1].strip()
            == "```"
        ):
            lines = lines[:-1]

        response_text = (
            "\n".join(lines)
            .strip()
        )

    # ========================================================
    # JSON PARSING
    # ========================================================

    try:

        parsed = json.loads(
            response_text
        )

    except json.JSONDecodeError:

        # ----------------------------------------------------
        # Fallback: find the JSON object inside surrounding
        # text.
        # ----------------------------------------------------

        start = response_text.find(
            "{"
        )

        end = response_text.rfind(
            "}"
        )

        if (
            start == -1
            or end == -1
            or end <= start
        ):
            raise RuntimeError(
                "Groq did not return valid JSON "
                "for the follow-up question."
            )

        try:

            parsed = json.loads(
                response_text[
                    start:end + 1
                ]
            )

        except json.JSONDecodeError as error:

            raise RuntimeError(
                "Groq returned malformed follow-up JSON."
            ) from error

    # ========================================================
    # VALIDATE JSON
    # ========================================================

    if not isinstance(
        parsed,
        dict
    ):
        raise RuntimeError(
            "Follow-up response must be a JSON object."
        )

    question = parsed.get(
        "question"
    )

    if not isinstance(
        question,
        str
    ):
        raise RuntimeError(
            "Follow-up response does not contain "
            "a valid question string."
        )

    question = (
        question.strip()
    )

    if not question:
        raise RuntimeError(
            "Follow-up question is empty."
        )

    # ========================================================
    # REMOVE ACCIDENTAL MULTIPLE QUESTIONS
    # ========================================================

    # We don't rewrite the generated question. We only
    # validate that the model returned something usable.

    return question


# ============================================================
# BACKWARD-COMPATIBILITY ALIAS
# ============================================================

def generate_followup(
    problem: dict,
    candidate_answer: str,
    candidate_state: dict,
    followup_strategy: dict
) -> str:
    """
    Backward-compatible alias.
    """

    return generate_followup_question(
        problem=problem,
        candidate_answer=candidate_answer,
        candidate_state=candidate_state,
        followup_strategy=followup_strategy
    )