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
# JSON Parser
# ============================================================

def _parse_json_response(
    response_text: str,
) -> dict:
    """
    Parse a JSON object returned by the LLM.

    Handles:
        1. Direct JSON
        2. JSON surrounded by additional text
        3. Markdown code fences
    """

    if not isinstance(
        response_text,
        str,
    ):
        raise RuntimeError(
            "Groq returned a non-string response."
        )

    response_text = response_text.strip()

    if not response_text:
        raise RuntimeError(
            "Groq returned an empty response."
        )

    # --------------------------------------------------------
    # Direct JSON
    # --------------------------------------------------------

    try:

        result = json.loads(
            response_text
        )

        if isinstance(
            result,
            dict,
        ):
            return result

    except json.JSONDecodeError:
        pass

    # --------------------------------------------------------
    # Remove Markdown code fences if present
    # --------------------------------------------------------

    cleaned = response_text

    if cleaned.startswith(
        "```"
    ):

        lines = cleaned.splitlines()

        if lines:
            lines = lines[1:]

        if (
            lines
            and lines[-1].strip() == "```"
        ):
            lines = lines[:-1]

        cleaned = "\n".join(
            lines
        ).strip()

        try:

            result = json.loads(
                cleaned
            )

            if isinstance(
                result,
                dict,
            ):
                return result

        except json.JSONDecodeError:
            pass

    # --------------------------------------------------------
    # Recover JSON object from surrounding text
    # --------------------------------------------------------

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
            "Groq response contained invalid JSON."
        )

    candidate_json = response_text[
        start:end + 1
    ]

    try:

        result = json.loads(
            candidate_json
        )

    except json.JSONDecodeError as error:

        raise RuntimeError(
            "Groq response contained malformed JSON."
        ) from error

    if not isinstance(
        result,
        dict,
    ):

        raise RuntimeError(
            "Groq JSON response must be a JSON object."
        )

    return result


# ============================================================
# Schema Name Helper
# ============================================================

def _schema_name(
    schema: dict,
) -> str:
    """
    Generate a stable schema name for Groq structured outputs.

    Groq/OpenAI-compatible structured outputs require a name
    for the JSON schema.
    """

    if not isinstance(
        schema,
        dict,
    ):
        return "structured_output"

    title = schema.get(
        "title"
    )

    if isinstance(
        title,
        str,
    ) and title.strip():

        return title.strip()

    return "structured_output"


# ============================================================
# Generic Structured JSON Generation
# ============================================================

