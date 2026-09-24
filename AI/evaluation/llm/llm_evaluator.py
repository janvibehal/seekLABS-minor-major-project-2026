import json

from AI.evaluation.llm.ollama_client import generate_evaluation


# ============================================================
# EVALUATION DIMENSIONS
# ============================================================

EVALUATION_DIMENSIONS = [
    "algorithm_correctness",
    "logical_reasoning",
    "concept_coverage",
    "completeness",
    "data_structure",
    "complexity",
    "edge_cases",
]


# ============================================================
# HELPERS
# ============================================================

def _empty_dimension(message: str) -> dict:
    """
    Create a NOT_ASSESSED evaluation dimension.
    """

    return {
        "score": None,
        "assessment_status": "NOT_ASSESSED",
        "evidence": message,
    }


def _empty_evaluation(error_message: str) -> dict:
    """
    Return a structurally valid empty evaluation.
    """

    return {
        "scores": {
            dimension: _empty_dimension(
                "The evaluation could not be completed."
            )
            for dimension in EVALUATION_DIMENSIONS
        },
        "errors": [error_message],
    }


def _clean_string(value):
    """
    Structural normalization only.

    No semantic interpretation happens here.
    """

    if value is None:
        return None

    if not isinstance(value, str):
        value = str(value)

    value = value.strip()

    return value if value else None


def _clean_list(value):
    """
    Structural normalization only.

    Keeps only non-empty strings and removes duplicates.
    """

    if not isinstance(value, list):
        return []

    cleaned = []

    for item in value:

        if not isinstance(item, str):
            continue

        item = item.strip()

        if not item:
            continue

        if item not in cleaned:
            cleaned.append(item)

    return cleaned


# ============================================================
# CANDIDATE FEATURE PREPARATION
# ============================================================

def _prepare_candidate_features(
    candidate_features: dict
) -> dict:
    """
    Prepare the semantic extraction object passed to the
    evaluator.

    This function performs structural cleanup only.

    It does NOT:
        - infer concepts
        - infer algorithms
        - infer data structures
        - infer complexity
        - infer edge cases
        - infer reasoning
        - score anything

    The function is compatible with the current extraction
    contract.
    """

    return {
        "approach": _clean_string(
            candidate_features.get(
                "approach"
            )
        ),

        "algorithms": _clean_list(
            candidate_features.get(
                "algorithms"
            )
        ),

        "concepts": _clean_list(
            candidate_features.get(
                "concepts"
            )
        ),

        "operations": _clean_list(
            candidate_features.get(
                "operations"
            )
        ),

        "data_structures": _clean_list(
            candidate_features.get(
                "data_structures"
            )
        ),

        "time_complexity": _clean_string(
            candidate_features.get(
                "time_complexity"
            )
        ),

        "space_complexity": _clean_string(
            candidate_features.get(
                "space_complexity"
            )
        ),

        "reasoning_summary": _clean_string(
            candidate_features.get(
                "reasoning_summary"
            )
        ),

        "edge_cases": _clean_list(
            candidate_features.get(
                "edge_cases"
            )
        ),

        "assumptions": _clean_list(
            candidate_features.get(
                "assumptions"
            )
        ),

        "optimization": candidate_features.get(
            "optimization"
        ),

        "implementation_details": _clean_list(
            candidate_features.get(
                "implementation_details"
            )
        ),
    }


# ============================================================
# EVALUATION PROMPT
# ============================================================

