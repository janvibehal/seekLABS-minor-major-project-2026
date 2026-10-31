from AI.evaluation.preprocessing.cleaner import normalize_answer


def test_original_answer_is_preserved():
    raw = "  Use   a hash\tmap.\n\nO(n)  "
    result = normalize_answer(raw)

    assert result["original_answer"] == raw
    assert result["normalized_answer"] == "Use a hash map. O(n)"


def test_none_and_empty_answers():
    assert normalize_answer(None) == {
        "original_answer": "",
        "normalized_answer": "",
    }
    assert normalize_answer("   ")["normalized_answer"] == ""


def test_superscript_exponents_keep_their_meaning():
    """NFKC alone would turn O(n\u00b2) into O(n2)."""

    result = normalize_answer("Time is O(n\u00b2) and space O(n\u00b3).")

    assert "O(n^2)" in result["normalized_answer"]
    assert "O(n^3)" in result["normalized_answer"]
    assert result["original_answer"].count("\u00b2") == 1


def test_typographic_quotes_and_dashes_are_normalised():
    result = normalize_answer("It\u2019s \u201cfast\u201d \u2013 really")

    assert result["normalized_answer"] == "It's \"fast\" - really"
