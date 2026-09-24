import time

import pytest

from AI.conversation.timer_service import TimerService


def test_timer_initial_state():

    timer = TimerService(duration_seconds=600)

    assert timer.is_started() is False
    assert timer.get_time_remaining() == 600
    assert timer.is_expired() is False


def test_timer_start():

    timer = TimerService(duration_seconds=600)

    timer.start()

    assert timer.is_started() is True

    state = timer.get_state()

    assert state["start_time"] is not None
    assert state["end_time"] is not None

    assert 599 <= state["time_remaining"] <= 600


def test_timer_counts_down():

    timer = TimerService(duration_seconds=2)

    timer.start()

    initial_time = timer.get_time_remaining()

    time.sleep(1.1)

    remaining_time = timer.get_time_remaining()

    assert remaining_time < initial_time


def test_timer_expires():

    timer = TimerService(duration_seconds=1)

    timer.start()

    time.sleep(1.2)

    assert timer.is_expired() is True
    assert timer.get_time_remaining() == 0


def test_timer_cannot_be_started_twice():

    timer = TimerService(duration_seconds=600)

    timer.start()

    with pytest.raises(RuntimeError):
        timer.start()


def test_negative_duration_is_rejected():

    with pytest.raises(ValueError):
        TimerService(duration_seconds=-1)


def test_timer_reset():

    timer = TimerService(duration_seconds=600)

    timer.start()

    timer.reset()

    assert timer.is_started() is False
    assert timer.get_time_remaining() == 600

    state = timer.get_state()

    assert state["start_time"] is None
    assert state["end_time"] is None