def _build_evaluation_prompt(
    candidate_features: dict,
    problem: dict,
    reference_solution=None,
    rubric=None,
    candidate_state=None
) -> str:
    """
    Build the evaluation prompt.

    Reference solution, rubric, and candidate state are supplied
    by the evaluation orchestrator.

    This function only structures the information for the LLM.
    It does not perform scoring or semantic interpretation.
    """

    candidate_answer = _clean_string(
        candidate_features.get(
            "normalized_answer"
        )
    )

    if candidate_answer is None:
        candidate_answer = ""

    semantic_state = _prepare_candidate_features(
        candidate_features
    )

    return f"""
You are an AI coding interview evaluator.

Your task is to evaluate the candidate's response to the given
programming problem using the seven evaluation dimensions
defined below.

You are NOT the extraction system.

The extraction has already been performed by another LLM.

Your job is evaluation, not extraction.

============================================================
PROBLEM
============================================================

{json.dumps(problem, ensure_ascii=False, indent=2)}

============================================================
REFERENCE SOLUTION
============================================================

{json.dumps(reference_solution, ensure_ascii=False, indent=2)}

============================================================
EVALUATION RUBRIC
============================================================

{json.dumps(rubric, ensure_ascii=False, indent=2)}

============================================================
CANDIDATE ANSWER
============================================================

{candidate_answer}

============================================================
EXTRACTED CANDIDATE INFORMATION
============================================================

{json.dumps(semantic_state, ensure_ascii=False, indent=2)}

============================================================
CANDIDATE STATE
============================================================

{json.dumps(candidate_state, ensure_ascii=False, indent=2)}

============================================================
IMPORTANT: SOURCE OF TRUTH
============================================================

The candidate answer is the ultimate source of truth.

The extracted candidate information is structured semantic
evidence intended to make evaluation easier.

Use the extraction to understand what the candidate
communicated.

However:

- Do not treat missing extracted information as proof that
  the candidate did not say something.
- If the original answer clearly contains information that
  the extraction missed, evaluate the original answer.
- Do not invent information merely because it would normally
  be expected in a solution.
- Do not solve the problem yourself and attribute that
  solution to the candidate.

The evaluator must judge what the candidate actually
communicated.

============================================================
GENERAL EVALUATION PRINCIPLES
============================================================

1. Evaluate the candidate against the actual problem.

2. Evaluate each dimension independently.

3. Every assessed score must be an integer from 0 to 100.

4. Do not copy example scores.

5. Do not give the same score to every dimension unless the
   candidate genuinely justifies that.

6. A valid alternative algorithm must NOT be penalized merely
   because it differs from a reference or expected solution.

7. A solution can be correct even if it is inefficient.

8. Algorithm correctness and complexity are separate
   dimensions.

9. Edge-case handling is separate from algorithm correctness.

10. Do not reward verbosity.

11. Do not penalize concise answers when they contain enough
    information.

12. Evaluate only information actually communicated by the
    candidate.

13. Do not invent candidate reasoning.

14. Do not invent candidate data structures.

15. Do not invent candidate complexity claims.

16. Do not invent candidate edge cases.

17. Do not invent candidate assumptions.

18. Do not assume that a missing extracted field means a score
    of zero.

19. Use NOT_ASSESSED when there is genuinely insufficient
    evidence to evaluate a dimension.

============================================================
ASSESSMENT STATUS
============================================================

Each dimension must have exactly one of:

"ASSESSED"

or

"NOT_ASSESSED"

------------------------------------------------------------
ASSESSED
------------------------------------------------------------

Use ASSESSED when the candidate provides enough evidence
to make a meaningful judgment for that dimension.

An ASSESSED dimension must contain:

- an integer score from 0 to 100
- assessment_status = "ASSESSED"
- specific evidence

------------------------------------------------------------
NOT_ASSESSED
------------------------------------------------------------

Use NOT_ASSESSED when there is insufficient evidence to
make a meaningful judgment.

For NOT_ASSESSED:

- score MUST be null
- assessment_status MUST be "NOT_ASSESSED"
- evidence MUST explain why there is insufficient evidence

NOT_ASSESSED does NOT mean poor performance.

It means the candidate did not provide enough evidence to
judge that dimension.

============================================================
DIMENSION 1: ALGORITHM CORRECTNESS
============================================================

Evaluate whether the algorithm or strategy communicated by
the candidate correctly solves the actual problem.

Consider:

- Does the proposed procedure solve the problem?
- Are the described steps logically valid?
- Are important algorithmic conditions handled?
- Is there a fundamental flaw?

Do NOT penalize a valid alternative approach.

Do NOT assume the standard solution.

If the candidate describes enough of an approach to determine
whether it solves the problem, assess it.

If the candidate gives only vague statements and there is not
enough information to determine correctness, use
NOT_ASSESSED.

============================================================
DIMENSION 2: LOGICAL REASONING
============================================================

Evaluate the reasoning actually communicated by the candidate.

Consider:

- Does the candidate explain why the approach works?
- Are cause-and-effect relationships logical?
- Does the explanation support the proposed method?
- Does the candidate justify important decisions?

Do not require a long explanation.

A concise but logically sufficient explanation can receive a
high score.

If there is no meaningful reasoning evidence, use
NOT_ASSESSED rather than automatically giving a low score.

============================================================
DIMENSION 3: CONCEPT COVERAGE
============================================================

Evaluate whether the candidate demonstrates the relevant
technical concepts needed for the solution they are proposing.

Use:

- candidate answer
- extracted concepts
- extracted operations
- extracted approach

Do not require the candidate to mention textbook terminology
if they clearly communicate the underlying concept.

Do not add concepts that the candidate did not communicate.

A candidate can demonstrate a concept semantically without
using its textbook name.

============================================================
DIMENSION 4: COMPLETENESS
============================================================

Evaluate whether the candidate addresses the essential parts
of a solution.

Consider what the actual problem requires.

Depending on the problem, this can include:

- core approach
- necessary processing steps
- required conditions
- result production
- relevant complexity discussion
- important cases

Do not penalize a concise answer merely for being concise.

Do not require information that is genuinely unnecessary for
the problem.

============================================================
DIMENSION 5: DATA STRUCTURE
============================================================

Evaluate the data structure choice and usage.

Use the candidate's actual answer.

The candidate may:

- explicitly name a data structure
- clearly describe a data structure
- use an appropriate abstraction without naming it

Do not invent a data structure.

If no data structure is needed or no meaningful data
structure evidence is provided, determine whether the
dimension can reasonably be assessed.

Do not automatically give zero because the candidate did not
name a data structure.

============================================================
DIMENSION 6: COMPLEXITY
============================================================

Evaluate the candidate's complexity analysis.

Use explicitly communicated complexity information.

Examples:

"O(n)"

"linear time"

"O(n^2) time and O(1) extra space"

Evaluate time and space separately as appropriate.

IMPORTANT:

Do NOT calculate a complexity and pretend the candidate
claimed it.

If the candidate gives no complexity information, normally
use NOT_ASSESSED.

If the candidate gives an incorrect complexity claim, assess
the dimension and score the complexity claim accordingly.

A candidate can have:

- correct algorithm + incorrect complexity
- correct algorithm + no complexity discussion
- inefficient algorithm + correctly stated complexity
- efficient algorithm + incorrectly stated complexity

These situations must be distinguished.

============================================================
DIMENSION 7: EDGE CASES
============================================================

Evaluate edge-case handling based ONLY on cases actually
addressed or clearly implied by the candidate.

Examples include:

- empty input
- single element
- duplicate values
- invalid input
- boundary values
- unmatched elements
- early termination
- missing values

Do not automatically penalize a candidate for not listing
every conceivable edge case.

Do not invent edge cases.

If the candidate provides no meaningful edge-case evidence,
use NOT_ASSESSED unless the candidate's algorithm itself
explicitly demonstrates handling of a boundary condition.

============================================================
HOW TO USE THE EXTRACTION
============================================================

The extracted state has this structure:

- approach
- algorithms
- concepts
- operations
- data_structures
- time_complexity
- space_complexity
- reasoning_summary
- edge_cases
- assumptions
- optimization
- implementation_details

These fields are semantic observations about what the
candidate communicated.

They are NOT ground truth about whether the candidate is
correct.

For example:

If extraction says:

{{
    "data_structures": ["hash map"]
}}

but the candidate answer does not actually support that,
do not blindly accept the extraction.

Likewise, if extraction says:

{{
    "data_structures": []
}}

but the candidate clearly says "I use a hash map", use the
candidate answer.

The candidate answer always takes precedence.

============================================================
IMPORTANT DISTINCTION
============================================================

Do not confuse:

WHAT THE CANDIDATE SAID

with:

WHAT THE CANDIDATE SHOULD HAVE SAID

Evaluate the former.

For example, if a candidate says:

"I keep track of previously seen values and look for the
value that completes the target."

You may recognize the semantic idea of a complement search.

But you must NOT automatically assume:

- hash map
- O(1) lookup
- O(n) time
- O(n) space

unless those facts are actually communicated or otherwise
clearly established by the candidate's stated method.

Similarly, if a candidate says:

"I use a stack and compare each closing bracket with the top."

You may evaluate the stack-based approach based on what was
actually communicated.

============================================================
EVIDENCE REQUIREMENTS
============================================================

Evidence must be specific to the candidate.

Good evidence:

"The candidate explicitly uses a stack, pushes opening
brackets, and compares each closing bracket against the stack
top."

Bad evidence:

"The candidate has a good solution."

Good complexity evidence:

"The candidate explicitly claims O(n^2) time and O(n) space."

Good edge-case evidence:

"The candidate explicitly discusses empty input and an early
closing bracket."

Evidence must explain WHY the score was given.

Do not mention information that the candidate did not provide.

============================================================
OUTPUT FORMAT
============================================================

Return ONLY valid JSON.

Do not return Markdown.

Do not return explanations outside the JSON.

Use exactly this structure:

{{
    "scores": {{
        "algorithm_correctness": {{
            "score": <integer or null>,
            "assessment_status": "ASSESSED" or "NOT_ASSESSED",
            "evidence": "<specific evidence>"
        }},

        "logical_reasoning": {{
            "score": <integer or null>,
            "assessment_status": "ASSESSED" or "NOT_ASSESSED",
            "evidence": "<specific evidence>"
        }},

        "concept_coverage": {{
            "score": <integer or null>,
            "assessment_status": "ASSESSED" or "NOT_ASSESSED",
            "evidence": "<specific evidence>"
        }},

        "completeness": {{
            "score": <integer or null>,
            "assessment_status": "ASSESSED" or "NOT_ASSESSED",
            "evidence": "<specific evidence>"
        }},

        "data_structure": {{
            "score": <integer or null>,
            "assessment_status": "ASSESSED" or "NOT_ASSESSED",
            "evidence": "<specific evidence>"
        }},

        "complexity": {{
            "score": <integer or null>,
            "assessment_status": "ASSESSED" or "NOT_ASSESSED",
            "evidence": "<specific evidence>"
        }},

        "edge_cases": {{
            "score": <integer or null>,
            "assessment_status": "ASSESSED" or "NOT_ASSESSED",
            "evidence": "<specific evidence>"
        }}
    }}
}}

============================================================
FINAL CHECK
============================================================

Before returning the response verify:

- exactly seven dimensions exist
- every dimension has score
- every dimension has assessment_status
- every dimension has evidence
- ASSESSED means integer score 0-100
- NOT_ASSESSED means score is null
- assessment_status is exactly ASSESSED or NOT_ASSESSED
- evidence is specific and non-empty
- no candidate information was invented
- no standard solution was assumed
- alternative valid algorithms were not penalized
- algorithm correctness is separate from complexity
- edge cases are evaluated separately
- complexity is not calculated on behalf of the candidate
- the response contains ONLY the JSON object
""".strip()


