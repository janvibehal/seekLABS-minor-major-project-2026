
import json

from AI.evaluation.configs.ai_config import FOLLOWUP_MODEL
from AI.evaluation.dataset_loader import load_evaluation_context
from AI.evaluation.llm.groq_client import generate_groq_response


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
    if not isinstance(value, (list, tuple, set)):
        return []

    return [
        item
        for item in value
        if item is not None
    ]


def _safe_dict(value):
    if isinstance(value, dict):
        return value

    if hasattr(value, "model_dump"):
        try:
            result = value.model_dump()
            if isinstance(result, dict):
                return result
        except Exception:
            pass

    if hasattr(value, "__dict__"):
        return vars(value)

    return {}


def _normalize_reference_id(value):
    """Normalize IDs that may contain accidental outer quotes."""

    normalized = _safe_string(value)

    while (
        len(normalized) >= 2
        and normalized[0] == normalized[-1]
        and normalized[0] in {"'", '"'}
    ):
        normalized = normalized[1:-1].strip()

    return normalized or None


def _compact_scores(scores):
    scores = _safe_dict(scores)
    compact = {}

    for dimension, value in scores.items():
        if isinstance(value, dict):
            status = _safe_string(
                value.get("assessment_status")
                or value.get("status")
            ).lower().replace("-", "_").replace(" ", "_")

            if status in {
                "not_assessed",
                "unassessed",
                "not_evaluated",
                "pending",
            }:
                compact[dimension] = "NOT ASSESSED"
                continue

            score = value.get("score")

            if score is not None:
                compact[dimension] = score

        elif isinstance(value, (int, float)) and not isinstance(value, bool):
            compact[dimension] = value

    return compact


def _compact_evidence(evidence):
    evidence = _safe_dict(evidence)
    compact = {}

    for key, value in evidence.items():
        if value is None:
            continue

        text = _safe_string(value)

        if text:
            compact[key] = text[:500]

    return compact


def _compact_history(history):
    if not isinstance(history, list):
        return []

    compact = []

    for turn in history[-5:]:
        turn = _safe_dict(turn)

        if not turn:
            continue

        item = {}

        for key in (
            "candidate_answer",
            "current_interviewer_question",
            "primary_classification",
            "secondary_classification",
            "primary_adaptive_gap",
        ):
            value = turn.get(key)

            if value is not None:
                item[key] = value

        if item:
            compact.append(item)

    return compact


def _extract_previous_questions(history):
    questions = []

    if not isinstance(history, list):
        return questions

    for turn in history:
        turn = _safe_dict(turn)

        question = turn.get("current_interviewer_question")

        if isinstance(question, str) and question.strip():
            questions.append(question.strip())

    return questions


def _compact_reference(reference):
    if not isinstance(reference, dict):
        return None

    allowed_keys = (
        "Reference ID",
        "reference_id",
        "Solution Type",
        "Expected Approach",
        "Expected Data Structures",
        "Time Complexity",
        "Space Complexity",
        "Reasoning Steps",
        "Edge Cases",
        "Optimization Goal",
        "Next Better Reference ID",
    )

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


def _load_reference_context(problem, current_reference_id, target_reference_id):
    """Load current and target references without making them mandatory."""

    current_reference = None
    target_reference = None

    current_id = _normalize_reference_id(current_reference_id)
    target_id = _normalize_reference_id(target_reference_id)

    if not current_id and not target_id:
        return current_reference, target_reference

    try:
        reference_solutions, _ = load_evaluation_context(problem)

        if not isinstance(reference_solutions, list):
            return current_reference, target_reference

        for reference in reference_solutions:
            if not isinstance(reference, dict):
                continue

            reference_id = _normalize_reference_id(
                reference.get("Reference ID")
                or reference.get("reference_id")
            )

            if reference_id == current_id:
                current_reference = _compact_reference(reference)

            if reference_id == target_id:
                target_reference = _compact_reference(reference)

    except Exception as error:
        print(
            "[WARNING] Could not load follow-up reference context: "
            f"{error}"
        )

    return current_reference, target_reference


# ============================================================
# FALLBACK QUESTIONS
# ============================================================

