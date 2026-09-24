from AI.adaptive.progress_tracker import ProgressTracker


def test_record_and_history():
    tracker = ProgressTracker()

    scores = {
        "complexity": 40,
        "edge_cases": 50
    }

    tracker.record(scores)

    assert tracker.get_history() == [
        {
            "complexity": 40,
            "edge_cases": 50
        }
    ]


def test_latest_scores():
    tracker = ProgressTracker()

    tracker.record({
        "complexity": 40
    })

    tracker.record({
        "complexity": 70
    })

    assert tracker.latest_scores() == {
        "complexity": 70
    }


def test_improvement():
    tracker = ProgressTracker()

    tracker.record({
        "complexity": 40
    })

    tracker.record({
        "complexity": 65
    })

    tracker.record({
        "complexity": 80
    })

    assert tracker.get_improvement("complexity") == 40


def test_improvement_with_only_one_turn():
    tracker = ProgressTracker()

    tracker.record({
        "complexity": 40
    })

    assert tracker.get_improvement("complexity") is None