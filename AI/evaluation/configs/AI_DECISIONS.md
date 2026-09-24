# AI Decisions - Week 1

## LLM

- Provider: Ollama
- Model: qwen3:4b
- Deployment: Local

### Reason

The model provides a practical local LLM option for programming
reasoning while keeping development lightweight enough for the
available development machine.

---

## Embedding Model

- Provider: Ollama
- Model: nomic-embed-text
- Deployment: Local

### Purpose

Generate embeddings for semantic comparison between candidate
reasoning and reference reasoning.

Semantic similarity is a supporting evaluation signal and is not
treated as the final correctness score.

---

## Prompt Strategy

The evaluation prompt receives:

- Problem
- Reference solution
- Expected concepts
- Expected complexity
- Candidate reasoning
- Rubric

The evaluator must:

- recognize valid alternative approaches
- avoid judging only by wording similarity
- avoid rewarding verbosity
- avoid penalizing concise correct reasoning
- separate correctness from complexity
- identify missing concepts

---

## Preprocessing Strategy

The preprocessing stage will:

- normalize unnecessary whitespace
- preserve meaningful information
- handle repeated text
- handle empty answers
- handle very long answers
- handle special characters
- preserve the original answer

The output will contain both:

- original_answer
- normalized_answer