"""
Candidate answer extraction service.

Pipeline:

    Candidate Answer
          |
          v
    Mechanical Normalization
          |
          v
    LLM Semantic Extraction
          |
          v
    Candidate Feature State

Important:
- Semantic extraction is performed only by the LLM extractor.
- This service does NOT use keyword dictionaries.
- This service does NOT use regex-based semantic extraction.
- The optional `problem` argument is accepted for compatibility,
  but it is NEVER forwarded to the LLM extractor.
"""

from typing import Any, Dict, Optional

from AI.evaluation.preprocessing.cleaner import normalize_answer

# IMPORTANT:
# Import the real LLM extractor under a PRIVATE name.
#
# Do NOT import it as `extract_candidate_state`, because this file
# also exposes a compatibility function with that public name.
from AI.evaluation.extraction.llm_extractor import (
    extract_candidate_state as _llm_extract_candidate_state,
)


# ============================================================
# EMPTY RESULT
# ============================================================

def _empty_result() -> Dict[str, Any]:
    """
    Return the canonical empty extraction result.
    """

    return {
        "original_answer": "",
        "normalized_answer": "",

        "concepts_detected": [],
        "reasoning": [],

        "complexity_claim": {
            "time": None,
            "space": None,
        },

        "approach": None,
        "algorithms": [],
        "concepts": [],
        "operations": [],
        "data_structures": [],

        "time_complexity": None,
        "space_complexity": None,

        "edge_cases": [],
        "reasoning_summary": None,
        "assumptions": [],
        "optimization": None,

        "extraction_source": "empty",
    }


# ============================================================
# LLM EXTRACTION COMPATIBILITY WRAPPER
# ============================================================

def extract_with_llm(
    candidate_answer: str,
) -> Dict[str, Any]:
    """
    Extract semantic candidate information using the actual
    LLM extractor.

    IMPORTANT:
    This function accepts ONLY the candidate answer.

    The problem is intentionally NOT passed to the LLM.

    This public wrapper is required because the extraction
    contract/tests patch:

        extraction_service.extract_with_llm

    Therefore extract_candidate_features() must call this
    wrapper rather than calling the LLM extractor directly.
    """

    if candidate_answer is None:
        candidate_answer = ""

    if not isinstance(
        candidate_answer,
        str,
    ):
        raise TypeError(
            "Candidate answer must be a string."
        )

    # Call the REAL LLM extractor.
    #
    # The private alias prevents this from accidentally calling
    # the compatibility function defined later in this file.
    return _llm_extract_candidate_state(
        candidate_answer
    )


# ============================================================
# STRUCTURAL LIST NORMALIZATION
# ============================================================

def _ensure_list(
    value: Any,
) -> list:
    """
    Ensure fields that are contractually lists are lists.

    This is structural normalization only.
    No semantic information is added.
    """

    if value is None:
        return []

    if isinstance(
        value,
        list,
    ):
        return value

    return []


# ============================================================
# REASONING VIEW
# ============================================================

def _build_reasoning(
    reasoning_summary: Any,
) -> list:
    """
    Build the backward-compatible `reasoning` field from
    the LLM's reasoning_summary.

    No new reasoning is generated here.
    """

    if not isinstance(
        reasoning_summary,
        str,
    ):
        return []

    reasoning_summary = (
        reasoning_summary.strip()
    )

    if not reasoning_summary:
        return []

    return [
        reasoning_summary
    ]


# ============================================================
# CONCEPTS DETECTED VIEW
# ============================================================

def _build_concepts_detected(
    concepts: list,
    data_structures: list,
    algorithms: list,
    operations: list,
) -> list:
    """
    Build the backward-compatible `concepts_detected` field.

    This is only a mechanical aggregation of values already
    returned by the LLM.

    No semantic interpretation is performed.
    """

    concepts_detected = []

    for values in (
        concepts,
        data_structures,
        algorithms,
        operations,
    ):
        for value in values:

            if value not in concepts_detected:
                concepts_detected.append(
                    value
                )

    return concepts_detected


# ============================================================
# MAIN EXTRACTION FUNCTION
# ============================================================

