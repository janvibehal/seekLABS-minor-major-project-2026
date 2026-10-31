import os
from pathlib import Path
from dotenv import load_dotenv


# ==========================================================
# Load environment variables
# ==========================================================

EVALUATION_DIR = Path(__file__).resolve().parent.parent

ENV_FILE = EVALUATION_DIR / ".env"

load_dotenv(ENV_FILE)


def _env(name, default=None):
    """Return a stripped env value; blank values count as unset."""
    value = os.getenv(name)

    if value is None or not value.strip():
        return default

    return value.strip()


# ==========================================================
# Groq Configuration
# ==========================================================

GROQ_API_KEY = _env("GROQ_API_KEY")

GROQ_MODEL = _env(
    "GROQ_MODEL",
    "openai/gpt-oss-120b"
)

# Request timeout (seconds) and retry count for Groq calls.
GROQ_TIMEOUT_SECONDS = float(
    _env("GROQ_TIMEOUT_SECONDS", "60")
)

GROQ_MAX_RETRIES = int(
    _env("GROQ_MAX_RETRIES", "2")
)


# ==========================================================
# API Access
# ==========================================================
# Optional. When set, every /v1/* endpoint of the evaluation API
# requires a matching X-API-Key header. Unset = no auth (previous
# behaviour).

API_ACCESS_KEY = _env("INTERVIEW_AI_API_KEY")


# ==========================================================
# Adaptive interview
# ==========================================================
# Hard cap on candidate turns per question when the caller does not
# send max_turns. The adaptive policy may stop earlier (target
# reference reached); this only bounds a candidate who never gets there.

MAX_TURNS_PER_QUESTION = int(
    _env("MAX_TURNS_PER_QUESTION", "5")
)


# ==========================================================
# OpenAI Configuration
# ==========================================================
# Kept temporarily for backward compatibility.
# These can be removed after the complete migration to Groq.

OPENAI_API_KEY = _env("OPENAI_API_KEY")

OPENAI_MODEL = _env(
    "OPENAI_MODEL",
    "gpt-4.1-mini"
)


# ==========================================================
# Ollama Configuration
# ==========================================================
# Still required: embeddings (semantic similarity) are served by a
# local Ollama instance at /api/embed.

OLLAMA_BASE_URL = _env(
    "OLLAMA_BASE_URL",
    "http://localhost:11434"
)


# ==========================================================
# Model Aliases
# ==========================================================
# These names are preserved so the existing application
# architecture does not need to change.
#
# All LLM-based components will eventually use GROQ_MODEL.

# NLP extraction model
EXTRACTOR_MODEL = _env(
    "EXTRACTOR_MODEL",
    GROQ_MODEL
)

# Reference solution matching model
REFERENCE_MATCHER_MODEL = _env(
    "REFERENCE_MATCHER_MODEL",
    GROQ_MODEL
)

# Candidate evaluation model
EVALUATOR_MODEL = _env(
    "EVALUATOR_MODEL",
    GROQ_MODEL
)

# Interview follow-up generation model
FOLLOWUP_MODEL = _env(
    "FOLLOWUP_MODEL",
    GROQ_MODEL
)


# ==========================================================
# Embedding Model
# ==========================================================
# This is still separate from the chat/completion model.
# We will migrate the embedding layer separately.

EMBEDDING_MODEL = _env(
    "EMBEDDING_MODEL",
    "nomic-embed-text"
)