# ============================================================
# VALIDATION
# ============================================================

def _validate_dimension(
    dimension,
    dimension_name: str
) -> dict:
    """
    Validate one evaluation dimension.

    Structural validation only.
    """

    if not isinstance(
        dimension,
        dict
    ):
        return _empty_dimension(
            "Invalid evaluation returned for this dimension."
        )

    status = dimension.get(
        "assessment_status"
    )

    evidence = dimension.get(
        "evidence"
    )

    # --------------------------------------------------
    # Normalize status
    # --------------------------------------------------

    if status not in (
        "ASSESSED",
        "NOT_ASSESSED"
    ):
        status = "NOT_ASSESSED"

    # --------------------------------------------------
    # NOT ASSESSED
    # --------------------------------------------------

    if status == "NOT_ASSESSED":

        if (
            not isinstance(
                evidence,
                str
            )
            or not evidence.strip()
        ):
            evidence = (
                "Insufficient evidence was provided by "
                "the candidate to assess this dimension."
            )

        return {
            "score": None,
            "assessment_status": "NOT_ASSESSED",
            "evidence": evidence.strip(),
        }

    # --------------------------------------------------
    # ASSESSED
    # --------------------------------------------------

    score = dimension.get(
        "score"
    )

    # bool is technically an int subclass.
    # Do not accept True / False as scores.

    if isinstance(
        score,
        bool
    ):
        return _empty_dimension(
            "The LLM returned an invalid score."
        )

    try:
        score = int(
            score
        )

    except (
        TypeError,
        ValueError
    ):
        return _empty_dimension(
            "The LLM returned an invalid score."
        )

    score = max(
        0,
        min(
            100,
            score
        )
    )

    if (
        not isinstance(
            evidence,
            str
        )
        or not evidence.strip()
    ):
        evidence = (
            "No specific evidence was provided by "
            "the LLM."
        )

    return {
        "score": score,
        "assessment_status": "ASSESSED",
        "evidence": evidence.strip(),
    }


