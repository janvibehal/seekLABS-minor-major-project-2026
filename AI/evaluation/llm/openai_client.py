import json
import time

from openai import OpenAI

from AI.evaluation.configs.ai_config import (
    GROQ_API_KEY,
    GROQ_MODEL,
)


# ============================================================
# Groq Client
# ============================================================

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not configured."
    )


client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)


# ============================================================
# Generic LLM Generation
# ============================================================

def generate_openai_response(
    prompt: str,
    *,
    temperature: float = 0,
) -> str:
    """
    Send a prompt to Groq through its OpenAI-compatible API
    and return the raw text response.

    This function is only the cloud LLM transport layer.

    Application-level logic such as:
        - history
        - candidate state
        - adaptive state
        - scoring
        - classification
        - prompts
        - validation

    remains outside this function.
    """

    start_time = time.time()

    response = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
        temperature=temperature,
    )

    elapsed_time = time.time() - start_time

    print()
    print("=" * 60)
    print("           GROQ REQUEST COMPLETED")
    print("=" * 60)
    print(f"Model       : {GROQ_MODEL}")
    print(f"Time Taken  : {elapsed_time:.2f} seconds")
    print("=" * 60)
    print()

    content = response.choices[0].message.content

    if not content:
        raise RuntimeError(
            "Groq returned an empty response."
        )

    return content


# ============================================================
# JSON Generation
# ============================================================

def generate_openai_json(
    prompt: str,
    *,
    temperature: float = 0,
) -> dict:
    """
    Send a prompt to Groq and parse the response as JSON.
    """

    response_text = generate_openai_response(
        prompt,
        temperature=temperature,
    )

    try:
        result = json.loads(response_text)

    except json.JSONDecodeError as error:
        raise RuntimeError(
            "Groq returned invalid JSON."
        ) from error

    if not isinstance(result, dict):
        raise RuntimeError(
            "Groq JSON response must be an object."
        )

    return result


# ============================================================
# Backward-compatible Evaluation Function
# ============================================================

def generate_openai_evaluation(
    prompt: str,
) -> dict:
    """
    Generate an evaluation response using Groq.

    The function name is kept for backward compatibility
    with the existing evaluation pipeline.

    The actual LLM provider is Groq.
    """

    print()
    print("=" * 60)
    print("           GROQ EVALUATION IN PROGRESS")
    print("=" * 60)
    print(f"Model       : {GROQ_MODEL}")
    print("Status      : Evaluating candidate solution...")
    print("Please wait...")
    print("=" * 60)
    print()

    response_text = generate_openai_response(
        prompt,
        temperature=0,
    )

    try:
        evaluation = json.loads(
            response_text
        )

    except json.JSONDecodeError:
        evaluation = {
            "raw_response": response_text
        }

    return {
        "model": GROQ_MODEL,
        "evaluation": evaluation,
    }