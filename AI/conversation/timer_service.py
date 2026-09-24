from datetime import datetime, timedelta, timezone


class TimerService:
    """
    Manages the time available for a conversation.

    The timer tracks:
    - start_time
    - end_time
    - time_remaining

    Time is stored internally in seconds.
    """

    def __init__(self, duration_seconds: int = 600):
        if duration_seconds < 0:
            raise ValueError("Duration cannot be negative.")

        self.duration_seconds = duration_seconds
        self.start_time = None
        self.end_time = None

    def start(self) -> None:
        """Start the timer."""

        if self.start_time is not None:
            raise RuntimeError("Timer has already been started.")

        self.start_time = datetime.now(timezone.utc)
        self.end_time = (
            self.start_time
            + timedelta(seconds=self.duration_seconds)
        )

    def is_started(self) -> bool:
        """Return True if the timer has been started."""

        return self.start_time is not None

    def get_time_remaining(self) -> int:
        """
        Return the number of whole seconds remaining.

        Returns 0 if the timer has expired.
        """

        if self.start_time is None or self.end_time is None:
            return self.duration_seconds

        remaining = (
            self.end_time - datetime.now(timezone.utc)
        ).total_seconds()

        return max(0, int(remaining))

    def is_expired(self) -> bool:
        """Return True if the timer has reached zero."""

        return self.get_time_remaining() <= 0

    def get_state(self) -> dict:
        """
        Return the timer state in the format expected
        by the rest of the system.
        """

        return {
            "start_time": (
                self.start_time.isoformat()
                if self.start_time
                else None
            ),
            "end_time": (
                self.end_time.isoformat()
                if self.end_time
                else None
            ),
            "time_remaining": self.get_time_remaining()
        }

    def reset(self) -> None:
        """Reset the timer to its initial state."""

        self.start_time = None
        self.end_time = None