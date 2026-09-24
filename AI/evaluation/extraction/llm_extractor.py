"""
LLM-based candidate answer extraction.

This module converts a candidate's natural-language answer into a
structured NLP state used by the evaluation pipeline.

Important design rule:
- The extractor describes what the candidate communicated.
- It must NOT solve the problem, evaluate correctness, or infer
  unstated details from common algorithm knowledge.
"""

from __future__ import annotations

import json
from typing import Any, Dict, List, Optional

from AI.evaluation.configs.ai_config import EXTRACTOR_MODEL
from AI.evaluation.llm.ollama_client import generate_structured_json


# ============================================================
# Structured output schema
# ============================================================

EXTRACTION_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "approach": {
            "type": ["string", "null"],
        },
        "algorithms": {
            "type": "array",
            "items": {"type": "string"},
        },
        "concepts": {
            "type": "array",
            "items": {"type": "string"},
        },
        "operations": {
            "type": "array",
            "items": {"type": "string"},
        },
        "data_structures": {
            "type": "array",
            "items": {"type": "string"},
        },
        "time_complexity": {
            "type": ["string", "null"],
        },
        "space_complexity": {
            "type": ["string", "null"],
        },
        "reasoning_summary": {
            "type": ["string", "null"],
        },
        "edge_cases": {
            "type": "array",
            "items": {"type": "string"},
        },
        "assumptions": {
            "type": "array",
            "items": {"type": "string"},
        },
        "optimization": {
            "type": ["boolean", "null"],
        },
    },
    "required": [
        "approach",
        "algorithms",
        "concepts",
        "operations",
        "data_structures",
        "time_complexity",
        "space_complexity",
        "reasoning_summary",
        "edge_cases",
        "assumptions",
        "optimization",
    ],
    "additionalProperties": False,
}


# ============================================================
# Structural cleanup helpers
# ============================================================

def _clean_string(value: Any) -> Optional[str]:
    """
    Normalize an optional string field.

    This function performs only structural cleanup.
    It does not add, infer, or reinterpret information.
    """

    if value is None:
        return None

    if not isinstance(value, str):
        value = str(value)

    value = value.strip()

    return value if value else None


def _clean_list(value: Any) -> List[str]:
    """
    Normalize a list of strings.

    Only structural cleanup is performed:
    - non-list values become an empty list
    - non-string items are stringified
    - whitespace is stripped
    - empty values are removed
    - duplicates are removed while preserving order

    No domain-specific normalization is performed here.
    """

    if value is None:
        return []

    if not isinstance(value, list):
        value = [value]

    cleaned: List[str] = []
    seen = set()

    for item in value:
        if item is None:
            continue

        if not isinstance(item, str):
            item = str(item)

        item = item.strip()

        if not item:
            continue

        key = item.casefold()

        if key in seen:
            continue

        seen.add(key)
        cleaned.append(item)

    return cleaned


def _clean_complexity(value: Any) -> Optional[str]:
    """
    Normalize a complexity field.

    No complexity is calculated or inferred here.
    """

    value = _clean_string(value)

    if value is None:
        return None

    return value


def _clean_optimization(value: Any) -> Optional[bool]:
    """
    Normalize the optional optimization flag.

    Only explicit boolean-like representations are accepted.
    """

    if value is None:
        return None

    if isinstance(value, bool):
        return value

    if isinstance(value, str):
        normalized = value.strip().casefold()

        if normalized == "true":
            return True

        if normalized == "false":
            return False

    return None


# ============================================================
# Groq call
# ============================================================

def _call_groq(prompt: str) -> Dict[str, Any]:
    """
    Send the extraction prompt to Groq and parse the structured
    JSON response.

    The extraction logic remains unchanged.
    Only the LLM transport has been migrated from Ollama/OpenAI
    to the centralized Groq client.
    """

    try:
        result = generate_structured_json(
            prompt=prompt,
            model=EXTRACTOR_MODEL,
            schema=EXTRACTION_SCHEMA,
            num_predict=800,
        )

    except Exception as exc:
        raise RuntimeError(
            f"Groq extraction request failed: {exc}"
        ) from exc

    if not isinstance(result, dict):
        raise RuntimeError(
            "Groq extraction result must be a JSON object."
        )

    return result


# ============================================================
# Prompt construction
# ============================================================