def generate_structured_json(
    prompt: str,
    model: str = None,
    schema: dict = None,
    num_predict: int = 800,
) -> dict:
    """
    Generate structured JSON using Groq.

    Backward-compatible replacement for the old Ollama
    structured JSON client.

    Existing application code can continue calling:

        generate_structured_json(
            prompt,
            model,
            schema,
            num_predict
        )

    If a schema is provided, Groq structured outputs are used.

    If no schema is provided, Groq JSON mode is used.

    Application-level logic remains unchanged.
    """

    # --------------------------------------------------------
    # Validate prompt
    # --------------------------------------------------------

    if not isinstance(
        prompt,
        str,
    ):

        raise TypeError(
            "Prompt must be a string."
        )

    if not prompt.strip():

        raise ValueError(
            "Prompt cannot be empty."
        )

    # --------------------------------------------------------
    # Always use configured Groq model
    # --------------------------------------------------------

    selected_model = GROQ_MODEL

    # --------------------------------------------------------
    # Request
    # --------------------------------------------------------

    start_time = time.time()

    try:

        request_kwargs = {
            "model": selected_model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            "temperature": 0,
            "max_tokens": max(
                num_predict,
                1600,
            ),
        }

        # ----------------------------------------------------
        # Use strict structured outputs when schema exists
        # ----------------------------------------------------

        if schema is not None:

            request_kwargs[
                "response_format"
            ] = {
                "type": "json_schema",
                "json_schema": {
                    "name": _schema_name(
                        schema
                    ),
                    "strict": True,
                    "schema": schema,
                },
            }

        # ----------------------------------------------------
        # Otherwise use normal JSON mode
        # ----------------------------------------------------

        else:

            request_kwargs[
                "response_format"
            ] = {
                "type": "json_object"
            }

        response = (
            client.chat.completions.create(
                **request_kwargs
            )
        )

    except Exception as error:

        raise RuntimeError(
            f"Groq structured JSON request failed: {error}"
        ) from error

    elapsed_time = (
        time.time() - start_time
    )

    # --------------------------------------------------------
    # Extract response
    # --------------------------------------------------------

    if not response.choices:

        raise RuntimeError(
            "Groq returned no choices."
        )

    message = response.choices[0].message

    response_text = message.content

    # --------------------------------------------------------
    # Some reasoning models/providers can return None content
    # when generation is interrupted.
    # --------------------------------------------------------

    if response_text is None:

        raise RuntimeError(
            "Groq returned an empty structured JSON response."
        )

    if not isinstance(
        response_text,
        str,
    ):

        raise RuntimeError(
            "Groq response did not contain valid text."
        )

    response_text = response_text.strip()

    if not response_text:

        raise RuntimeError(
            "Groq returned an empty structured JSON response."
        )

    # --------------------------------------------------------
    # Debug output
    # --------------------------------------------------------

    print()
    print("=" * 60)
    print("          GROQ STRUCTURED JSON")
    print("=" * 60)
    print(
        f"Model        : {selected_model}"
    )
    print(
        f"Time Taken   : {elapsed_time:.2f} seconds"
    )
    print(
        f"Prompt chars : {len(prompt)}"
    )

    if schema is not None:
        print(
            "Schema       : ENABLED"
        )
    else:
        print(
            "Schema       : JSON MODE"
        )

    print("=" * 60)
    print()

    # --------------------------------------------------------
    # Parse JSON
    # --------------------------------------------------------

    return _parse_json_response(
        response_text
    )


# ============================================================
# Evaluation Function
# ============================================================

def generate_evaluation(
    prompt: str,
) -> dict:
    """
    Generate the evaluation JSON.

    The central evaluator does its own validation, so no
    external JSON schema is required here.

    Existing application code continues to receive:

        {
            "model": ...,
            "evaluation": ...
        }
    """

    evaluation = generate_structured_json(
        prompt=prompt,
        model=GROQ_MODEL,
        schema=None,
        num_predict=1600,
    )

    return {
        "model": GROQ_MODEL,
        "evaluation": evaluation,
    }


# ============================================================
# Plain Text Groq Generation
# ============================================================

def generate_groq_response(
    prompt: str,
    temperature: float = 0,
    max_tokens: int = 500,
) -> str:
    """
    Generate a plain-text response using Groq.

    This function replaces the old Ollama text-generation
    transport while keeping the rest of the application logic
    unchanged.

    Used by the adaptive follow-up generator.
    """

    if not isinstance(
        prompt,
        str,
    ):

        raise TypeError(
            "Prompt must be a string."
        )

    if not prompt.strip():

        raise ValueError(
            "Prompt cannot be empty."
        )

    if not GROQ_API_KEY:

        raise RuntimeError(
            "GROQ_API_KEY is not configured."
        )

    start_time = time.time()

    try:

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=0,
            max_tokens=max_tokens,
        )

    except Exception as error:

        raise RuntimeError(
            f"Groq text generation request failed: {error}"
        ) from error

    elapsed_time = (
        time.time() - start_time
    )

    print(
        f"Groq response generated in "
        f"{elapsed_time:.2f}s"
    )

    # --------------------------------------------------------
    # Validate response
    # --------------------------------------------------------

    if not response.choices:

        raise RuntimeError(
            "Groq returned no choices."
        )

    response_text = (
        response.choices[0]
        .message
        .content
    )

    if response_text is None:

        raise RuntimeError(
            "Groq returned an empty response."
        )

    if not isinstance(
        response_text,
        str,
    ):

        raise RuntimeError(
            "Groq response did not contain valid text."
        )

    response_text = response_text.strip()

    if not response_text:

        raise RuntimeError(
            "Groq returned an empty response."
        )

    return response_text