def _fallback_question(adaptive_gap, candidate_answer):
    """
    Produce a deterministic question aligned with the selected gap.
    """

    gap = _safe_string(adaptive_gap).lower()
    answer = _safe_string(candidate_answer).lower()

    if "complexity" in gap:
        if "nested loop" in answer or "brute force" in answer:
            return (
                "What are the time and space complexities of your "
                "nested-loop approach, and why?"
            )

        return (
            "What are the time and space complexities of your current "
            "approach, and how would you justify them?"
        )

    if "edge" in gap:
        return (
            "How would your approach behave with empty input, duplicate "
            "values, or no valid pair?"
        )

    if "optim" in gap:
        return (
            "What is the main limitation of your current approach, "
            "and how could you improve its efficiency?"
        )

    if "reason" in gap or "logic" in gap:
        return (
            "Can you explain step by step why your approach works "
            "and why it terminates?"
        )

    if "data structure" in gap or "concept" in gap:
        return (
            "Which data structure supports your approach, and why "
            "is it appropriate for this problem?"
        )

    if "completeness" in gap:
        return (
            "What additional implementation details and edge cases "
            "would you handle before considering your solution complete?"
        )

    if "correct" in gap:
        return (
            "Why does your approach return a correct answer whenever "
            "a valid solution exists?"
        )

    return (
        "Can you explain the next step in your approach and how "
        "you would verify that it works?"
    )


def _question_key(question):
    """Normalize question text for duplicate detection."""

    text = _safe_string(question).casefold()

    return " ".join(text.split()).rstrip(" ?.!") 


def _is_repeated_question(question, previous_questions):
    candidate_key = _question_key(question)

    if not candidate_key:
        return True

    previous_keys = {
        _question_key(item)
        for item in previous_questions
        if isinstance(item, str)
    }

    return candidate_key in previous_keys


def _select_nonrepeated_fallback(
    adaptive_gap,
    candidate_answer,
    previous_questions,
):
    """
    Try gap-specific fallbacks before using a general fallback.
    If every candidate repeats, return a distinct general question.
    """

    candidates = [
        _fallback_question(adaptive_gap, candidate_answer),
        (
            "What evidence would convince you that your approach "
            "is correct for this problem?"
        ),
        (
            "What assumptions does your solution make, and how "
            "would you validate them?"
        ),
        (
            "How would you test your approach on a small example "
            "and verify the result?"
        ),
    ]

    for question in candidates:
        if not _is_repeated_question(question, previous_questions):
            return question

    # Last-resort fallback: avoid reusing a previous question.
    # The turn number gives the interviewer a distinct test prompt.
    question_number = len(previous_questions) + 1

    return (
        f"Could you give a new example for your approach and explain "
        f"how you would validate it in test case {question_number}?"
    )


# ============================================================
# GROQ RESPONSE PARSING
# ============================================================

def _parse_question_response(response_text):
    """Parse a JSON question, tolerating surrounding markdown fences."""

    if not isinstance(response_text, str):
        return None

    response_text = response_text.strip()

    if not response_text:
        return None

    if response_text.startswith("```"):
        lines = response_text.splitlines()

        if lines:
            lines = lines[1:]

        if lines and lines[-1].strip().startswith("```"):
            lines = lines[:-1]

        response_text = "\n".join(lines).strip()

    parsed = None

    try:
        parsed = json.loads(response_text)
    except json.JSONDecodeError:
        start = response_text.find("{")
        end = response_text.rfind("}")

        if start == -1 or end <= start:
            return None

        try:
            parsed = json.loads(response_text[start:end + 1])
        except json.JSONDecodeError:
            return None

    if not isinstance(parsed, dict):
        return None

    question = parsed.get("question")

    if not isinstance(question, str):
        return None

    question = question.strip()

    if not question or not question.endswith("?"):
        return None

    # Require a single concise question rather than multiple questions.
    if question.count("?") != 1:
        return None

    return question


# ============================================================
# FOLLOW-UP GENERATOR
# ============================================================