def _validate_evaluation(
    evaluation: dict
) -> dict:
    """
    Validate the complete evaluator response.
    """

    if not isinstance(
        evaluation,
        dict
    ):
        return _empty_evaluation(
            "Invalid LLM evaluation format."
        )

    scores = evaluation.get(
        "scores"
    )

    if not isinstance(
        scores,
        dict
    ):
        return _empty_evaluation(
            "Missing or invalid scores object."
        )

    validated_scores = {}

    for dimension in EVALUATION_DIMENSIONS:

        validated_scores[
            dimension
        ] = _validate_dimension(
            scores.get(
                dimension
            ),
            dimension
        )

    errors = evaluation.get(
        "errors",
        []
    )

    if not isinstance(
        errors,
        list
    ):
        errors = []

    errors = [
        str(error)
        for error in errors
        if error is not None
    ]

    return {
        "scores": validated_scores,
        "errors": errors,
    }


# ============================================================
# PUBLIC API
# ============================================================

def evaluate_with_llm(
    candidate_features: dict,
    problem: dict,
    reference_solution=None,
    rubric=None,
    candidate_state=None
) -> dict:
    """
    Evaluate a candidate answer using the LLM.

    Architecture:

        Candidate answer
              ↓
        Semantic extraction
              ↓
        Structured candidate state
              ↓
        Reference solution + rubric
              ↓
        LLM evaluator
              ↓
        Seven independent dimensions

    This evaluator does NOT perform rule-based semantic
    extraction.

    A dimension must be scored only from evidence explicitly present in
    the candidate response. Do not infer edge cases, complexity, or
    concepts that the candidate did not mention.
    """

    # --------------------------------------------------
    # Input validation
    # --------------------------------------------------

    if not isinstance(
        candidate_features,
        dict
    ):
        raise TypeError(
            "candidate_features must be a dictionary."
        )

    if not isinstance(
        problem,
        dict
    ):
        raise TypeError(
            "problem must be a dictionary."
        )

    # --------------------------------------------------
    # Build evaluation prompt
    # --------------------------------------------------

    prompt = _build_evaluation_prompt(
        candidate_features=candidate_features,
        problem=problem,
        reference_solution=reference_solution,
        rubric=rubric,
        candidate_state=candidate_state
    )

    # --------------------------------------------------
    # Call central Ollama evaluation client
    # --------------------------------------------------

    try:

        result = generate_evaluation(
            prompt
        )

    except Exception as error:

        return _empty_evaluation(
            f"LLM evaluation request failed: {error}"
        )

    # --------------------------------------------------
    # Extract evaluation object
    # --------------------------------------------------

    if not isinstance(
        result,
        dict
    ):
        return _empty_evaluation(
            "LLM evaluation returned an invalid response."
        )

    evaluation = result.get(
        "evaluation"
    )

    if not isinstance(
        evaluation,
        dict
    ):

        # Some clients may return the evaluation object
        # directly rather than wrapping it.

        if "scores" in result:
            evaluation = result

        else:
            return _empty_evaluation(
                "LLM response did not contain a valid evaluation."
            )

    # --------------------------------------------------
    # Structural validation
    # --------------------------------------------------

    return _validate_evaluation(
        evaluation
    )