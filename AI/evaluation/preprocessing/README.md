# Preprocessing Requirements

## Goal

Normalize candidate answers without destroying meaningful programming reasoning.

## Input

Raw candidate answer.

## Required Handling

The preprocessing stage must handle:

- Extra whitespace
- Formatting
- Repeated text
- Empty answers
- Very long answers
- Special characters

## Important Rule

Meaningful reasoning must not be removed during preprocessing.

## Output

The original answer must always be preserved.

Expected structure:

```json
{
  "original_answer": "...",
  "normalized_answer": "..."
}
```text
```markdown
## Downstream Handoff

The normalized answer will be used for:

- Concept extraction
- Reasoning extraction
- Complexity extraction
- LLM evaluation

The original answer remains available for traceability.