def generate_followup_question(
    problem: dict,
    candidate_answer: str,
    candidate_state: dict,
    followup_strategy: dict,
) -> str:
    """
    Generate one adaptive follow-up question.

    The policy engine decides what to probe. This function turns
    that decision into a question and uses a safe fallback if
    generation fails.
    """

    if not isinstance(problem, dict):
        raise TypeError("problem must be a dictionary.")

    if not isinstance(candidate_state, dict):
        raise TypeError("candidate_state must be a dictionary.")

    if not isinstance(followup_strategy, dict):
        raise TypeError("followup_strategy must be a dictionary.")

    if not isinstance(candidate_answer, str):
        raise TypeError("candidate_answer must be a string.")

    # --------------------------------------------------------
    # Extract policy instructions
    # --------------------------------------------------------

    adaptive_gap = _safe_string(
        followup_strategy.get("adaptive_gap")
        or followup_strategy.get("target_dimension")
    )

    objective = _safe_string(
        followup_strategy.get("objective")
        or followup_strategy.get("goal")
    )

    focus = _safe_list(
        followup_strategy.get("focus", [])
    )

    instruction = _safe_string(
        followup_strategy.get("instruction")
    )

    action = _safe_string(
        followup_strategy.get("action")
    ).upper()

    # A terminal policy must not produce another question.
    if action == "STOP":
        return ""

    current_reference_id = followup_strategy.get(
        "current_reference_id"
    )

    target_reference_id = followup_strategy.get(
        "target_reference_id"
    )

    # --------------------------------------------------------
    # Extract problem and candidate context
    # --------------------------------------------------------

    problem_title = _safe_string(
        problem.get("title") or problem.get("name")
    )

    problem_description = _safe_string(
        problem.get("description")
    )[:2000]

    scores = _compact_scores(
        candidate_state.get("scores", {})
    )

    evidence = _compact_evidence(
        candidate_state.get("evidence", {})
    )

    history = _compact_history(
        candidate_state.get("history", [])
    )

    previous_questions = _extract_previous_questions(
        candidate_state.get("history", [])
    )[-10:]

    candidate_answer_for_prompt = candidate_answer.strip()[:5000]

    # --------------------------------------------------------
    # Reference context
    # --------------------------------------------------------

    current_reference, target_reference = _load_reference_context(
        problem,
        current_reference_id,
        target_reference_id,
    )

    # --------------------------------------------------------
    # Deterministic fallback
    # --------------------------------------------------------

    fallback = _select_nonrepeated_fallback(
        adaptive_gap,
        candidate_answer_for_prompt,
        previous_questions,
    )

    # --------------------------------------------------------
    # Prompt
    # --------------------------------------------------------

    prompt = f"""
You are an adaptive technical interviewer.

Generate exactly ONE concise follow-up question.

The policy engine has already chosen the target dimension.
You must follow that decision.

RULES
- Ask about the specified adaptive target and objective.
- Ask one question only.
- Do not solve the problem or reveal the optimal solution.
- Do not mention scores, evaluation labels, or internal policy.
- Do not repeat a previous question.
- Do not switch to a different evaluation dimension.
- If the target is reasoning, ask why the approach works.
- If the target is complexity, ask for complexity and justification.
- If the target is edge cases, ask about relevant boundary cases.
- If the target is concept coverage, probe the missing concept.
- Use reference context only to guide the question; do not disclose
  the target reference solution to the candidate.
- The question must end with exactly one question mark.

PROBLEM
Title: {problem_title}
Description: {problem_description}

CANDIDATE'S LATEST ANSWER
{candidate_answer_for_prompt}

CURRENT SCORES
{json.dumps(scores, ensure_ascii=False)}

CURRENT EVIDENCE
{json.dumps(evidence, ensure_ascii=False)}

RECENT CONVERSATION
{json.dumps(history, ensure_ascii=False)}

PREVIOUS QUESTIONS — DO NOT REPEAT
{json.dumps(previous_questions, ensure_ascii=False)}

POLICY DECISION
Action: {action or "ASK_FOLLOW_UP"}
Target dimension: {adaptive_gap}
Objective: {objective}
Focus: {json.dumps(focus, ensure_ascii=False)}
Instruction: {instruction}

CURRENT REFERENCE — INTERNAL CONTEXT
{json.dumps(current_reference, ensure_ascii=False)}

TARGET REFERENCE — INTERNAL CONTEXT
{json.dumps(target_reference, ensure_ascii=False)}

Return ONLY valid JSON:
{{
    "question": "One concise question ending with a question mark?"
}}
""".strip()

    # --------------------------------------------------------
    # Groq request
    # --------------------------------------------------------

    try:
        response_text = generate_groq_response(
            prompt,
            temperature=0,
            max_tokens=300,
        )
    except Exception as error:
        print(
            "[WARNING] Groq follow-up generation failed: "
            f"{error}"
        )
        return fallback

    # --------------------------------------------------------
    # Parse and validate
    # --------------------------------------------------------

    question = _parse_question_response(response_text)

    if question is None:
        print(
            "[WARNING] Groq returned an invalid follow-up response. "
            "Using fallback question."
        )
        return fallback

    if _is_repeated_question(question, previous_questions):
        print(
            "[WARNING] Groq repeated a previous question. "
            "Using fallback question."
        )
        return fallback

    return question


# ============================================================
# BACKWARD-COMPATIBILITY ALIAS
# ============================================================

def generate_followup(
    problem: dict,
    candidate_answer: str,
    candidate_state: dict,
    followup_strategy: dict,
) -> str:
    """Backward-compatible wrapper."""

    return generate_followup_question(
        problem=problem,
        candidate_answer=candidate_answer,
        candidate_state=candidate_state,
        followup_strategy=followup_strategy,
    )