def extract_candidate_features(
    answer: Any,
    problem: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Extract semantic candidate features.

    PUBLIC CONTRACT:

        extract_candidate_features(
            answer,
            problem=None
        )

    Examples:

        extract_candidate_features(
            "I will use a hash map."
        )

        extract_candidate_features(
            "I will use a hash map.",
            problem={
                "problem_id": "P001",
                "title": "Two Sum",
            },
        )

    The optional `problem` parameter exists for compatibility
    with the wider evaluation pipeline.

    IMPORTANT:
    `problem` is deliberately NOT forwarded to the LLM.

    Pipeline:

        Candidate answer
              ↓
        Mechanical normalization
              ↓
        LLM semantic extraction
              ↓
        Candidate feature state
    """

    # ========================================================
    # INPUT VALIDATION
    # ========================================================

    if answer is None:
        answer = ""

    if not isinstance(
        answer,
        str,
    ):
        raise TypeError(
            "Candidate answer must be a string."
        )

    # ========================================================
    # MECHANICAL NORMALIZATION
    # ========================================================

    cleaned = normalize_answer(
        answer
    )

    original_answer = cleaned.get(
        "original_answer",
        "",
    )

    normalized_answer = cleaned.get(
        "normalized_answer",
        "",
    )

    # ========================================================
    # EMPTY ANSWER
    # ========================================================

    if not normalized_answer:
        return {
            "original_answer": original_answer,
            "normalized_answer": normalized_answer,

            "concepts_detected": [],
            "reasoning": [],

            "complexity_claim": {
                "time": None,
                "space": None,
            },

            "approach": None,
            "algorithms": [],
            "concepts": [],
            "operations": [],
            "data_structures": [],

            "time_complexity": None,
            "space_complexity": None,

            "edge_cases": [],
            "reasoning_summary": None,
            "assumptions": [],
            "optimization": None,

            "extraction_source": "empty",
        }

    # ========================================================
    # LLM SEMANTIC EXTRACTION
    # ========================================================
    #
    # IMPORTANT:
    #
    # `problem` is intentionally NOT passed here.
    #
    # Correct:
    #
    #     extract_with_llm(normalized_answer)
    #
    # NOT:
    #
    #     extract_with_llm(
    #         normalized_answer,
    #         problem=problem
    #     )
    #
    # This is required by the extraction contract.
    # ========================================================

    semantic = extract_with_llm(
        normalized_answer
    )

    if not isinstance(
        semantic,
        dict,
    ):
        raise RuntimeError(
            "LLM extractor must return a dictionary."
        )

    # ========================================================
    # READ LLM SEMANTIC FIELDS
    # ========================================================
    #
    # These values come from the LLM extractor.
    #
    # This layer does not determine whether the information
    # is semantically correct.
    # ========================================================

    approach = semantic.get(
        "approach"
    )

    algorithms = _ensure_list(
        semantic.get(
            "algorithms"
        )
    )

    concepts = _ensure_list(
        semantic.get(
            "concepts"
        )
    )

    operations = _ensure_list(
        semantic.get(
            "operations"
        )
    )

    data_structures = _ensure_list(
        semantic.get(
            "data_structures"
        )
    )

    time_complexity = semantic.get(
        "time_complexity"
    )

    space_complexity = semantic.get(
        "space_complexity"
    )

    reasoning_summary = semantic.get(
        "reasoning_summary"
    )

    edge_cases = _ensure_list(
        semantic.get(
            "edge_cases"
        )
    )

    assumptions = _ensure_list(
        semantic.get(
            "assumptions"
        )
    )

    # Preserve the LLM's original value.
    #
    # This is important because the contract can contain values
    # such as True / False / None.
    optimization = semantic.get(
        "optimization"
    )

    # ========================================================
    # BACKWARD-COMPATIBLE VIEWS
    # ========================================================

    concepts_detected = (
        _build_concepts_detected(
            concepts=concepts,
            data_structures=data_structures,
            algorithms=algorithms,
            operations=operations,
        )
    )

    reasoning = _build_reasoning(
        reasoning_summary
    )

    complexity_claim = {
        "time": time_complexity,
        "space": space_complexity,
    }

    # ========================================================
    # FINAL CANDIDATE FEATURE CONTRACT
    # ========================================================

    return {
        # ----------------------------------------------------
        # Existing / backward-compatible fields
        # ----------------------------------------------------

        "original_answer": original_answer,

        "normalized_answer": normalized_answer,

        "concepts_detected": concepts_detected,

        "reasoning": reasoning,

        "complexity_claim": complexity_claim,

        # ----------------------------------------------------
        # Candidate NLP state
        # ----------------------------------------------------

        "approach": approach,

        "algorithms": algorithms,

        "concepts": concepts,

        "operations": operations,

        "data_structures": data_structures,

        "time_complexity": time_complexity,

        "space_complexity": space_complexity,

        "edge_cases": edge_cases,

        "reasoning_summary": reasoning_summary,

        "assumptions": assumptions,

        "optimization": optimization,

        # ----------------------------------------------------
        # Metadata
        # ----------------------------------------------------

        "extraction_source": "llm",
    }


# ============================================================
# BACKWARD-COMPATIBILITY PUBLIC ALIAS
# ============================================================

def extract_candidate_state(
    answer: str,
) -> Dict[str, Any]:
    """
    Backward-compatible public alias.

    IMPORTANT:
    This delegates to extract_candidate_features().

    It does NOT participate in the internal LLM extraction
    path, which uses `_llm_extract_candidate_state`.
    """

    return extract_candidate_features(
        answer
    )


# ============================================================
# PUBLIC EXPORTS
# ============================================================

__all__ = [
    "extract_candidate_features",
    "extract_candidate_state",
    "extract_with_llm",
]