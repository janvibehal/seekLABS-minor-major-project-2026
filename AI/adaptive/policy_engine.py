# ============================================================
# ADAPTIVE INTERVIEW POLICY ENGINE — DATA FLOW OVERVIEW
# ============================================================
# This module is the DECISION / ORCHESTRATION layer of the adaptive
# interviewer. It does not itself evaluate the candidate's answer.
#
# High-level flow:
#
#   Candidate answer
#        |
#        v
#   Evaluation Engine
#        |  scores: 0-100 per dimension
#        v
#   PolicyEngine.decide(...)
#        |
#        +--> ProgressTracker   -> remembers score history
#        +--> analyze_gaps(...) -> identifies/prioritizes weaknesses
#        +--> RepetitionGuard   -> prevents asking the same dimension
#        |                         too many times
#        +--> reference metadata -> determines whether the candidate's
#        |                         approach is progressing toward the
#        |                         canonical/target solution
#        +--> time + candidate level -> controls difficulty and scope
#        |
#        v
#   POLICY DECISION DICT
#   {action, target_dimension, difficulty, goal, ...}
#        |
#        v
#   DOWNSTREAM INTERVIEW / QUESTION GENERATOR LAYER
#        |
#        v
#   Next question shown to candidate
#
# IMPORTANT:
# - `scores` enter this layer from the evaluation layer.
# - This class decides WHAT to ask next, not the final candidate score.
# - The returned dictionary is effectively a contract/API for the next
#   interviewer/question-generation layer.
# ============================================================
import re
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


