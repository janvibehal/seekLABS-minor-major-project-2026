# ============================================================
# DEPRECATED - DO NOT RE-ENABLE AS-IS
# ============================================================
#
# Moved out of evaluation/tests/ on 2026-09-10 (Janvi's NLP
# cleanup pass, reference-solution feature).
#
# This file tested the PRE-refactor, keyword/regex-based
# extraction contract:
#   - result["concepts_detected"]  (list)
#   - result["reasoning"]          (list)
#   - result["complexity_claim"]   ({"time": ..., "space": ...})
#
# The current extraction_service.py / llm_extractor.py use the
# LLM-based "Updated Adaptive Reference-Solution" contract:
#   - result["concepts"]
#   - result["reasoning_summary"]
#   - result["time_complexity"] / result["space_complexity"]
#
# These are two different, incompatible field contracts. Every
# test in this file will fail permanently against current code,
# not because of a bug, but because it is asserting a contract
# that no longer exists. It was superseded by:
#   - evaluation/tests/test_nlp_contract.py        (real-LLM check)
#   - evaluation/tests/NLP_TESTING_JANVI/test_extraction_contract.py (mocked)
#
# Renamed to .py.bak so pytest does not collect it and does not
# report false failures under Janvi's name. Kept for history/
# reference only. Safe to delete once the team confirms nobody
# needs the old regex-based extraction behavior documented here.
# ============================================================

from evaluation.extraction.extraction_service import extract_candidate_features


def test_normal_answer():
    answer = (
        "First, I store previously seen values in a hash map. "
        "Then I check whether the complement exists. "
        "Finally, I return the indices. "
        "Time complexity: O(n), Space complexity: O(n)."
    )

    result = extract_candidate_features(answer)

    assert result["original_answer"] == answer
    assert "hash map" in result["concepts_detected"]
    assert len(result["reasoning"]) > 0
    assert result["complexity_claim"]["time"] == "O(n)"
    assert result["complexity_claim"]["space"] == "O(n)"


def test_empty_answer():
    result = extract_candidate_features("")

    assert result["original_answer"] == ""
    assert result["normalized_answer"] == ""
    assert result["concepts_detected"] == []
    assert result["reasoning"] == []
    assert result["complexity_claim"]["time"] is None
    assert result["complexity_claim"]["space"] is None


def test_alternative_answer():
    answer = (
        "I will sort the array first and use two pointers "
        "to find the required pair."
    )

    result = extract_candidate_features(answer)

    assert "two pointer" in result["concepts_detected"]
    assert "sorting" in result["concepts_detected"]


def test_wrong_answer():
    answer = "I will return the first two elements without checking their sum."

    result = extract_candidate_features(answer)

    assert result["normalized_answer"] == answer
    assert result["concepts_detected"] == []


def test_verbose_answer():
    answer = (
        "First, I create a hash map. "
        "Then I iterate through every element. "
        "For each element I calculate the complement. "
        "After that I check whether the complement exists. "
        "Finally, if it exists, I return the indices. "
        "Time complexity is O(n) and space complexity is O(n)."
    )

    result = extract_candidate_features(answer)

    assert "hash map" in result["concepts_detected"]
    assert len(result["reasoning"]) >= 4
    assert result["complexity_claim"]["time"] == "O(n)"
    assert result["complexity_claim"]["space"] == "O(n)"


def test_concise_answer():
    answer = "Use a hash map. Time complexity: O(n)."

    result = extract_candidate_features(answer)

    assert "hash map" in result["concepts_detected"]
    assert result["complexity_claim"]["time"] == "O(n)"
    assert result["complexity_claim"]["space"] is None


def test_whitespace_normalization():
    answer = "   I   use a hash map.\n\n\tThen I check the complement.   "

    result = extract_candidate_features(answer)

    assert result["original_answer"] == answer
    assert result["normalized_answer"] == (
        "I use a hash map. Then I check the complement."
    )


def test_special_characters_preserved():
    answer = "Use O(n) & check nums[i] != target!"

    result = extract_candidate_features(answer)

    assert result["original_answer"] == answer
    assert result["normalized_answer"] == answer


def test_programming_symbols_preserved():
    answer = "if (nums[i] != target) { return nums[i]; }"

    result = extract_candidate_features(answer)

    assert result["normalized_answer"] == answer


def test_none_answer():
    result = extract_candidate_features(None)

    assert result["original_answer"] == ""
    assert result["normalized_answer"] == ""


def test_repeated_reasoning_is_preserved():
    answer = (
        "First I use a hash map. "
        "First I use a hash map. "
        "Then I check the complement."
    )

    result = extract_candidate_features(answer)

    assert "First I use a hash map." in result["normalized_answer"]
    assert result["normalized_answer"].count(
        "First I use a hash map."
    ) == 2


def test_long_answer_is_not_truncated():
    answer = "I use a hash map. " * 1000

    result = extract_candidate_features(answer)

    assert len(result["original_answer"]) == len(answer)
    assert len(result["normalized_answer"]) > 0


def test_concept_case_insensitive():
    result = extract_candidate_features(
        "I will use a HASH MAP and BINARY SEARCH."
    )

    assert "hash map" in result["concepts_detected"]
    assert "binary search" in result["concepts_detected"]


