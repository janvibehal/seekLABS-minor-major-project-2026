import os
from pathlib import Path
from dotenv import load_dotenv


# ==========================================================
# Load environment variables
# ==========================================================

EVALUATION_DIR = Path(__file__).resolve().parent.parent

ENV_FILE = EVALUATION_DIR / ".env"

load_dotenv(ENV_FILE)


# ==========================================================
# Groq Configuration
# ==========================================================

GROQ_API_KEY = os.getenv(
    "GROQ_API_KEY"
)

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-120b"
)


# ==========================================================
# OpenAI Configuration
# ==========================================================
# Kept temporarily for backward compatibility.
# These can be removed after the complete migration to Groq.

OPENAI_API_KEY = os.getenv(
    "OPENAI_API_KEY"
)

OPENAI_MODEL = os.getenv(
    "OPENAI_MODEL",
    "gpt-4.1-mini"
)


# ==========================================================
# Ollama Configuration
# ==========================================================
# Kept temporarily because the remaining components are
# being migrated from Ollama to Groq one by one.

OLLAMA_BASE_URL = os.getenv(
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
EXTRACTOR_MODEL = os.getenv(
    "EXTRACTOR_MODEL",
    GROQ_MODEL
)

# Reference solution matching model
REFERENCE_MATCHER_MODEL = os.getenv(
    "REFERENCE_MATCHER_MODEL",
    GROQ_MODEL
)

# Candidate evaluation model
EVALUATOR_MODEL = os.getenv(
    "EVALUATOR_MODEL",
    GROQ_MODEL
)

# Interview follow-up generation model
FOLLOWUP_MODEL = os.getenv(
    "FOLLOWUP_MODEL",
    GROQ_MODEL
)


# ==========================================================
# Embedding Model
# ==========================================================
# This is still separate from the chat/completion model.
# We will migrate the embedding layer separately.

EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL",
    "nomic-embed-text"
)