class PolicyEngine:
    # The class owns the adaptive decision policy. The interviewer
    # controller is expected to call `decide()` after a candidate
    # response has been evaluated.
    """
    Decides what the adaptive interviewer should do next.

    Dimension scores are raw 0-100 scores produced by the
    evaluation engine. Adaptive thresholds are therefore applied
    directly to those scores.

    Dimension weights remain available for overall scoring and
    prioritization, but they must not be used to reinterpret an
    individual dimension's 0-100 evaluation score.

    Decides what the system should do next.

    Uses:
    - gap analysis
    - progress tracking
    - repetition prevention
    - score thresholds
    - candidate level
    - remaining interview time

    Updated reference-progression inputs:
    - candidate state
    - current matched reference solution
    - reference match confidence
    - target/optimal reference solution
    - possible next reference solutions
    - missing concepts
    - hints already given
    - remaining turns
    """

    # These weights describe the relative importance of evaluation
    # dimensions for the broader scoring/prioritization system.
    # They are NOT used here to convert a dimension's raw 0-100 score.
    # Example: a correctness score of 70 remains 70, rather than becoming
    # 17.5 after applying the 25% weight.
    DIMENSION_WEIGHTS = {
        "algorithm_correctness": 25,
        "logical_reasoning": 20,
        "concept_coverage": 15,
        "completeness": 10,
        "data_structure": 10,
        "complexity": 10,
        "edge_cases": 10,
    }

        # Runtime state is created once for an interview session.
        # `repetition_guard` tracks which dimensions have already been
        # targeted so the interviewer does not repeatedly probe the same
        # weakness.
    def __init__(self):
        self.repetition_guard = RepetitionGuard(
            max_revisits=MAX_DIMENSION_REVISITS
        )

        # `progress_tracker` stores score history so the engine can
        # compare the latest evaluation with earlier evaluations and
        # determine whether a previously weak dimension has improved.
        self.progress_tracker = ProgressTracker()

    # ==========================================================
    # TARGET REFERENCE SELECTION
    # ==========================================================

        # INPUT FROM REFERENCE-DATA / KNOWLEDGE LAYER:
        # `references` is expected to contain candidate/solution reference
        # records loaded from the problem's reference-solution dataset.
        #
        # OUTPUT:
        # A single Reference ID is returned. The caller can use that ID to
        # identify the canonical target solution for this problem.
    def select_target_reference(
        self,
        references: list[dict]
    ) -> str | None:
        """
        Select one canonical target reference for a problem.

        References are ranked using the metadata available in
        the dataset.

        Priority:
        1. Validity/correctness metadata, if available
        2. Better time complexity
        3. Better space complexity
        4. Quality/preference metadata, if available
        5. Deterministic Reference ID ordering
        """

        if not references:
            return None

        # The dataset may contain multiple acceptable solution paths.
        # We sort them first so that the first record is the canonical
        # target selected by this policy.
        ranked_references = sorted(
            references,
            key=self._reference_rank_key
        )

        target = ranked_references[0]

        reference_id = target.get(
            "Reference ID"
        )

        if reference_id is None:
            return None

        return str(
            reference_id
        ).strip()


    def _reference_rank_key(
        self,
        reference: dict
    ) -> tuple:
        """
        Build a deterministic ranking key for a reference.

        Lower values are better.
        """

        # First ranking signal: explicit validity/correctness metadata.
        # This lets the system avoid selecting a reference that the dataset
        # marks as invalid or incorrect.
        validity_rank = self._get_validity_rank(
            reference
        )

        # Second ranking signal: time complexity. Among otherwise
        # equivalent references, lower asymptotic time complexity ranks first.
        time_rank = self._complexity_rank(
            reference.get(
                "Time Complexity"
            )
        )

        # Third ranking signal: space complexity.
        space_rank = self._complexity_rank(
            reference.get(
                "Space Complexity"
            )
        )

        # Fourth ranking signal: an optional dataset-provided quality/
        # preference score.
        quality_rank = self._get_quality_rank(
            reference
        )

        reference_id = str(
            reference.get(
                "Reference ID",
                ""
            )
        ).strip()

        # The tuple is compared left-to-right by Python's sorting:
        # validity -> time -> space -> quality -> Reference ID.
        # This makes reference selection deterministic.
        return (
            validity_rank,
            time_rank,
            space_rank,
            quality_rank,
            reference_id
        )


    def _get_validity_rank(
        self,
        reference: dict
    ) -> int:
        """
        Return a ranking based on validity/correctness metadata
        when such metadata exists.

        Lower is better.
        """

        # Different datasets may call the same concept by different
        # column names, so the method accepts several possible metadata keys.
        for key in (
            "Validity",
            "Correctness",
            "Is Valid",
            "Is Correct"
        ):

            value = reference.get(key)

            if value is None:
                continue

            normalized = str(
                value
            ).strip().lower()

            if normalized in (
                "true",
                "yes",
                "valid",
                "correct"
            ):
                return 0

            if normalized in (
                "false",
                "no",
                "invalid",
                "incorrect"
            ):
                return 1

        # No explicit validity metadata.
        return 0


    def _get_quality_rank(
        self,
        reference: dict
    ) -> float:
        """
        Use preference/quality metadata if the dataset provides it.

        Lower is better.

        If no such metadata exists, all references remain tied
        on this criterion.
        """

        for key in (
            "Quality Score",
            "Solution Quality",
            "Reference Priority",
            "Priority"
        ):

            value = reference.get(key)

            if value is None:
                continue

            try:
                return float(value)

            except (
                TypeError,
                ValueError
            ):
                continue

        return 0.0


    def _complexity_rank(
        self,
        complexity: object
    ) -> tuple:
        """
        Convert common Big-O complexity strings into a ranking.

        Lower rank means better asymptotic complexity.

        Unknown complexities are ranked after recognized ones.
        """

        if complexity is None:
            return (
                99,
                ""
            )

        normalized = str(
            complexity
        ).lower()

        normalized = re.sub(
            r"\s+",
            "",
            normalized
        )

        normalized = normalized.replace(
            "average",
            ""
        )

            # Recognized complexity strings are converted to an ordinal
            # ranking so references can be compared consistently.
        rankings = [
            ("o(1)", 0),
            ("o(logn)", 1),
            ("o(log(m+n))", 1),
            ("o(log(min(m,n)))", 1),
            ("o(n)", 2),
            ("o(m+n)", 2),
            ("o(max(m,n))", 2),
            ("o(nlogn)", 3),
            ("o(nlog(m+n))", 3),
            ("o(n^2)", 4),
            ("o(mn)", 4),
            ("o(n^3)", 5),
            ("exponential", 6),
        ]

        for pattern, rank in rankings:

            if pattern == normalized:
                return (
                    rank,
                    normalized
                )

        return (
            99,
            normalized
        )

    # ==========================================================
    # MAIN DECISION
    # ==========================================================

        # ========================================================
        # CORE INPUT CONTRACT
        # ========================================================
        # `scores`: output of the evaluation engine. Expected shape is
        # approximately:
        # {
        #   "algorithm_correctness": {"score": 72, ...},
        #   "logical_reasoning": {"score": 61, ...},
        #   ...
        # }
        #
        # `time_remaining`: current interview clock in seconds.
        #
        # Reference-related arguments describe the candidate's current
        # solution path and where the system wants to move it.
        #
        # Other state (`missing_concepts`, `hints_given`, `turns_remaining`)
        # is contextual information produced by earlier layers.
        #
        # OUTPUT:
        # A policy dictionary consumed by the downstream interviewer/
        # question-generation layer.
    def decide(
        self,
        scores: dict,
        time_remaining: int,
        candidate_level: str = "medium",
        candidate_state: str | None = None,
        current_reference_solution: str | None = None,
        reference_match_confidence: float | None = None,
        target_reference_solution: str | None = None,
        possible_next_reference_solutions: list[str] | None = None,
        missing_concepts: list[str] | None = None,
        hints_given: list[str] | None = None,
        turns_remaining: int | None = None,
        current_reference_id: str | None = None,
        target_reference_id: str | None = None
    ) -> dict:

        """
        Generate the next adaptive policy decision.

        The policy first checks stopping conditions.

        Then it determines whether the candidate's current
        approach can be confidently identified.

        If the current approach is valid but not yet optimal,
        the policy asks a discovery question targeting the
        next useful improvement.

        Otherwise, normal gap analysis is used to identify
        the weakest evaluation dimension.
        """

        # --------------------------------------------------
        # Rule 1: Interview time is over
        # --------------------------------------------------

            # STOP is an immediate terminal signal.
            # DOWNSTREAM: the interview controller should end questioning
            # and move to its closing/final-evaluation flow.
        if time_remaining <= 0:
            return self._stop_decision(
                "Interview time has ended."
            )

        # Push the newly received evaluation into historical state.
        # DOWNSTREAM WITHIN THIS CLASS:
        # ProgressTracker.latest_scores() can later use this history to
        # decide whether a gap has been resolved.
        self.progress_tracker.record(scores)

        # GAP ANALYZER consumes the current dimension scores and returns
        # prioritized weaknesses. This is the bridge from "how well did
        # the candidate answer?" to "what should we probe next?"
        gap_analysis = analyze_gaps(scores)

        prioritized_gaps = (
            gap_analysis.get(
                "prioritized_gaps",
                []
            )
            or []
        )
        # --------------------------------------------------
        # Rule 2: No turns remaining
        # --------------------------------------------------

        if (
            # No remaining turns means there is no capacity for another
            # question, regardless of score quality.
            turns_remaining is not None
            and turns_remaining <= 0
        ):
            return self._stop_decision(
                "No interview turns remain."
            )

        # --------------------------------------------------
        # Step 1: Record current scores for progress tracking
        # --------------------------------------------------

        # NOTE: the supplied implementation records the same `scores`
        # object a second time here. This appears redundant because the
        # same `scores` were already recorded above at line 349.
        # If `ProgressTracker.record()` appends history, this can create
        # duplicate history entries. Consider removing one of the calls
        # after verifying the intended tracker semantics.
        self.progress_tracker.record(scores)

        # --------------------------------------------------
        # Step 2: Check reference-match confidence BEFORE
        # comparing reference IDs.
        #
        # This check must happen first. A low-confidence match means
        # the system is not sufficiently certain about the candidate's
        # current approach, so it must clarify rather than act on a
        # potentially incorrect reference match.
        # --------------------------------------------------

        if (
            reference_match_confidence is not None
            and reference_match_confidence < REFERENCE_CONFIDENCE_THRESHOLD
        ):
            return {
                "action": "ASK_CLARIFICATION",
                "target_dimension": None,
                "difficulty": "easy",
                "goal": "clarify_current_approach",
                "hint_level": len(hints_given or []),
                "do_not_reveal_solution": True,
                "time_policy": self._get_time_policy(
                    time_remaining
                ),
                "reason": (
                    "The candidate's current approach could "
                    "not be identified with sufficient confidence."
                ),
                "candidate_state": candidate_state,
                "current_reference_solution":
                    current_reference_solution,
                "target_reference_solution":
                    target_reference_solution,
                "missing_concepts":
                    missing_concepts or []
            }

        # --------------------------------------------------
        # Step 3: Compare the candidate's current reference
        # with the canonical target reference.
        #
        # Same reference ID means the candidate has reached
        # the target approach.
        # --------------------------------------------------

        if (
            current_reference_id is not None
            and target_reference_id is not None
            and current_reference_id == target_reference_id
        ):
            return self._stop_decision(
                "Candidate has reached the target reference solution."
            )

        # --------------------------------------------------
        # Candidate is on a different reference approach.
        # Guide them toward the target.
        # --------------------------------------------------

        if (
            current_reference_id is not None
            and target_reference_id is not None
            and current_reference_id != target_reference_id
        ):
            next_reference = None

            # `possible_next_reference_solutions` comes from the
            # reference-progression layer. The first item is treated as
            # the next candidate target by this implementation.
            if possible_next_reference_solutions:
                next_reference = possible_next_reference_solutions[0]

            # If missing concepts are available, target the first missing
            # concept. Otherwise use concept coverage as the general
            # improvement dimension.
            target_dimension = (
                missing_concepts[0]
                if missing_concepts
                else "concept_coverage"
            )

            # Read the score associated with the selected concept/dimension
            # so difficulty can be adapted to the candidate's current level.
            target_score = self._get_score(
                scores,
                target_dimension
            )

            difficulty = self._determine_difficulty(
                candidate_level,
                target_score
            )

            # THIS DICTIONARY IS THE MAIN HANDOFF TO THE NEXT LAYER.
            return {
                "action": "ASK_DISCOVERY",
                "target_dimension": target_dimension,
                "difficulty": difficulty,
                "goal": f"discover_{target_dimension}",
                "hint_level": len(hints_given or []),
                "do_not_reveal_solution": True,
                "time_policy": self._get_time_policy(
                    time_remaining
                ),
                "reason": (
                    "The candidate's current approach is valid "
                    "but has not yet reached the target approach."
                ),
                "candidate_state": candidate_state,
                "current_reference_solution":
                    current_reference_solution,
                "next_reference_solution":
                    next_reference,
                "target_reference_solution":
                    target_reference_solution,
                "missing_concepts":
                    missing_concepts or []
            }


        # --------------------------------------------------
        # Step 4: Normal gap analysis
        #
        # Used when:
        # - the current approach is already optimal, or
        # - reference-progression information is not supplied.
        # --------------------------------------------------

        # At this point reference progression did not produce a special
        # discovery action, so the engine falls back to ordinary score-based
        # adaptive interviewing.
        #
        # `analyze_gaps` -> prioritized_gaps -> repetition filter ->
        # resolved-gap filter -> choose first remaining gap.
        gap_analysis = analyze_gaps(scores)

        prioritized_gaps = (
            gap_analysis["prioritized_gaps"]
        )

        # --------------------------------------------------
        # Step 5: Remove dimensions targeted too many times
        # --------------------------------------------------

            # RepetitionGuard consumes the prioritized list and removes
            # dimensions that have already been targeted too many times.
            # This protects the interview from repeatedly asking about one
            # weakness while ignoring other dimensions.
        available_gaps = (
            self.repetition_guard.filter_available(
                prioritized_gaps
            )
        )

        # --------------------------------------------------
        # Step 6: Remove gaps that are now resolved
        # --------------------------------------------------

        # A gap that was previously weak but has now crossed the follow-up
        # threshold is removed from the active queue.
        available_gaps = [
            dimension
            for dimension in available_gaps
            if not self._is_gap_resolved(dimension)
        ]

        # ------------------------------------------------------
        # If there are no detected gaps, do not automatically
        # terminate because the interviewer may still need to
        # probe unassessed dimensions.
        # ------------------------------------------------------
        # --------------------------------------------------
        # Rule 3: No unresolved gaps available
        # --------------------------------------------------

            # No active weakness remains. The engine terminates instead of
            # generating an unnecessary follow-up.
            #
            # Note that the comment above says the interviewer may still
            # probe unassessed dimensions, but this implementation does not
            # actually do that here; it returns STOP.
        if not available_gaps:
            return self._stop_decision(
                "No assessed weakness requires a targeted follow-up."
            )

        # --------------------------------------------------
        # Step 7: Select highest-priority gap
        # --------------------------------------------------

        # `analyze_gaps` has already ordered the remaining weaknesses by
        # priority, so index 0 becomes the next dimension to probe.
        target_dimension = available_gaps[0]

        target_score = self._get_score(
            scores,
            target_dimension
        )

        # Clamp the evaluator's score into the expected 0-100 range.
        # This protects threshold comparisons from malformed/out-of-range
        # evaluator output.
        normalized_score = self._normalize_score(
            target_dimension,
            target_score
        )

        # ------------------------------------------------------
        # IMPORTANT:
        #
        # FOLLOW_UP_THRESHOLD is interpreted on a 0-100
        # normalized scale.
        # ------------------------------------------------------
        # --------------------------------------------------
        # Step 8: Check whether a follow-up is required
        # --------------------------------------------------

        if (
            # If the selected weakness is no longer below the follow-up
            # threshold, there is no reason to ask another targeted question.
            normalized_score is not None
            and normalized_score >= FOLLOW_UP_THRESHOLD
        ):
            return self._stop_decision(
                "Selected gap is no longer below the follow-up threshold."
            )

        # --------------------------------------------------
        # Step 9: Time-aware decision
        # --------------------------------------------------

        # Time policy is calculated before generating the next action so
        # the downstream layer knows how aggressively it can continue.
        time_policy = self._get_time_policy(
            time_remaining
        )

        if time_policy == "STOP":
            return self._stop_decision(
                "Not enough time to start a new topic."
            )

        # --------------------------------------------------
        # Step 10: Determine difficulty
        # --------------------------------------------------

        # Difficulty combines candidate level with the selected dimension's
        # current score. This determines the difficulty metadata passed to the
        # question generator.
        difficulty = self._determine_difficulty(
            candidate_level,
            normalized_score
        )

        # --------------------------------------------------
        # Step 11: Determine follow-up goal
        # --------------------------------------------------

        # Goal describes the intended learning/evaluation operation for the
        # next question: clarify a weak dimension or probe a moderate one.
        goal = self._determine_goal(
            target_dimension,
            normalized_score
        )

        # --------------------------------------------------
        # Step 12: Record selected dimension
        # --------------------------------------------------

        # Record the chosen dimension BEFORE returning it so the next
        # iteration knows that this dimension has just been targeted.
        self.repetition_guard.record_dimension(
            target_dimension
        )

        # ========================================================
        # FINAL OUTPUT / DOWNSTREAM CONTRACT
        # ========================================================
        # The caller should pass this policy object into the layer that
        # generates the next interview question.
        #
        # Conceptually:
        #
        #   PolicyEngine.decide(...)
        #          |
        #          v
        #   {
        #       action: "ASK_FOLLOW_UP",
        #       target_dimension: "...",
        #       difficulty: "...",
        #       goal: "...",
        #       hint_level: ...,
        #       time_policy: "...",
        #       reference context: ...
        #   }
        #          |
        #          v
        #   Question Generator / Interview Controller
        #          |
        #          v
        #   Next question -> Candidate
        #
        # After the candidate answers, that answer is evaluated again,
        # producing a new `scores` object. The cycle repeats.
        return {
            "action": "ASK_FOLLOW_UP",
            "target_dimension": target_dimension,
            "difficulty": difficulty,
            "goal": goal,
            "hint_level": len(hints_given or []),
            "do_not_reveal_solution": True,
            "time_policy": time_policy,
            "reason": (
                f"{target_dimension} is the highest-priority "
                f"unresolved gap."
            ),
            "candidate_state": candidate_state,
            "current_reference_solution":
                current_reference_solution,
            "target_reference_solution":
                target_reference_solution,
            "missing_concepts":
                missing_concepts or []
        }

    # ==========================================================
    # SCORE HELPERS
    # ==========================================================

    def _get_score(
        self,
        scores: dict,
        dimension: str
    ) -> float | None:

        # This helper is the boundary between the evaluator's score format
        # and the policy engine's internal numeric comparisons.
        #
        # It accepts either:
        #   "algorithm_correctness": 72
        # or:
        #   "algorithm_correctness": {"score": 72, ...}
        if dimension == "data_structure":
            dimension = "data_structure"

        # Extract the dimension's value from the complete score payload.
        value = scores.get(
            dimension
        )

        # ------------------------------------------------------
        # Scores normally arrive as:
        #
        # {
        #     "score": 10,
        #     "assessment_status": "ASSESSED"
        # }
        #
        # Be tolerant of a plain numeric score as well.
        # ------------------------------------------------------

            # Evaluation layer normally returns metadata alongside the
            # score. Only the numeric `score` is needed for adaptive policy.
        if isinstance(value, dict):

            value = value.get(
                "score"
            )

        if value is None:
            return None

        try:
            return float(value)

        except (
            TypeError,
            ValueError
        ):
            return None

        # IMPORTANT DATA CONTRACT:
        # The evaluator's individual dimension score remains a 0-100 score.
        # Dimension weights are intentionally not applied here.
    def _normalize_score(
        self,
        dimension: str,
        score: float | None
    ) -> float | None:
        """Return the evaluator's raw 0-100 dimension score.

        Dimension weights are used elsewhere for overall scoring and
        prioritization. They must not rescale an individual dimension
        score before adaptive thresholds are applied.
        """

        if score is None:
            return None

        return max(
            0.0,
            min(
                100.0,
                float(score)
            )
        )

    # ==========================================================
    # GAP RESOLUTION
    # ==========================================================

    def _is_gap_resolved(
        self,
        dimension: str
    ) -> bool:

        # Read the most recent evaluation from ProgressTracker rather than
        # relying only on the current local score. This allows the engine to
        # decide whether a previously targeted weakness has been fixed.
        latest_scores = (
            self.progress_tracker.latest_scores()
        )

        if latest_scores is None:
            return False

        latest_score = self._get_score(
            latest_scores,
            dimension
        )

        normalized_score = self._normalize_score(
            dimension,
            latest_score)
        if latest_score is None:
            return False

        # A dimension is considered resolved once its latest score reaches
        # the configured follow-up threshold.
        return (
            normalized_score is not None
            and normalized_score >= FOLLOW_UP_THRESHOLD
        )

    # ==========================================================
    # TIME POLICY
    # ==========================================================

    def _get_time_policy(
        self,
        time_remaining: int
    ) -> str:
        """
        Determine the adaptive strategy based on remaining interview time.
        """

        if time_remaining <= 0:
            return "STOP"

        if time_remaining <= THIRTY_SECONDS:
            return "STOP"

        if time_remaining <= TWO_MINUTES:
            return "URGENT"

        if time_remaining > MORE_THAN_5_MINUTES:
            return "NORMAL"

        return "LIMITED"

    # ==========================================================

    def _determine_difficulty(
        self,
        candidate_level: str,
        score: float | None
    ) -> str:
        """
        Determine the difficulty metadata for the next question.

        Candidate level provides the baseline. The current weakness score
        then adjusts the question so that a very weak area is not probed
        with an unnecessarily difficult question, while a stronger candidate
        can receive a more demanding probe.

        Returns one of: easy, medium, hard.
        """

        level = str(candidate_level or "medium").strip().lower()

        if level not in {"beginner", "easy", "medium", "hard", "advanced"}:
            level = "medium"

        normalized_score = (
            self._normalize_score("", score)
            if score is not None
            else None
        )

        # Very weak dimension: keep the probe accessible.
        if normalized_score is not None and normalized_score < LOW_SCORE_THRESHOLD:
            return "easy"

        # Strong performance: allow a harder probe when the candidate level
        # supports it.
        if normalized_score is not None and normalized_score >= FOLLOW_UP_THRESHOLD:
            if level in {"hard", "advanced"}:
                return "hard"
            if level == "medium":
                return "medium"
            return "easy"

        # Moderate weakness: preserve the candidate's baseline without
        # exceeding the supported difficulty range.
        if level in {"hard", "advanced"}:
            return "hard"
        if level in {"beginner", "easy"}:
            return "easy"

        return "medium"

    def _determine_goal(
        self,
        target_dimension: str,
        score: float | None
    ) -> str:
        """
        Convert an evaluation dimension into a stable downstream goal.

        The question-generation layer uses this goal as intent metadata;
        it should not be interpreted as the final evaluation result.
        """

        dimension = str(target_dimension or "").strip().lower()

        goal_map = {
            "algorithm_correctness": "improve_algorithm_correctness",
            "logical_reasoning": "improve_logical_reasoning",
            "concept_coverage": "improve_concept_coverage",
            "completeness": "improve_completeness",
            "data_structure": "improve_data_structure_selection",
            "complexity": "improve_complexity_analysis",
            "edge_cases": "improve_edge_case_handling",
        }

        return goal_map.get(
            dimension,
            f"improve_{dimension}" if dimension else "improve_technical_reasoning"
        )

    # ==========================================================
    # STOP DECISION HELPER
    # ==========================================================

    def _stop_decision(
        self,
        reason: str
    ) -> dict:
        """
        Build the terminal policy contract.

        This keeps terminal responses consistent across all stopping
        conditions and avoids duplicating the same dictionary throughout
        `decide()`.
        """

        return {
            "action": "STOP",
            "target_dimension": None,
            "difficulty": None,
            "goal": "complete_interview",
            "hint_level": 0,
            "do_not_reveal_solution": True,
            "time_policy": "STOP",
            "reason": str(reason),
            "candidate_state": None,
            "current_reference_solution": None,
            "target_reference_solution": None,
            "next_reference_solution": None,
            "missing_concepts": [],
        }