def test_concept_synonyms():
    result = extract_candidate_features(
        "I will use a hashmap and a dictionary."
    )

    assert "hash map" in result["concepts_detected"]


def test_short_keyword_no_false_positive():
    result = extract_candidate_features(
        "I will process the input and return the answer."
    )

    assert "dynamic programming" not in result["concepts_detected"]
    assert "bfs" not in result["concepts_detected"]
    assert "dfs" not in result["concepts_detected"]


def test_multiple_concepts():
    result = extract_candidate_features(
        "I will sort the array and then use two pointers."
    )

    assert "sorting" in result["concepts_detected"]
    assert "two pointer" in result["concepts_detected"]


def test_no_concepts():
    result = extract_candidate_features(
        "I will compare the values and return the answer."
    )

    assert result["concepts_detected"] == []


def test_reasoning_question_and_exclamation_sentences():
    answer = (
        "What should I store? "
        "I store the values in a hash map! "
        "Then I check the complement."
    )

    result = extract_candidate_features(answer)

    assert len(result["reasoning"]) >= 2
    assert any(
        "store the values" in step.lower()
        for step in result["reasoning"]
    )
    assert any(
        "check the complement" in step.lower()
        for step in result["reasoning"]
    )


def test_reasoning_logical_explanation():
    answer = (
        "I use a hash map because it provides fast lookup. "
        "Therefore, I can check the complement efficiently."
    )

    result = extract_candidate_features(answer)

    assert len(result["reasoning"]) >= 2


def test_reasoning_without_trigger_word():
    answer = (
        "The hash map gives constant time lookup for each value. "
        "The complement determines which previously seen value is required."
    )

    result = extract_candidate_features(answer)

    assert len(result["reasoning"]) >= 1


def test_reasoning_does_not_match_if_inside_word():
    answer = "The difference between the values is important."

    result = extract_candidate_features(answer)

    # "if" inside "difference" should not count as reasoning.
    assert result["reasoning"] == []


def test_complexity_with_spaces():
    result = extract_candidate_features(
        "Time complexity: O( n log n ), Space complexity: O( n )."
    )

    assert result["complexity_claim"]["time"] == "O(nlogn)"
    assert result["complexity_claim"]["space"] == "O(n)"


def test_complexity_without_colon():
    result = extract_candidate_features(
        "The time complexity is O(n log n). "
        "The space complexity is O(1)."
    )

    assert result["complexity_claim"]["time"] == "O(nlogn)"
    assert result["complexity_claim"]["space"] == "O(1)"


def test_complexity_equals_format():
    result = extract_candidate_features(
        "Time complexity = O(n). Space complexity = O(1)."
    )

    assert result["complexity_claim"]["time"] == "O(n)"
    assert result["complexity_claim"]["space"] == "O(1)"


def test_complexity_missing_claim():
    result = extract_candidate_features(
        "I use a hash map to store previously seen values."
    )

    assert result["complexity_claim"]["time"] is None
    assert result["complexity_claim"]["space"] is None


def test_complexity_only_time():
    result = extract_candidate_features(
        "The time complexity is O(n)."
    )

    assert result["complexity_claim"]["time"] == "O(n)"
    assert result["complexity_claim"]["space"] is None


def test_complexity_only_space():
    result = extract_candidate_features(
        "The space complexity is O(n)."
    )

    assert result["complexity_claim"]["time"] is None
    assert result["complexity_claim"]["space"] == "O(n)"


def test_structured_hash_map_extraction():
    answer = (
        "I will use a hash map to store previously seen values."
    )

    result = extract_candidate_features(answer)

    assert result["approach"] == "hash map"
    assert result["algorithms"] == []
    assert result["data_structures"] == ["hash map"]


def test_structured_algorithm_extraction():
    answer = (
        "I will use binary search on the sorted array."
    )

    result = extract_candidate_features(answer)

    assert result["approach"] == "binary search"
    assert "binary search" in result["algorithms"]
    assert result["data_structures"] == []


def test_structured_multiple_algorithms():
    answer = (
        "I will sort the array and then use two pointers."
    )

    result = extract_candidate_features(answer)

    assert result["approach"] == "two pointer"
    assert "two pointer" in result["algorithms"]
    assert "sorting" in result["algorithms"]
    assert result["data_structures"] == []


def test_structured_data_structures():
    answer = (
        "I will use a stack and a queue to process the elements."
    )

    result = extract_candidate_features(answer)

    assert "stack" in result["data_structures"]
    assert "queue" in result["data_structures"]
    assert result["algorithms"] == []


def test_structured_empty_answer():
    result = extract_candidate_features("")

    assert result["approach"] is None

    assert result["time_complexity"] is None
    assert result["space_complexity"] is None

    assert result["edge_cases"] == []

    assert result["reasoning_summary"] is None

    assert result["assumptions"] == []

    assert result["optimization"] is None


def test_edge_case_extraction():
    answer = (
        "If the input is empty, return an empty result. "
        "Also handle duplicate values and negative numbers."
    )

    result = extract_candidate_features(answer)

    assert "empty_input" in result["edge_cases"]
    assert "duplicate_values" in result["edge_cases"]
    assert "negative_values" in result["edge_cases"]


def test_no_edge_cases():
    answer = (
        "I will use a hash map to store previously seen values."
    )

    result = extract_candidate_features(answer)

    assert result["edge_cases"] == []