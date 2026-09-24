from AI.evaluation.extraction.extraction_service import extract_candidate_features
from AI.evaluation.llm.llm_evaluator import evaluate_with_llm
from AI.evaluation.embeddings.semantic_evaluator import calculate_semantic_similarity
from AI.evaluation.scoring.confidence import calculate_confidence
from AI.evaluation.scoring.classification import classify_answer


def evaluate_submission(
    problem: dict,
    candidate_answer: str,
    reference_solution: str
) -> dict:
    """
    Run the complete AI evaluation pipeline.

    Pipeline:
    Candidate Answer
        ↓
    Preprocessing + Extraction
        ↓
    LLM Evaluation
        ↓
    Semantic Similarity
        ↓
    Structured Result
    """
    # Handle empty candidate answers
    if not candidate_answer or not candidate_answer.strip():
        return {
            "problem": problem,
            "candidate": {
                "original_answer": candidate_answer or "",
                "normalized_answer": "",
                "concepts_detected": [],
                "reasoning": [],
                "complexity_claim": {
                    "time": None,
                    "space": None
                }
            },
            "llm_evaluation": {
                "scores": {
                    "algorithm_correctness": 0,
                    "logical_reasoning": 0,
                    "concept_coverage": 0,
                    "completeness": 0,
                    "data_structure_usage": 0,
                    "complexity": 0,
                    "edge_cases": 0
                },
                "reasoning": "No candidate answer was provided.",
                "errors": ["Empty candidate answer"]
            },
            "ai_classification": "Incorrect",
            "semantic_similarity": 0.0,
            "confidence": 0.0
        }

   

    # Step 1: Extract candidate features
    candidate_features = extract_candidate_features(candidate_answer)

    # Step 2: LLM evaluation
    llm_evaluation = evaluate_with_llm(
        candidate_features,
        problem
    )
    # Step 2.5: Classify the candidate answer
    ai_classification = classify_answer(
    candidate_features,
    llm_evaluation
    )

    # Step 3: Semantic similarity
    semantic_similarity = calculate_semantic_similarity(
        candidate_features["normalized_answer"],
        reference_solution
    )
    # Step 4: Calculate confidence
    confidence = calculate_confidence(
        llm_evaluation,
        semantic_similarity
    )

    # Step 5: Return structured evaluation
    return {
        "problem": problem,
        "candidate": candidate_features,
        "llm_evaluation": llm_evaluation,
        "ai_classification": ai_classification,
       "semantic_similarity": semantic_similarity,
       "confidence": confidence
    }