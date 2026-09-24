from AI.adaptive.repetition_guard import RepetitionGuard


def test_initial_dimension_count():
    guard = RepetitionGuard()

    assert guard.get_count("complexity") == 0
    assert guard.can_target("complexity") is True


def test_record_dimension():
    guard = RepetitionGuard()

    guard.record_dimension("complexity")
    guard.record_dimension("complexity")

    assert guard.get_count("complexity") == 2


def test_repetition_limit():
    guard = RepetitionGuard(max_revisits=2)

    guard.record_dimension("complexity")
    guard.record_dimension("complexity")

    assert guard.can_target("complexity") is False


def test_filter_available_dimensions():
    guard = RepetitionGuard(max_revisits=2)

    guard.record_dimension("complexity")
    guard.record_dimension("complexity")

    prioritized_gaps = [
        "complexity",
        "edge_cases",
        "completeness"
    ]

    result = guard.filter_available(prioritized_gaps)

    assert result == [
        "edge_cases",
        "completeness"
    ]