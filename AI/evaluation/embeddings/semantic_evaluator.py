import httpx
import math

from AI.evaluation.configs.ai_config import (
    OLLAMA_BASE_URL,
    EMBEDDING_MODEL
)


def get_embedding(text: str) -> list[float]:

    response = httpx.post(
        f"{OLLAMA_BASE_URL}/api/embed",
        json={
            "model": EMBEDDING_MODEL,
            "input": text
        },
        timeout=120
    )

    response.raise_for_status()

    return response.json()["embeddings"][0]


def cosine_similarity(
    vector_a: list[float],
    vector_b: list[float]
) -> float:

    dot_product = sum(a * b for a, b in zip(vector_a, vector_b))

    magnitude_a = math.sqrt(
        sum(a * a for a in vector_a)
    )

    magnitude_b = math.sqrt(
        sum(b * b for b in vector_b)
    )

    if magnitude_a == 0 or magnitude_b == 0:
        return 0.0

    return dot_product / (magnitude_a * magnitude_b)


def calculate_semantic_similarity(
    candidate_answer: str,
    reference_answer: str
) -> float:

    candidate_embedding = get_embedding(candidate_answer)
    reference_embedding = get_embedding(reference_answer)

    return cosine_similarity(
        candidate_embedding,
        reference_embedding
    )