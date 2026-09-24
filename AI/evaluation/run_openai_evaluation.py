from AI.evaluation.extraction.extraction_service import (
    extract_candidate_features
)

from AI.evaluation.llm.openai_llm_evaluator import (
    evaluate_with_openai
)

from AI.evaluation.embeddings.semantic_evaluator import (
    calculate_semantic_similarity
)

from AI.evaluation.scoring.confidence import (
    calculate_confidence
)

from AI.evaluation.scoring.classification import (
    classify_answer
)

from AI.evaluation.pipeline.terminal_formatter import (
    print_evaluation
)


# ==========================================================
# Problem
# ==========================================================

problem = {
    "statement": (
        "Given an array of integers nums and an integer target, "
        "return the indices of the two numbers such that they "
        "add up to target."
    )
}


# ==========================================================
# Candidate Answer
# ==========================================================

candidate_answer = (
    "I'll use a hash map. For each number, I'll calculate "
    "target-number. If the complement is already in the map, "
    "I'll return the two indices; otherwise I'll store the "
    "number and index. O(n) time, O(n) space."
)


# ==========================================================
# Reference Solution
# ==========================================================

reference_solution = (
    "Use a hash map to store each number and its index. "
    "For every number, calculate target minus the current "
    "number. If the complement already exists in the hash map, "
    "return the current index and the stored index. Otherwise "
    "store the current number and its index. "
    "The time complexity is O(n) and space complexity is O(n)."
)


# ==========================================================
# Main OpenAI Evaluation
# ==========================================================

def run_openai_evaluation():

    print()
    print("=" * 60)
    print("              OPENAI CODING EVALUATOR")
    print("=" * 60)
    print()

    # ------------------------------------------------------
    # Step 1: Extract candidate features
    # ------------------------------------------------------

    candidate_features = extract_candidate_features(
        candidate_answer
    )

    # ------------------------------------------------------
    # Step 2: OpenAI evaluation
    # ------------------------------------------------------

    llm_evaluation = evaluate_with_openai(
        candidate_features,
        problem
    )

    # ------------------------------------------------------
    # Step 3: Classification
    # ------------------------------------------------------

    ai_classification = classify_answer(
        candidate_features,
        llm_evaluation
    )

    # ------------------------------------------------------
    # Step 4: Semantic similarity
    # ------------------------------------------------------

    semantic_similarity = calculate_semantic_similarity(
        candidate_features["normalized_answer"],
        reference_solution
    )

    # ------------------------------------------------------
    # Step 5: Confidence
    # ------------------------------------------------------

    confidence = calculate_confidence(
        llm_evaluation,
        semantic_similarity
    )

    # ------------------------------------------------------
    # Step 6: Build final result
    # ------------------------------------------------------

    result = {
        "problem": problem,

        "candidate": candidate_features,

        "llm_evaluation": llm_evaluation,

        "ai_classification": ai_classification,

        "semantic_similarity": semantic_similarity,

        "confidence": confidence
    }

    # ------------------------------------------------------
    # Step 7: Pretty terminal output
    # ------------------------------------------------------

    print_evaluation(result)


# ==========================================================
# Entry Point
# ==========================================================

if __name__ == "__main__":
    run_openai_evaluation()