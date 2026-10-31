# ============================================================
# ADAPTIVE INTERVIEW POLICY ENGINE
# ============================================================

import math
import re
from typing import Any

from AI.adaptive.progress_tracker import ProgressTracker
from AI.adaptive.config import (
    LOW_SCORE_THRESHOLD,
    FOLLOW_UP_THRESHOLD,
    MAX_DIMENSION_REVISITS,
    MORE_THAN_5_MINUTES,
    TWO_MINUTES,
    THIRTY_SECONDS,
    REFERENCE_CONFIDENCE_THRESHOLD,
)
from AI.adaptive.gap_analyzer import analyze_gaps
from AI.adaptive.repetition_guard import RepetitionGuard


CONCEPT_DIMENSION = "concept_coverage"


class PolicyEngine:
    """
    Select the next adaptive interview action.

    decide() must be called exactly once per candidate turn. It records
    progress and consumes repetition budget when it selects an action.
    """

    MAX_CLARIFICATION_ATTEMPTS = 2

    DIMENSION_WEIGHTS = {
        "algorithm_correctness": 25,
        "logical_reasoning": 20,
        "concept_coverage": 15,
        "completeness": 10,
        "data_structure": 10,
        "complexity": 10,
        "edge_cases": 10,
    }

    DIMENSION_GOALS = {
        "algorithm_correctness": "improve_algorithm_correctness",
        "logical_reasoning": "improve_logical_reasoning",
        "concept_coverage": "improve_concept_coverage",
        "completeness": "improve_completeness",
        "data_structure": "improve_data_structure_selection",
        "complexity": "improve_complexity_analysis",
        "edge_cases": "improve_edge_case_handling",
    }

    DIMENSION_ALIASES = {
        "data_structure_usage": "data_structure",
        "data_structure_selection": "data_structure",
        "reasoning": "logical_reasoning",
        "edge_case_handling": "edge_cases",
        "complexity_analysis": "complexity",
        "correctness": "algorithm_correctness",
        "algorithm_correctness_gap": "algorithm_correctness",
        "logical_reasoning_gap": "logical_reasoning",
        "concept_coverage_gap": "concept_coverage",
        "completeness_gap": "completeness",
        "data_structure_gap": "data_structure",
        "complexity_gap": "complexity",
        "edge_case_gap": "edge_cases",
        "reasoning_gap": "logical_reasoning",
        "concept_gap": "concept_coverage",
    }

    UNASSESSED_STATUSES = {
        "not_assessed",
        "unassessed",
        "not_evaluated",
        "pending",
        "not_available",
        "not_applicable",
        "not_scored",
    }

    VALID_LEVELS = {"beginner", "easy", "medium", "hard", "advanced"}

    def __init__(self):
        self.repetition_guard = RepetitionGuard(
            max_revisits=MAX_DIMENSION_REVISITS
        )
        self.progress_tracker = ProgressTracker()
        self._clarification_attempts = 0

    # ========================================================
    # COERCION HELPERS
    # ========================================================

    @staticmethod
    def _coerce_int(value: Any) -> int | None:
        if value is None or isinstance(value, bool):
            return None

        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _coerce_float(value: Any) -> float | None:
        if value is None or isinstance(value, bool):
            return None

        try:
            numeric = float(value)
        except (TypeError, ValueError):
            return None

        if not math.isfinite(numeric):
            return None

        return numeric

    @classmethod
    def _normalize_score(cls, score: Any) -> float | None:
        """Validate a score on the evaluator's 0-100 scale."""

        numeric = cls._coerce_float(score)

        if numeric is None or not 0.0 <= numeric <= 100.0:
            return None

        return numeric

    # ========================================================
    # NORMALIZATION
    # ========================================================

    @staticmethod
    def _normalize_reference_id(reference_id: Any) -> str | None:
        """Normalize reference IDs, including accidentally quoted IDs."""

        if reference_id is None:
            return None

        value = str(reference_id).strip()

        while (
            len(value) >= 2
            and value[0] == value[-1]
            and value[0] in {"'", '"'}
        ):
            value = value[1:-1].strip()

        return value or None

    @staticmethod
    def _normalize_name(value: Any) -> str:
        """Normalize a dimension or status name."""

        if value is None:
            return ""

        value = str(value).strip().lower()
        value = value.replace("-", "_").replace(" ", "_")
        value = re.sub(r"_+", "_", value)

        return value.strip("_")

    @classmethod
    def _normalize_dimension(cls, dimension: Any) -> str | None:
        """Convert a supported dimension alias into a canonical ID."""

        normalized = cls._normalize_name(dimension)

        if not normalized:
            return None

        normalized = cls.DIMENSION_ALIASES.get(normalized, normalized)

        if normalized in cls.DIMENSION_WEIGHTS:
            return normalized

        return None

    @classmethod
    def _normalize_level(cls, level: Any) -> str:
        normalized = str(level or "medium").strip().lower()

        return normalized if normalized in cls.VALID_LEVELS else "medium"

    # ========================================================
    # TARGET REFERENCE SELECTION
    # ========================================================

    def select_target_reference(
        self,
        references: list[dict],
    ) -> str | None:
        """
        Select the canonical reference deterministically.

        Call this once per question and pass the result to decide()
        as target_reference_id. Do not recompute it per turn.
        """

        if not isinstance(references, list) or not references:
            return None

        valid_references = [
            reference
            for reference in references
            if isinstance(reference, dict)
            and self._normalize_reference_id(
                reference.get("Reference ID")
            )
        ]

        if not valid_references:
            return None

        ranked = sorted(valid_references, key=self._reference_rank_key)

        return self._normalize_reference_id(
            ranked[0].get("Reference ID")
        )

    def _reference_rank_key(self, reference: dict) -> tuple:
        return (
            self._get_validity_rank(reference),
            self._complexity_rank(reference.get("Time Complexity")),
            self._complexity_rank(reference.get("Space Complexity")),
            self._get_quality_rank(reference),
            self._normalize_reference_id(
                reference.get("Reference ID")
            ) or "",
        )

    @staticmethod
    def _get_validity_rank(reference: dict) -> int:
        """Lower is better. Unknown validity is neutral."""

        for key in ("Validity", "Correctness", "Is Valid", "Is Correct"):
            value = reference.get(key)

            if value is None:
                continue

            if isinstance(value, bool):
                return 0 if value else 1

            normalized = str(value).strip().lower()

            if normalized in {"true", "yes", "valid", "correct", "1"}:
                return 0

            if normalized in {"false", "no", "invalid", "incorrect", "0"}:
                return 1

        return 0

    @staticmethod
    def _get_quality_rank(reference: dict) -> float:
        """Lower rank is preferred for sorting."""

        for key in ("Quality Score", "Solution Quality"):
            value = reference.get(key)

            if value is not None:
                try:
                    return -float(value)
                except (TypeError, ValueError):
                    pass

        for key in ("Reference Priority", "Priority"):
            value = reference.get(key)

            if value is not None:
                try:
                    return float(value)
                except (TypeError, ValueError):
                    pass

        return 0.0

    @staticmethod
    def _complexity_rank(complexity: Any) -> tuple:
        """Heuristic ranking of common Big-O expressions."""

        if complexity is None:
            return (99, "")

        normalized = str(complexity).lower().strip()
        normalized = re.sub(r"\s+", "", normalized)
        normalized = normalized.replace("²", "^2")
        normalized = normalized.replace("³", "^3")
        normalized = normalized.replace("**2", "^2")
        normalized = normalized.replace("**3", "^3")

        aliases = {
            "o(1)": 0,
            "o(logn)": 1,
            "o(log(m+n))": 1,
            "o(log(min(m,n)))": 1,
            "o(n)": 2,
            "o(m+n)": 2,
            "o(max(m,n))": 2,
            "o(nlogn)": 3,
            "o(nlog(m+n))": 3,
            "o(n^2)": 4,
            "o(mn)": 4,
            "o(n^3)": 5,
            "o(2^n)": 6,
            "exponential": 6,
            "o(n!)": 7,
        }

        rank = aliases.get(normalized)

        if rank is not None:
            return (rank, normalized)

        return (99, normalized)

    # ========================================================
    # MAIN POLICY DECISION
    # ========================================================

    def decide(
        self,
        scores: dict,
        time_remaining: int,
        candidate_level: str = "medium",
        candidate_state: Any = None,
        current_reference_solution: Any = None,
        reference_match_confidence: float | None = None,
        target_reference_solution: Any = None,
        possible_next_reference_solutions: list | None = None,
        missing_concepts: list[str] | None = None,
        hints_given: list[str] | None = None,
        turns_remaining: int | None = None,
        current_reference_id: str | None = None,
        target_reference_id: str | None = None,
    ) -> dict:
        """Decide the next interview action. Call once per turn."""

        scores = scores if isinstance(scores, dict) else {}

        missing_concepts = (
            list(missing_concepts)
            if isinstance(missing_concepts, list)
            else []
        )

        hints_given = (
            list(hints_given)
            if isinstance(hints_given, list)
            else []
        )

        # --------------------------------------------------
        # Rule 1: Terminal conditions
        # --------------------------------------------------

        seconds_left = self._coerce_int(time_remaining)

        if seconds_left is None:
            return self._stop_decision(
                "Time remaining is missing or invalid."
            )

        if seconds_left <= 0:
            return self._stop_decision(
                "Interview time has ended."
            )

        if turns_remaining is not None:
            remaining_turns = self._coerce_int(turns_remaining)

            if remaining_turns is None:
                return self._stop_decision(
                    "Turns remaining is missing or invalid."
                )

            if remaining_turns <= 0:
                return self._stop_decision(
                    "No interview turns remain."
                )

        time_policy = self._get_time_policy(seconds_left)

        if time_policy == "STOP":
            return self._stop_decision(
                "Not enough time to start a new topic."
            )

        # Side effect: record progress once per turn.
        self.progress_tracker.record(scores)

        current_reference_id = self._normalize_reference_id(
            current_reference_id
        )
        target_reference_id = self._normalize_reference_id(
            target_reference_id
        )

        context = {
            "time_policy": time_policy,
            "hint_level": len(hints_given),
            "candidate_state": candidate_state,
            "current_reference_id": current_reference_id,
            "target_reference_id": target_reference_id,
            "current_reference_solution": current_reference_solution,
            "target_reference_solution": target_reference_solution,
            "missing_concepts": missing_concepts,
        }

        # --------------------------------------------------
        # Rule 2: Uncertain reference match (bounded)
        # --------------------------------------------------

        confidence = self._coerce_float(reference_match_confidence)

        if confidence is not None:
            if confidence < REFERENCE_CONFIDENCE_THRESHOLD:
                if (
                    self._clarification_attempts
                    < self.MAX_CLARIFICATION_ATTEMPTS
                ):
                    self._clarification_attempts += 1

                    return self._decision(
                        action="ASK_CLARIFICATION",
                        target_dimension=CONCEPT_DIMENSION,
                        difficulty="easy",
                        goal="clarify_current_approach",
                        reason=(
                            "The current approach could not be identified "
                            "with sufficient confidence."
                        ),
                        next_reference_solution=None,
                        **context,
                    )

                # Clarification budget used up: continue with gap analysis
                # rather than asking the same clarification again.

            else:
                self._clarification_attempts = 0

        # --------------------------------------------------
        # Rule 3: Honor the evaluator's explicit adaptive gap.
        #
        # The aggregate score map can contain historical scores for a
        # dimension that was NOT ASSESSED on the latest turn. An explicit
        # adaptive gap must therefore take precedence over aggregate scores.
        # --------------------------------------------------

        explicit_gap = self._get_state_value(
            candidate_state,
            "primary_adaptive_gap",
        )
        explicit_dimension = self._normalize_dimension(explicit_gap)

        if (
            explicit_dimension is not None
            and self.repetition_guard.can_target(explicit_dimension)
        ):
            self.repetition_guard.record_dimension(explicit_dimension)
            explicit_score = self._get_score(scores, explicit_dimension)

            return self._decision(
                action="ASK_FOLLOW_UP",
                target_dimension=explicit_dimension,
                difficulty=self._determine_difficulty(
                    candidate_level, explicit_score
                ),
                goal=self._determine_goal(explicit_dimension),
                reason=(
                    f"The evaluator explicitly identified an unresolved "
                    f"adaptive gap: {explicit_gap}. This takes precedence "
                    f"over historical aggregate scores."
                ),
                next_reference_solution=None,
                **context,
            )

        # --------------------------------------------------
        # Rule 4: Discovery when the approach differs from target
        #
        # Only probe discovery if concept_coverage is still unresolved.
        # If it already meets the threshold, further discovery questions
        # repeat known ground; fall through to gap analysis instead.
        # --------------------------------------------------

        references_differ = (
            current_reference_id is not None
            and target_reference_id is not None
            and current_reference_id != target_reference_id
        )

        if (
            references_differ
            and self._is_unresolved(CONCEPT_DIMENSION, scores)
            and self.repetition_guard.can_target(CONCEPT_DIMENSION)
        ):
            score = self._get_score(scores, CONCEPT_DIMENSION)

            next_reference = (
                possible_next_reference_solutions[0]
                if possible_next_reference_solutions
                else None
            )

            # Side effect: consume budget only when this action is chosen.
            self.repetition_guard.record_dimension(CONCEPT_DIMENSION)

            return self._decision(
                action="ASK_DISCOVERY",
                target_dimension=CONCEPT_DIMENSION,
                difficulty=self._determine_difficulty(candidate_level, score),
                goal="discover_concept_coverage",
                reason=(
                    "The current reference differs from the target "
                    "reference. Probe the candidate's approach and "
                    "conceptual understanding."
                ),
                next_reference_solution=next_reference,
                **context,
            )

        # --------------------------------------------------
        # Rules 4-5: Choose a follow-up dimension
        # --------------------------------------------------

        candidates = self._select_candidates(scores, time_policy)

        if not candidates:
            return self._stop_decision(
                self._no_candidates_reason(scores, time_policy)
            )

        # --------------------------------------------------
        # Rule 6: Build the follow-up decision
        # --------------------------------------------------

        target_dimension = candidates[0]
        score = self._get_score(scores, target_dimension)

        # Side effect: consume budget only when this action is chosen.
        self.repetition_guard.record_dimension(target_dimension)

        if score is None:
            reason = f"{target_dimension} has not been assessed yet."
        else:
            reason = (
                f"{target_dimension} is below the follow-up threshold "
                f"({score:.0f}/100)."
            )

        return self._decision(
            action="ASK_FOLLOW_UP",
            target_dimension=target_dimension,
            difficulty=self._determine_difficulty(candidate_level, score),
            goal=self._determine_goal(target_dimension),
            reason=reason,
            next_reference_solution=None,
            **context,
        )

    # ========================================================
    # CANDIDATE SELECTION
    # ========================================================

    def _select_candidates(
        self,
        scores: dict,
        time_policy: str,
    ) -> list[str]:
        """
        Return dimensions eligible for follow-up, highest priority first.

        1. Unresolved gaps from gap analysis (assessed, below threshold).
        2. If none are available and time allows, unassessed dimensions,
           ordered by weight.
        """

        gap_analysis = analyze_gaps(scores) or {}

        prioritized = (
            gap_analysis.get("prioritized_gaps", [])
            if isinstance(gap_analysis, dict)
            else []
        )

        if not isinstance(prioritized, list):
            prioritized = []

        unresolved_gaps = [
            dimension
            for dimension in self._unique_dimensions(prioritized)
            if self._is_unresolved(dimension, scores)
        ]

        candidates = self._unique_dimensions(
            self.repetition_guard.filter_available(unresolved_gaps)
        )

        if candidates or time_policy == "URGENT":
            return candidates

        unassessed = sorted(
            self._get_unassessed_dimensions(scores),
            key=lambda dimension: -self.DIMENSION_WEIGHTS[dimension],
        )

        return self._unique_dimensions(
            self.repetition_guard.filter_available(unassessed)
        )

    def _no_candidates_reason(
        self,
        scores: dict,
        time_policy: str,
    ) -> str:
        all_resolved = all(
            not self._is_unresolved(dimension, scores)
            for dimension in self.DIMENSION_WEIGHTS
        )

        if all_resolved:
            return "All dimensions meet the follow-up threshold."

        if time_policy == "URGENT":
            return "Too little time remains to open new dimensions."

        return "Remaining dimensions have reached their revisit limit."

    @staticmethod
    def _get_state_value(state: Any, key: str) -> Any:
        """Read a value from either a state object or a state dictionary."""
        if isinstance(state, dict):
            return state.get(key)
        return getattr(state, key, None) if state is not None else None

    # ========================================================
    # SCORE HELPERS
    # ========================================================

    @classmethod
    def _get_assessment_status(cls, value: Any) -> str | None:
        if not isinstance(value, dict):
            return None

        for key in (
            "assessment_status",
            "assessment_status_label",
            "status",
        ):
            status = value.get(key)

            if status is not None:
                return cls._normalize_name(status)

        return None

    @classmethod
    def _extract_valid_score(cls, value: Any) -> float | None:
        """Return a valid assessed score from a raw score entry."""

        if isinstance(value, dict):
            status = cls._get_assessment_status(value)

            if status in cls.UNASSESSED_STATUSES:
                return None

            value = value.get("score")

        return cls._normalize_score(value)

    @classmethod
    def _get_score(cls, scores: dict, dimension: str) -> float | None:
        """
        Return the valid assessed score for a dimension, or None.

        Only the scores passed in are used. The canonical key is checked
        first, then any alias keys that map to the same dimension.
        """

        if not isinstance(scores, dict):
            return None

        canonical = cls._normalize_dimension(dimension)

        if canonical is None:
            return None

        keys = [canonical]

        for key in scores:
            if (
                isinstance(key, str)
                and key != canonical
                and cls._normalize_dimension(key) == canonical
            ):
                keys.append(key)

        for key in keys:
            if key not in scores:
                continue

            score = cls._extract_valid_score(scores[key])

            if score is not None:
                return score

        return None

    @classmethod
    def _get_unassessed_dimensions(cls, scores: dict) -> list[str]:
        return [
            dimension
            for dimension in cls.DIMENSION_WEIGHTS
            if cls._get_score(scores, dimension) is None
        ]

    @classmethod
    def _unique_dimensions(cls, dimensions: list) -> list[str]:
        result = []
        seen = set()

        for dimension in dimensions:
            canonical = cls._normalize_dimension(dimension)

            if canonical is None or canonical in seen:
                continue

            seen.add(canonical)
            result.append(canonical)

        return result

    def _is_unresolved(self, dimension: str, scores: dict) -> bool:
        """Unresolved means unassessed or below the follow-up threshold."""

        score = self._get_score(scores, dimension)

        return score is None or score < FOLLOW_UP_THRESHOLD

    # ========================================================
    # TIME POLICY
    # ========================================================

    @staticmethod
    def _get_time_policy(time_remaining: int) -> str:
        if time_remaining <= THIRTY_SECONDS:
            return "STOP"

        if time_remaining <= TWO_MINUTES:
            return "URGENT"

        if time_remaining > MORE_THAN_5_MINUTES:
            return "NORMAL"

        return "LIMITED"

    # ========================================================
    # DIFFICULTY AND GOAL
    # ========================================================

    def _determine_difficulty(
        self,
        candidate_level: str,
        score: float | None,
    ) -> str:
        level = self._normalize_level(candidate_level)
        validated = self._normalize_score(score)

        if validated is None:
            return "easy" if level in {"beginner", "easy"} else "medium"

        if validated < LOW_SCORE_THRESHOLD:
            return "easy"

        if validated >= FOLLOW_UP_THRESHOLD:
            if level in {"hard", "advanced"}:
                return "hard"

            if level in {"beginner", "easy"}:
                return "easy"

            return "medium"

        if level in {"hard", "advanced"}:
            return "hard"

        if level in {"beginner", "easy"}:
            return "easy"

        return "medium"

    def _determine_goal(self, target_dimension: str) -> str:
        canonical = self._normalize_dimension(target_dimension)

        if canonical is None:
            return "improve_technical_reasoning"

        return self.DIMENSION_GOALS.get(
            canonical,
            "improve_technical_reasoning",
        )

    # ========================================================
    # RESPONSE CONTRACT
    # ========================================================

    @staticmethod
    def _decision(
        *,
        action: str,
        target_dimension: str | None,
        difficulty: str | None,
        goal: str,
        reason: str,
        hint_level: int,
        time_policy: str,
        candidate_state: Any = None,
        current_reference_id: str | None = None,
        target_reference_id: str | None = None,
        current_reference_solution: Any = None,
        next_reference_solution: Any = None,
        target_reference_solution: Any = None,
        missing_concepts: list | None = None,
    ) -> dict:
        return {
            "action": action,
            "target_dimension": target_dimension,
            "difficulty": difficulty,
            "goal": goal,
            "hint_level": hint_level,
            "do_not_reveal_solution": True,
            "time_policy": time_policy,
            "reason": reason,
            "candidate_state": candidate_state,
            "current_reference_id": current_reference_id,
            "target_reference_id": target_reference_id,
            "current_reference_solution": current_reference_solution,
            "next_reference_solution": next_reference_solution,
            "target_reference_solution": target_reference_solution,
            "missing_concepts": (
                list(missing_concepts) if missing_concepts else []
            ),
        }

    @classmethod
    def _stop_decision(cls, reason: str) -> dict:
        return cls._decision(
            action="STOP",
            target_dimension=None,
            difficulty=None,
            goal="complete_interview",
            reason=str(reason),
            hint_level=0,
            time_policy="STOP",
        )