def _build_user_prompt(candidate_answer: str) -> str:
    """
    Build a compact extraction prompt.

    The prompt intentionally contains no concrete algorithm examples,
    problem-specific examples, regex examples, or expected solutions.

    The goal is to extract only candidate-supported information while
    minimizing the chance of the model importing unrelated knowledge.
    """

    return f"""
You are a structured information extractor.

Extract ONLY information communicated by the candidate.

Do NOT solve the problem.
Do NOT evaluate the answer.
Do NOT complete missing details.
Do NOT use standard algorithm knowledge to fill gaps.
Do NOT guess.
When information is missing or ambiguous, leave the field empty/null.

Candidate answer:
--- BEGIN ---
{candidate_answer}
--- END ---

Return exactly this JSON structure:

{{
  "approach": string or null,
  "algorithms": array of strings,
  "concepts": array of strings,
  "operations": array of strings,
  "data_structures": array of strings,
  "time_complexity": string or null,
  "space_complexity": string or null,
  "reasoning_summary": string or null,
  "edge_cases": array of strings,
  "assumptions": array of strings,
  "optimization": boolean or null
}}

RULES

APPROACH:
Extract the candidate's overall method.
You may make the wording concise, but do not add a technique the
candidate did not communicate.

ALGORITHMS:
Extract an algorithm or named algorithmic technique ONLY when the
candidate explicitly names it or clearly uses unambiguous
algorithm-specific terminology.
Do NOT invent an algorithm name from a described procedure.
Do NOT infer an algorithm from a data structure, operation, or
complexity.

CONCEPTS:
Extract important technical concepts actually communicated by the
candidate.
Do not add concepts merely because they are normally related to the
problem.

OPERATIONS:
Extract technically meaningful solution actions that the candidate
actually communicates.
Preserve enough context to identify what the operation acts on.
Do not reduce an operation to a generic verb.
Do not extract generic verbs such as "use", "solve", "handle",
"process", or "apply" unless they describe a specific technical
operation.
Do not add steps that were not stated.

DATA STRUCTURES:
Extract data structures explicitly stated or uniquely identified by
the candidate's wording.
Do not infer one merely from storage, lookup, memory, or efficiency
language.

TIME COMPLEXITY:
If the candidate explicitly states a time complexity, COPY it.
Do not omit it.
Do not calculate or infer a time complexity when the candidate does
not state one.

SPACE COMPLEXITY:
If the candidate explicitly states a space complexity, COPY it.
Do not omit it.
Do not calculate or infer a space complexity when the candidate does
not state one.

REASONING SUMMARY:
Extract only actual rationale, justification, purpose, or
cause-and-effect reasoning stated by the candidate.
A complexity statement by itself is NOT reasoning.
Do not turn a procedure into reasoning.
Do not invent reasoning.
Do not simply repeat the approach.

EDGE CASES:
Extract only edge cases explicitly mentioned by the candidate.
Do not generate common or expected edge cases.

ASSUMPTIONS:
Extract only assumptions explicitly stated by the candidate.
Do not create reasonable-sounding assumptions.

OPTIMIZATION:
Return true only when the candidate explicitly communicates an
optimization.
Return false only when the candidate explicitly communicates that
the approach is intentionally not optimized.
Otherwise return null.

FINAL CHECK:
Every extracted item must be supported by the candidate answer.
Do not add information from standard problem-solving knowledge.
Do not infer an algorithm.
Do not infer complexity.
Do not invent operations.
Do not invent concepts.
Do not invent edge cases.
Do not invent assumptions.
Do not invent reasoning.
If unsure, OMIT rather than GUESS.

Return ONLY valid JSON.
""".strip()


# ============================================================
# Result validation
# ============================================================

def _validate_result(result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate and structurally normalize the extractor result.

    This function intentionally does not perform domain-specific
    corrections or semantic additions.
    """

    if not isinstance(result, dict):
        raise ValueError(
            "Extractor result must be a dictionary."
        )

    required_fields = [
        "approach",
        "algorithms",
        "concepts",
        "operations",
        "data_structures",
        "time_complexity",
        "space_complexity",
        "reasoning_summary",
        "edge_cases",
        "assumptions",
        "optimization",
    ]

    for field in required_fields:
        if field not in result:
            raise ValueError(
                f"Extractor result is missing required field: {field}"
            )

    cleaned = {
        "approach": _clean_string(
            result.get("approach")
        ),
        "algorithms": _clean_list(
            result.get("algorithms")
        ),
        "concepts": _clean_list(
            result.get("concepts")
        ),
        "operations": _clean_list(
            result.get("operations")
        ),
        "data_structures": _clean_list(
            result.get("data_structures")
        ),
        "time_complexity": _clean_complexity(
            result.get("time_complexity")
        ),
        "space_complexity": _clean_complexity(
            result.get("space_complexity")
        ),
        "reasoning_summary": _clean_string(
            result.get("reasoning_summary")
        ),
        "edge_cases": _clean_list(
            result.get("edge_cases")
        ),
        "assumptions": _clean_list(
            result.get("assumptions")
        ),
        "optimization": _clean_optimization(
            result.get("optimization")
        ),
    }

    return cleaned


# ============================================================
# Public extraction API
# ============================================================

def extract_with_llm(
    candidate_answer: str,
) -> Dict[str, Any]:
    """
    Extract structured NLP information from a candidate answer.

    Parameters
    ----------
    candidate_answer:
        Raw natural-language candidate response.

    Returns
    -------
    Dict[str, Any]
        Validated structured extraction state.

    Raises
    ------
    ValueError
        If the candidate answer is invalid or empty.

    RuntimeError
        If the Groq request or model response is invalid.
    """

    if not isinstance(candidate_answer, str):
        raise ValueError(
            "candidate_answer must be a string."
        )

    candidate_answer = candidate_answer.strip()

    if not candidate_answer:
        raise ValueError(
            "candidate_answer cannot be empty."
        )

    prompt = _build_user_prompt(candidate_answer)

    raw_result = _call_groq(prompt)

    return _validate_result(raw_result)


# ============================================================
# Backward-compatible aliases
# ============================================================

def extract_candidate_state(
    candidate_answer: str,
) -> Dict[str, Any]:
    """
    Backward-compatible wrapper around extract_with_llm().
    """

    return extract_with_llm(candidate_answer)


def extract_candidate_answer(
    candidate_answer: str,
) -> Dict[str, Any]:
    """
    Backward-compatible wrapper around extract_with_llm().
    """

    return extract_with_llm(candidate_answer)