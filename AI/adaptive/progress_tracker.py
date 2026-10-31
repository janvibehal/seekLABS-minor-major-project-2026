
from copy import deepcopy
from typing import Any, Optional


class ProgressTracker:
    """Track evaluation scores across interview turns."""

    def __init__(self):
        self.history: list[dict[str, Any]] = []
        self._recorded_turn_ids: set[str] = set()

    @staticmethod
    def _extract_score(value: Any) -> Optional[float]:
        """Return a valid numeric score, or None if unassessed."""

        if isinstance(value, dict):
            status = str(
                value.get(
                    "assessment_status",
                    value.get("status", ""),
                )
            ).strip().lower().replace("-", "_").replace(" ", "_")

            if status in {
                "not_assessed",
                "unassessed",
                "not_evaluated",
                "pending",
                "not_available",
            }:
                return None

            value = value.get("score")

        if value is None or isinstance(value, bool):
            return None

        try:
            score = float(value)
        except (TypeError, ValueError):
            return None

        if not 0 <= score <= 100:
            return None

        return score

    def record(
        self,
        scores: dict[str, Any],
        turn_id: Optional[str] = None,
    ) -> bool:
        """
        Record one evaluation snapshot.

        If turn_id is supplied, duplicate IDs are ignored.
        Returns True if recorded, otherwise False.

        Without a turn_id, each call is treated as a new turn.
        """
        if not isinstance(scores, dict):
            raise TypeError("scores must be a dictionary.")

        if turn_id is not None:
            normalized_id = str(turn_id).strip()

            if not normalized_id:
                raise ValueError("turn_id cannot be empty.")

            if normalized_id in self._recorded_turn_ids:
                return False

            self._recorded_turn_ids.add(normalized_id)

        self.history.append(deepcopy(scores))
        return True

    def get_history(self) -> list[dict[str, Any]]:
        """Return a defensive copy of the complete score history."""
        return deepcopy(self.history)

    def get_improvement(
        self,
        dimension: str,
    ) -> Optional[float]:
        """
        Compare the earliest and latest assessed scores for a dimension.

        Unassessed entries are skipped. Returns None if fewer than
        two assessed scores exist.
        """
        assessed_scores = []

        for entry in self.history:
            score = self._extract_score(entry.get(dimension))

            if score is not None:
                assessed_scores.append(score)

        if len(assessed_scores) < 2:
            return None

        return assessed_scores[-1] - assessed_scores[0]

    def latest_scores(self) -> Optional[dict[str, Any]]:
        """Return the most recent recorded score snapshot."""
        if not self.history:
            return None

        return deepcopy(self.history[-1])

    def latest_assessed_score(
        self,
        dimension: str,
    ) -> Optional[float]:
        """Return the latest valid score for a dimension."""
        for entry in reversed(self.history):
            score = self._extract_score(entry.get(dimension))

            if score is not None:
                return score

        return None

    def clear(self) -> None:
        """Reset score history and duplicate-turn tracking."""
        self.history.clear()
        self._recorded_turn_ids.clear()
