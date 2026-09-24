from copy import deepcopy


class ProgressTracker:
    """
    Tracks evaluation scores across multiple interview turns.
    """

    def __init__(self):
        self.history = []

    def record(self, scores: dict[str, float]) -> None:
        """
        Store the scores from one evaluation turn.
        """

        self.history.append(deepcopy(scores))

    def get_history(self) -> list[dict[str, float]]:
        """
        Return the complete score history.
        """

        return deepcopy(self.history)

    def get_improvement(self, dimension: str) -> float | None:
        """
        Calculate improvement from the first recorded score
        to the most recent score for a dimension.
        """

        if len(self.history) < 2:
            return None

        if dimension not in self.history[0]:
            return None

        if dimension not in self.history[-1]:
            return None

        initial_score = self.history[0][dimension]
        current_score = self.history[-1][dimension]

        return current_score - initial_score

    def latest_scores(self) -> dict[str, float] | None:
        """
        Return the most recent evaluation scores.
        """

        if not self.history:
            return None

        return deepcopy(self.history[-1])