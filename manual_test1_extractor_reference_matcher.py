"""
Manual sanity check for the NLP extraction + reference matching pipeline.

This is NOT a pytest test — it's a script to eyeball actual match quality
on realistic candidate answers, which the automated tests can't verify
(they check the contract shape, not whether the match is a *good* one).

The warm-up phase initializes both configured Ollama models before
the actual manual tests begin.

Run from the repo root (the folder containing evaluation/, AI/, backend/):

    python manual_test1_extractor_reference_matcher.py

Requires Ollama running locally with the configured extractor and
reference matcher models pulled.
"""

import time

from AI.evaluation.configs.ai_config import (
    EXTRACTOR_MODEL,
    REFERENCE_MATCHER_MODEL,
)

from AI.evaluation.extraction.extraction_service import extract_candidate_features
from AI.evaluation.scoring.reference_matcher import match_reference_solution_with_confidence
from AI.evaluation.dataset_loader import load_reference_solution


SAMPLE_ANSWERS = {
    "P001": {  # Two Sum
        "brute_force": (
            "I'll use two nested loops and compare every pair of numbers "
            "to find the ones that add up to the target."
        ),
        "optimal": (
            "I'll use a HashMap to store each number I've seen along with its "
            "index. For every new number, I check if its complement (target "
            "minus the number) is already in the map."
        ),
        "names_a_real_technique_but_hedges": (
            "I think I'd maybe sort the array first and use two pointers, "
            "or I could just check pairs, not totally sure which is faster."
        ),
        "truly_no_algorithm_named": (
            "I'm not sure how to solve this, maybe check the numbers "
            "somehow or use some kind of loop, not sure what would work best."
        ),
    },
    # "P007": {  # Reverse Integer
    #     "optimal_math": (
    #         "I'll repeatedly take the last digit using modulo 10, then "
    #         "divide by 10 to remove it, and build up the reversed number "
    #         "digit by digit. I'll check for 32-bit overflow before each "
    #         "multiplication."
    #     ),
    #     "string_based": (
    #         "I'll convert the integer to a string, keep track of the sign "
    #         "separately, reverse the string of digits, then convert it back "
    #         "to an integer and check if it's within the 32-bit signed range."
    #     ),
    #     "names_a_real_technique_but_hedges": (
    #         "I'd probably just flip the digits somehow, maybe using strings "
    #         "or maybe math, not really sure which way is cleaner here."
    #     ),
    #     "truly_no_algorithm_named": (
    #         "I'm not sure, maybe there's some trick to reverse it, not sure "
    #         "how I'd actually code that up though."
    #     ),
    # },
}


def warm_up_models() -> None:
    print("=" * 70)
    print("MODEL WARM-UP")
    print("=" * 70)

    # ---------------------------------------------------------
    # Extractor model warm-up
    # ---------------------------------------------------------

    print(f"\n[1/2] Warming up extractor model: {EXTRACTOR_MODEL}")

    start = time.time()

    warmup_answer = (
        "I'll use a HashMap to store each number I've seen along with "
        "its index. For every new number, I check if its complement "
        "is already in the map."
    )

    extract_candidate_features(warmup_answer)

    print(
        f"✓ Extractor warm-up completed "
        f"({time.time() - start:.2f}s)"
    )

    # ---------------------------------------------------------
    # Reference matcher model warm-up
    # ---------------------------------------------------------

    print(
        f"\n[2/2] Warming up reference matcher model: "
        f"{REFERENCE_MATCHER_MODEL}"
    )

    start = time.time()

    warmup_problem = {
        "problem_id": "P001",
    }

    warmup_state = {
        "approach": "HashMap lookup",
        "algorithms": ["hashing"],
        "concepts": ["complement lookup"],
        "operations": ["lookup"],
        "data_structures": ["HashMap"],
        "time_complexity": "O(n)",
        "space_complexity": "O(n)",
        "reasoning_summary": (
            "Store previously seen values and check whether "
            "the required complement exists."
        ),
        "edge_cases": [],
        "optimization": "single pass",
    }

    refs = load_reference_solution(warmup_problem)

    match_reference_solution_with_confidence(
        candidate_state=warmup_state,
        reference_solutions=refs,
    )

    print(
        f"✓ Reference matcher warm-up completed "
        f"({time.time() - start:.2f}s)"
    )

    print("\n" + "=" * 70)
    print("WARM-UP COMPLETE — STARTING ACTUAL TESTS")
    print("=" * 70)
    print()


def run_check(problem_id: str, label: str, answer: str) -> None:
    print("=" * 70)
    print(f"[{problem_id}] {label}")
    print("-" * 70)
    print(f"Answer: {answer}")

    state = extract_candidate_features(answer)
    print("\nExtracted state:")
    for key, value in state.items():
        print(f"  {key}: {value}")

    refs = load_reference_solution({"problem_id": problem_id})
    reference_id, confidence = match_reference_solution_with_confidence(
        candidate_state=state,
        reference_solutions=refs,
    )

    matched = next(
        (r for r in refs if r.get("Reference ID") == reference_id),
        None,
    )

    print(f"\nMatched reference : {reference_id}")
    if matched:
        print(f"  -> Matched solution : {matched.get('Expected Approach')}")
        print(f"  -> Solution Type : {matched.get('Solution Type')}")
    print(f"Match confidence  : {confidence}")
    print()


if __name__ == "__main__":
    warm_up_models()

    for problem_id, answers in SAMPLE_ANSWERS.items():
        for label, answer in answers.items():
            run_check(problem_id, label, answer)