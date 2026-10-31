
from typing import Iterable, Dict, List


class RepetitionGuard:
    """
    Tracks how many times each dimension has been targeted.

    The initial targeting is allowed, followed by up to `max_revisits`
    additional revisits.

    Example:
        max_revisits = 2

        First targeting: allowed
        First revisit:   allowed
        Second revisit:  allowed
        Third revisit:   blocked
    """

    def __init__(self, max_revisits: int = 2):
        if not isinstance(max_revisits, int) or isinstance(max_revisits, bool):
            raise TypeError("max_revisits must be an integer.")

        if max_revisits < 0:
            raise ValueError("max_revisits cannot be negative.")

        self.max_revisits = max_revisits
        self.dimension_counts: Dict[str, int] = {}

    @staticmethod
    def _normalize_dimension(dimension: str) -> str:
        """
        Normalize dimension IDs to prevent inconsistent counting.
        """

        if not isinstance(dimension, str):
            raise TypeError("dimension must be a string.")

        normalized = dimension.strip().lower()

        if not normalized:
            raise ValueError("dimension cannot be empty.")

        return normalized

    def record_dimension(self, dimension: str) -> None:
        """
        Record one targeting of a dimension.
        """

        dimension = self._normalize_dimension(dimension)

        self.dimension_counts[dimension] = (
            self.dimension_counts.get(dimension, 0) + 1
        )

    def can_target(self, dimension: str) -> bool:
        """
        Return True if the dimension can be targeted again.

        The initial targeting is not counted as a revisit.
        """

        dimension = self._normalize_dimension(dimension)
        count = self.dimension_counts.get(dimension, 0)

        # Total allowed targets = initial targeting + revisits.
        return count < (self.max_revisits + 1)

    def get_count(self, dimension: str) -> int:
        """
        Return the total number of times a dimension has been targeted.
        """

        dimension = self._normalize_dimension(dimension)
        return self.dimension_counts.get(dimension, 0)

    def get_revisit_count(self, dimension: str) -> int:
        """
        Return the number of revisits after the initial targeting.
        """

        dimension = self._normalize_dimension(dimension)
        count = self.dimension_counts.get(dimension, 0)

        return max(0, count - 1)

    def filter_available(
        self,
        prioritized_gaps: Iterable[str]
    ) -> List[str]:
        """
        Filter prioritized dimensions, preserving their original order.

        Dimensions that have reached their targeting limit are excluded.
        """

        if prioritized_gaps is None:
            return []

        available = []
        seen = set()

        for dimension in prioritized_gaps:
            normalized = self._normalize_dimension(dimension)

            # Avoid duplicate dimensions in the same priority list.
            if normalized in seen:
                continue

            seen.add(normalized)

            if self.can_target(normalized):
                available.append(normalized)

        return available

    def reset_dimension(self, dimension: str) -> None:
        """
        Reset the targeting count for one dimension.
        """

        dimension = self._normalize_dimension(dimension)
        self.dimension_counts.pop(dimension, None)

    def reset(self) -> None:
        """
        Reset all targeting counts.
        """

        self.dimension_counts.clear()

    def get_counts(self) -> Dict[str, int]:
        """
        Return a copy of the current targeting counts.
        """

        return self.dimension_counts.copy()
