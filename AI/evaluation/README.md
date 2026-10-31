# Evaluation service

Interview-answer evaluation (extraction -> LLM evaluation -> classification ->
follow-up) exposed through a FastAPI app.

## Setup

```
pip install -r evaluation/requirements-dev.txt
cp evaluation/.env.example evaluation/.env   # then fill in GROQ_API_KEY
```

Run every command from the directory that *contains* the `AI/` folder, because
imports use the `AI.` package prefix.

| Variable | Purpose |
|---|---|
| `GROQ_API_KEY` | Required for any LLM call |
| `GROQ_MODEL` | Default model (other `*_MODEL` variables override it per component) |
| `GROQ_TIMEOUT_SECONDS`, `GROQ_MAX_RETRIES` | Optional request limits |
| `OLLAMA_BASE_URL`, `EMBEDDING_MODEL` | Local Ollama, used only for embeddings (semantic similarity) |
| `INTERVIEW_AI_API_KEY` | Optional; when set, `/v1/*` requires an `X-API-Key` header |

## Run

```
uvicorn AI.evaluation.api_server:app
pytest AI
```

Tests that call the LLM or Ollama need network access and valid credentials.
