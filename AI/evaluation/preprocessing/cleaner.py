import unicodedata


def normalize_answer(answer: str) -> dict:
    """
    Normalize a candidate's programming answer while preserving
    its original meaning and technical notation.

    This function performs deterministic text cleanup only.
    Semantic interpretation is handled by the NLP/extraction layer.
    """

    if answer is None:
        answer = ""

    if not isinstance(answer, str):
        answer = str(answer)

    # Preserve the exact candidate submission.
    original_answer = answer

    # --------------------------------------------------
    # Unicode normalization
    # --------------------------------------------------

    normalized_answer = unicodedata.normalize(
        "NFKC",
        answer
    )

    # --------------------------------------------------
    # Normalize common typographic characters
    # --------------------------------------------------

    normalized_answer = (
        normalized_answer
        .replace("\u2018", "'")   # left single quote
        .replace("\u2019", "'")   # right single quote
        .replace("\u201c", '"')   # left double quote
        .replace("\u201d", '"')   # right double quote
        .replace("\u2013", "-")   # en dash
        .replace("\u2014", "-")   # em dash
    )

    # --------------------------------------------------
    # Normalize whitespace
    # --------------------------------------------------

    normalized_answer = " ".join(
        normalized_answer.split()
    )

    return {
        "original_answer": original_answer,
        "normalized_answer": normalized_answer
    }