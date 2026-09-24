class RepetitionGuard:
    """
    Tracks how many times each dimension has been targeted
    and prevents excessive repetition.
    """

    def __init__(self, max_revisits: int = 2):
        self.max_revisits = max_revisits
        self.dimension_counts = {}

    def record_dimension(self, dimension: str) -> None:
        """
        Record that a dimension has been targeted.
        """

        self.dimension_counts[dimension] = (
            self.dimension_counts.get(dimension, 0) + 1
        )

    def can_target(self, dimension: str) -> bool:
        """
        Check whether a dimension can still be targeted.
        """

        count = self.dimension_counts.get(dimension, 0)

        return count < self.max_revisits

    def get_count(self, dimension: str) -> int:
        """
        Return how many times a dimension has been targeted.
        """

        return self.dimension_counts.get(dimension, 0)

    def filter_available(
        self,
        prioritized_gaps: list[str]
    ) -> list[str]:
        """
        Remove dimensions that have reached the repetition limit.
        """

        return [
            dimension
            for dimension in prioritized_gaps
            if self.can_target(dimension)
        ]