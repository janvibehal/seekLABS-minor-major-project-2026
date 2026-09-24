import os
from dotenv import load_dotenv

load_dotenv()


# ==========================================================
# Ollama Configuration
# ==========================================================

OLLAMA_BASE_URL = os.getenv(
    "OLLAMA_BASE_URL",
    "http://localhost:11434/api/generate"
)


# ==========================================================
# Ollama Models
# ==========================================================

EXTRACTOR_MODEL = os.getenv(
    "EXTRACTOR_MODEL",
    "qwen3:4b"
)

EVALUATOR_MODEL = os.getenv(
    "EVALUATOR_MODEL",
    "qwen3:1.7b"
)

FOLLOWUP_MODEL = os.getenv(
    "FOLLOWUP_MODEL",
    "qwen3:1.7b"
)


# ==========================================================
# Embedding Model
# ==========================================================

EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL",
    "nomic-embed-text"
)