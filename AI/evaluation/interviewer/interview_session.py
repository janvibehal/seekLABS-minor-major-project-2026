
from typing import Optional
import re

from AI.evaluation.extraction.extraction_service import (
    extract_candidate_features,
)
from AI.evaluation.persistence.candidate_state_store import (
    CandidateStateStore,
)
from AI.adaptive.policy_engine import PolicyEngine
from AI.evaluation.scoring.candidate_state import (
    CandidateEvaluationState,
    CandidateNLPState,
)
from AI.evaluation.scoring.evaluation_orchestrator import (
    evaluate_candidate_turn,
)
from AI.evaluation.scoring.final_result import (
    build_final_result,
)
from AI.evaluation.interviewer.followup_generator import (
    generate_followup_question,
)
from AI.conversation.timer_service import TimerService
from AI.evaluation.dataset_loader import load_evaluation_context


# ============================================================
# DIAGNOSTIC HELPERS
# ============================================================

SCORE_DIMENSIONS = (
    "algorithm_correctness",
    "logical_reasoning",
    "concept_coverage",
    "completeness",
    "data_structure",
    "complexity",
    "edge_cases",
)


def _print_section(title: str) -> None:
    print()
    print(title)
    print("-" * len(title))


def _display(value) -> str:
    if value is None:
        return "Not identified"

    if isinstance(value, list):
        values = [
            str(item).strip()
            for item in value
            if str(item).strip()
        ]
        return ", ".join(values) if values else "None identified"

    value = str(value).strip()
    return value if value else "Not identified"


def _print_candidate_answer(candidate_answer: str) -> None:
    _print_section("CANDIDATE ANSWER")
    print(candidate_answer)


def _print_nlp_extraction(candidate_features: dict) -> None:
    _print_section("NLP EXTRACTION")

    fields = [
        ("Approach", "approach"),
        ("Algorithms", "algorithms"),
        ("Concepts", "concepts"),
        ("Operations", "operations"),
        ("Data Structures", "data_structures"),
        ("Time Complexity", "time_complexity"),
        ("Space Complexity", "space_complexity"),
        ("Edge Cases", "edge_cases"),
        ("Reasoning Summary", "reasoning_summary"),
        ("Assumptions", "assumptions"),
        ("Optimization", "optimization"),
    ]

    for label, key in fields:
        print(f"{label:<24}: {_display(candidate_features.get(key))}")


def _normalize_complexity(value):
    """Normalize common complexity notation without inferring claims."""
    if not isinstance(value, str):
        return value

    normalized = value.strip()
    normalized = re.sub(
        r"(?i)\bO\s*\(\s*n\s*2\s*\)",
        "O(n^2)",
        normalized,
    )
    normalized = re.sub(
        r"(?i)\bO\s*\(\s*n\s*log\s*n\s*\)",
        "O(n log n)",
        normalized,
    )
    return normalized or None


def _is_score(value) -> bool:
    return (
        isinstance(value, (int, float))
        and not isinstance(value, bool)
        and 0 <= value <= 100
    )


def _merge_scores(previous: dict, incoming: dict) -> dict:
    """
    Merge scores without allowing missing or invalid values to
    overwrite previously valid scores.
    """
    merged = dict(previous or {})

    for dimension, value in (incoming or {}).items():
        if _is_score(value):
            merged[dimension] = value
        elif isinstance(value, dict):
            score = value.get("score")
            if _is_score(score):
                merged[dimension] = value

    return merged


def _is_exit_command(answer: str) -> bool:
    """
    Recognize explicit interview-ending requests.

    'I don't know' alone is not an exit command.
    'I don't know, let's end' is an exit command.
    """
    text = re.sub(r"\s+", " ", answer.lower()).strip()
    text = re.sub(r"[.!?]+$", "", text)
    text = text.replace("’", "'")

    patterns = (
        r"\b(?:i want to|i'd like to|i would like to) "
        r"(?:end|stop|quit) (?:the )?interview\b",
        r"\b(?:can we|could we|let us|let's|lets) "
        r"(?:please )?(?:end|stop|quit) "
        r"(?:the |this )?interview\b",
        r"\b(?:please )?(?:end|stop|quit|terminate) "
        r"(?:the |this )?interview\b",
        r"\b(?:finish|end) (?:this|the) interview\b",
        r"\b(?:i want to stop|i want to quit)\b",
        r"\b(?:i don't know|i do not know|dont know),?\s*"
        r"(?:but )?(?:let's|lets|let us|we should|i want to) "
        r"(?:end|stop|quit)\b",
        r"\b(?:let's|lets|let us) "
        r"(?:just )?(?:end|stop|quit)\b",
    )

    return any(re.search(pattern, text) for pattern in patterns)


def _is_skip_command(answer: str) -> bool:
    """Recognize a skip without confusing it with an exit request."""
    text = re.sub(r"\s+", " ", answer.lower()).strip()
    text = re.sub(r"[.!?]+$", "", text)
    text = text.replace("’", "'")

    return text in {
        "skip",
        "skip this",
        "skip this question",
        "pass",
        "next question",
        "i want to skip",
        "i don't know",
        "i do not know",
        "dont know",
        "don't know",
        "not sure",
        "i am not sure",
        "i'm not sure",
    }


def _extract_scores(state) -> dict:
    scores = getattr(state, "scores", {})
    return dict(scores) if isinstance(scores, dict) else {}


def _extract_evidence(state) -> dict:
    evidence = getattr(state, "evidence", {})
    return dict(evidence) if isinstance(evidence, dict) else {}


def _safe_set_attribute(obj, name: str, value) -> None:
    try:
        setattr(obj, name, value)
    except (AttributeError, TypeError):
        pass


# ============================================================
# INTERVIEW SESSION
# ============================================================

class InterviewSession:
    """
    Controls one adaptive interview session.

    The policy engine is the single source of truth for selecting
    the next target dimension and interview action.

    Failed and skipped turns are recorded separately from assessed
    turns. Previous valid scores are preserved when evaluation fails.
    """

    def __init__(
        self,
        candidate_id: str,
        question_id: str,
        problem: dict,
        time_remaining: int = 600,
        candidate_level: str = "medium",
        state_store: Optional[CandidateStateStore] = None,
        resume_existing: bool = True,
        max_turns: Optional[int] = None,
    ):
        if not candidate_id:
            raise ValueError("candidate_id cannot be empty.")

        if not question_id:
            raise ValueError("question_id cannot be empty.")

        if not isinstance(problem, dict):
            raise TypeError("problem must be a dictionary.")

        if max_turns is not None and max_turns <= 0:
            raise ValueError("max_turns must be greater than 0.")

        self.problem = problem
        self.time_remaining = max(0, int(time_remaining))
        self.candidate_level = candidate_level
        self.max_turns = max_turns

        self.timer_service = TimerService(
            duration_seconds=self.time_remaining
        )
        self.timer_service.start()

        self.state_store = (
            state_store
            if state_store is not None
            else CandidateStateStore()
        )

        if (
            resume_existing
            and self.state_store.exists(candidate_id, question_id)
        ):
            self.state = self.state_store.load(
                candidate_id,
                question_id,
            )
        else:
            self.state = CandidateEvaluationState(
                candidate_id=candidate_id,
                question_id=question_id,
            )

        self.policy_engine = PolicyEngine()
        self.last_turn_status = None

        if not isinstance(getattr(self.state, "history", None), list):
            self.state.history = []

        if not getattr(
            self.state,
            "current_interviewer_question",
            None,
        ):
            self.state.current_interviewer_question = (
                self._initial_question()
            )
            self.state_store.save(self.state)

        if getattr(self.state, "target_reference_id", None) is None:
            problem_id = (
                self.problem.get("problem_id")
                or self.problem.get("id")
            )

            if problem_id:
                reference_solutions, _ = load_evaluation_context(
                    self.problem
                )

                self.state.target_reference_id = (
                    self.policy_engine.select_target_reference(
                        reference_solutions
                    )
                )

                if self.state.target_reference_id is None:
                    raise RuntimeError(
                        "Unable to select a target reference solution."
                    )

                self.state_store.save(self.state)

        print(
            f"\nTarget Reference: "
            f"{getattr(self.state, 'target_reference_id', None)}"
        )

        self.finished = bool(
            self.state.history
            and not getattr(self.state, "should_continue", True)
        )

        # A restored completed session should not start a new interview.
        if not self.state.history:
            self.finished = False

    def _initial_question(self) -> str:
        title = self.problem.get("title", "")
        title = title.strip() if isinstance(title, str) else ""

        question = self.problem.get("question", "")
        question = question.strip() if isinstance(question, str) else ""

        if question:
            return question

        if title:
            return f"Please explain your approach for solving {title}."

        return "Please explain your approach for solving the problem."

    # ========================================================
    # HISTORY HELPERS
    # ========================================================

    def _append_history(
        self,
        answer: str,
        status: str,
        *,
        candidate_features: Optional[dict] = None,
        error: Optional[str] = None,
        scores: Optional[dict] = None,
        evidence: Optional[dict] = None,
    ) -> None:
        """Append one history entry without modifying earlier turns."""

        history = getattr(self.state, "history", None)

        if not isinstance(history, list):
            history = []
            self.state.history = history

        entry = {
            "turn_number": len(history) + 1,
            "candidate_answer": answer,
            "evaluation_status": status,
            "scores": dict(scores or {}),
            "primary_classification": getattr(
                self.state,
                "primary_classification",
                None,
            ),
            "evidence": dict(evidence or {}),
            "current_interviewer_question": getattr(
                self.state,
                "current_interviewer_question",
                None,
            ),
        }

        if candidate_features is not None:
            entry["nlp_state"] = dict(candidate_features)

        if error:
            entry["evaluation_error"] = error

        history.append(entry)

    def _record_non_evaluated_turn(
        self,
        answer: str,
        status: str,
    ) -> None:
        self._append_history(answer, status)
        self.last_turn_status = status
        self.state_store.save(self.state)

    # ========================================================
    # FOLLOW-UP GENERATION
    # ========================================================

    def _fallback_question(self, policy_decision: dict) -> str:
        """Generate a deterministic question for the selected dimension."""

        dimension = str(
            policy_decision.get("target_dimension") or ""
        ).strip().lower()

        action = policy_decision.get("action")

        if action == "ASK_CLARIFICATION":
            return (
                "Could you clarify your approach step by step, "
                "including how you would identify the required result?"
            )

        fallbacks = {
            "complexity": (
                "What are the time and space complexities of your "
                "approach, and how did you derive them?"
            ),
            "edge_cases": (
                "What boundary conditions could affect your solution, "
                "and how would you handle them?"
            ),
            "data_structure": (
                "Which data structure would you use for this approach, "
                "and why is it suitable?"
            ),
            "logical_reasoning": (
                "Can you explain why your approach works for all "
                "valid inputs?"
            ),
            "concept_coverage": (
                "Can you explain the key steps of your approach and "
                "how they work together?"
            ),
            "completeness": (
                "What additional implementation details are needed "
                "to make your solution complete?"
            ),
            "algorithm_correctness": (
                "Can you walk through your algorithm on a small "
                "example and explain why it produces the correct result?"
            ),
        }

        if action == "ASK_DISCOVERY":
            return (
                "Can you explain your approach and the key idea behind "
                "it, including how it differs from other possible approaches?"
            )

        return fallbacks.get(
            dimension,
            "Can you explain your reasoning in more detail?"
        )

    def _generate_policy_followup(
        self,
        policy_decision: dict,
        candidate_answer: str,
    ) -> Optional[str]:
        """
        Generate a question using the policy-selected action and dimension.

        Both canonical fields and legacy strategy fields are supplied
        to retain compatibility with the existing generator interface.
        """

        if not isinstance(policy_decision, dict):
            return None

        action = str(
            policy_decision.get("action", "")
        ).upper()

        if action == "STOP":
            return None

        supported_actions = {
            "ASK_DISCOVERY",
            "ASK_FOLLOW_UP",
            "ASK_CLARIFICATION",
            # Compatibility for callers that use this legacy action.
            "CONTINUE",
        }

        if action not in supported_actions:
            print(
                f"[WARNING] Unsupported policy action: {action}"
            )
            return None

        dimension = policy_decision.get("target_dimension")

        if action != "ASK_CLARIFICATION" and not dimension:
            print(
                "[WARNING] Policy did not provide a target dimension."
            )
            return None

        current_reference_id = getattr(
            self.state,
            "reference_answer_id",
            None,
        )
        target_reference_id = getattr(
            self.state,
            "target_reference_id",
            None,
        )

        strategy = {
            # Explicit contract for the generator.
            "action": action,
            "target_dimension": dimension,
            "goal": policy_decision.get("goal", ""),
            "difficulty": policy_decision.get("difficulty", "medium"),
            "hint_level": policy_decision.get("hint_level", 0),
            "reason": policy_decision.get("reason", ""),
            "missing_concepts": policy_decision.get(
                "missing_concepts",
                [],
            ),
            "do_not_reveal_solution": policy_decision.get(
                "do_not_reveal_solution",
                True,
            ),

            # Existing/legacy strategy fields.
            "adaptive_gap": dimension or "",
            "objective": policy_decision.get("goal", ""),
            "focus": [dimension] if dimension else [],
            "instruction": policy_decision.get("reason", ""),
            "current_reference_id": current_reference_id,
            "target_reference_id": target_reference_id,
        }

        candidate_state = (
            self.state.to_dict()
            if callable(getattr(self.state, "to_dict", None))
            else self.state
        )

        try:
            question = generate_followup_question(
                problem=self.problem,
                candidate_answer=candidate_answer,
                candidate_state=candidate_state,
                followup_strategy=strategy,
            )

            if isinstance(question, str) and question.strip():
                return question.strip()

            print(
                "[WARNING] Follow-up generator returned an empty question."
            )

        except Exception as exc:
            print(
                "[WARNING] Follow-up generation failed; "
                f"using deterministic fallback: {exc}"
            )

        return self._fallback_question(policy_decision)

    # ========================================================
    # POLICY DISPATCH
    # ========================================================

    def _get_policy_decision(self) -> dict:
        """Ask the policy engine for the next action."""

        try:
            remaining = int(
                self.timer_service.get_time_remaining()
            )
        except (TypeError, ValueError, AttributeError):
            remaining = 0

        self.time_remaining = max(0, remaining)

        current_turn = len(self.state.history)

        turns_remaining = (
            self.max_turns - current_turn
            if self.max_turns is not None
            else None
        )

        if self.time_remaining <= 0:
            return {
                "action": "STOP",
                "reason": "Interview time has ended.",
            }

        if turns_remaining is not None and turns_remaining <= 0:
            return {
                "action": "STOP",
                "reason": "Interview turn limit has been reached.",
            }

        return self.policy_engine.decide(
            scores=_extract_scores(self.state),
            time_remaining=self.time_remaining,
            candidate_level=self.candidate_level,
            candidate_state=self.state,
            turns_remaining=turns_remaining,
            current_reference_id=getattr(
                self.state,
                "reference_answer_id",
                None,
            ),
            target_reference_id=getattr(
                self.state,
                "target_reference_id",
                None,
            ),
            reference_match_confidence=getattr(
                self.state,
                "reference_match_confidence",
                None,
            ),
        )

    def _apply_next_policy_action(
        self,
        candidate_answer: str,
    ) -> None:
        """
        Choose the next question after a completed, skipped, or failed
        turn. All paths use the same policy dispatch.
        """

        try:
            policy_decision = self._get_policy_decision()
        except Exception as exc:
            print(
                f"[ERROR] Policy engine failed: {exc}"
            )
            self.state.should_continue = False
            self.finished = True
            self.state_store.save(self.state)
            return

        print("\nPolicy Decision:")
        print(policy_decision)

        if policy_decision.get("action") == "STOP":
            self.state.should_continue = False
            self.finished = True
            self.state_store.save(self.state)
            print(
                "\nInterview finished: "
                f"{policy_decision.get('reason', 'Policy selected STOP.')}"
            )
            return

        next_question = self._generate_policy_followup(
            policy_decision=policy_decision,
            candidate_answer=candidate_answer,
        )

        if not next_question:
            self.state.should_continue = False
            self.finished = True
            self.state_store.save(self.state)
            print(
                "\nInterview stopped because a valid next question "
                "could not be generated."
            )
            return

        self.state.set_interviewer_question(next_question)
        self.state.should_continue = True
        self.finished = False

        saved_path = self.state_store.save(self.state)
        print(f"\nState saved: {saved_path}")
        print("\nNEXT QUESTION")
        print(next_question)

    # ========================================================
    # SUBMIT ANSWER
    # ========================================================

    def submit_answer(
        self,
        candidate_answer: str,
        candidate_features: Optional[dict] = None,
    ) -> CandidateEvaluationState:
        if self.finished:
            raise RuntimeError(
                "Interview session has already finished."
            )

        if not isinstance(candidate_answer, str):
            raise TypeError(
                "Candidate answer must be a string."
            )

        candidate_answer = candidate_answer.strip()

        if not candidate_answer:
            raise ValueError(
                "Candidate answer cannot be empty."
            )

        current_turn = len(self.state.history) + 1

        print()
        print("=" * 60)
        print(f"TURN {current_turn}".center(60))
        print("=" * 60)

        _print_candidate_answer(candidate_answer)

        # ----------------------------------------------------
        # 1. Explicit exit command.
        # ----------------------------------------------------

        if _is_exit_command(candidate_answer):
            self._record_non_evaluated_turn(
                candidate_answer,
                "exit_requested",
            )
            self.state.should_continue = False
            self.finished = True
            self.state_store.save(self.state)

            print("\nInterview ended at the candidate's request.")
            return self.state

        # ----------------------------------------------------
        # 2. Skip command.
        #
        # Unlike the old controller, a skip does not leave the same
        # question active indefinitely. It records the skip and asks
        # the policy engine to choose the next action.
        # ----------------------------------------------------

        if _is_skip_command(candidate_answer):
            self._record_non_evaluated_turn(
                candidate_answer,
                "skipped",
            )

            print("\nCandidate response recorded as skipped.")
            self._apply_next_policy_action(candidate_answer)
            return self.state

        # ----------------------------------------------------
        # 3. Preserve the last valid state for failure recovery.
        # ----------------------------------------------------

        previous_scores = _extract_scores(self.state)
        previous_evidence = _extract_evidence(self.state)
        previous_classification = getattr(
            self.state,
            "primary_classification",
            None,
        )
        previous_reference_id = getattr(
            self.state,
            "reference_answer_id",
            None,
        )
        previous_confidence = getattr(
            self.state,
            "reference_match_confidence",
            None,
        )
        previous_nlp_state = getattr(
            self.state,
            "nlp_state",
            None,
        )

        # ----------------------------------------------------
        # 4. Extract current-turn features.
        # ----------------------------------------------------

        try:
            if candidate_features is None:
                candidate_features = extract_candidate_features(
                    candidate_answer,
                    self.problem,
                )

            if not isinstance(candidate_features, dict):
                raise TypeError(
                    "candidate_features must be a dictionary."
                )

            candidate_features = dict(candidate_features)

            candidate_features["time_complexity"] = (
                _normalize_complexity(
                    candidate_features.get("time_complexity")
                )
            )
            candidate_features["space_complexity"] = (
                _normalize_complexity(
                    candidate_features.get("space_complexity")
                )
            )

            _print_nlp_extraction(candidate_features)

            current_nlp_state = self._build_nlp_state(
                candidate_features
            )

        except Exception as exc:
            print(
                f"\n[WARNING] NLP extraction failed: {exc}"
            )

            self._append_history(
                candidate_answer,
                "failed",
                error=f"NLP extraction failed: {exc}",
            )

            self.last_turn_status = "failed"
            self.state_store.save(self.state)

            # Recovery uses the existing valid scores and policy.
            self._apply_next_policy_action(candidate_answer)
            return self.state

        # ----------------------------------------------------
        # 5. Evaluate this answer.
        # ----------------------------------------------------

        try:
            self.state.update_nlp_state(current_nlp_state)

            evaluated_state = evaluate_candidate_turn(
                state=self.state,
                candidate_answer=candidate_answer,
                problem=self.problem,
                candidate_features=candidate_features,
            )

            if evaluated_state is None:
                raise RuntimeError(
                    "Evaluation returned no candidate state."
                )

            new_scores = _extract_scores(evaluated_state)
            new_evidence = _extract_evidence(evaluated_state)

            has_valid_score = any(
                _is_score(value)
                or (
                    isinstance(value, dict)
                    and _is_score(value.get("score"))
                )
                for value in new_scores.values()
            )

            evaluated_state.scores = _merge_scores(
                previous_scores,
                new_scores,
            )

            merged_evidence = dict(previous_evidence)

            for dimension, evidence_value in new_evidence.items():
                if evidence_value is None:
                    continue

                if isinstance(evidence_value, str):
                    evidence_text = evidence_value.strip()

                    if (
                        not evidence_text
                        or evidence_text
                        == "The evaluation could not be completed."
                    ):
                        continue

                merged_evidence[dimension] = evidence_value

            evaluated_state.evidence = merged_evidence

            if getattr(
                evaluated_state,
                "primary_classification",
                None,
            ) is None:
                evaluated_state.primary_classification = (
                    previous_classification
                )

            if getattr(
                evaluated_state,
                "reference_answer_id",
                None,
            ) is None:
                evaluated_state.reference_answer_id = (
                    previous_reference_id
                )

            if getattr(
                evaluated_state,
                "reference_match_confidence",
                None,
            ) is None:
                evaluated_state.reference_match_confidence = (
                    previous_confidence
                )

            evaluated_state.nlp_state = current_nlp_state
            self.state = evaluated_state

            # ------------------------------------------------
            # 6. Record exactly one history entry for this answer.
            # ------------------------------------------------

            history = getattr(self.state, "history", None)

            if not isinstance(history, list):
                history = []
                self.state.history = history

            if (
                history
                and isinstance(history[-1], dict)
                and history[-1].get("candidate_answer")
                == candidate_answer
            ):
                history[-1]["evaluation_status"] = (
                    "assessed" if has_valid_score else "unassessed"
                )
                history[-1]["scores"] = dict(new_scores)
                history[-1]["evidence"] = dict(new_evidence)
                history[-1]["nlp_state"] = dict(candidate_features)
            else:
                self._append_history(
                    candidate_answer,
                    "assessed" if has_valid_score else "unassessed",
                    candidate_features=candidate_features,
                    scores=new_scores,
                    evidence=new_evidence,
                )

            self.last_turn_status = (
                "assessed" if has_valid_score else "unassessed"
            )
            self.state_store.save(self.state)

        except Exception as exc:
            print(
                "[WARNING] Evaluation failed. "
                f"Preserving previous valid scores: {exc}"
            )

            self.state.scores = previous_scores
            self.state.evidence = previous_evidence
            self.state.primary_classification = previous_classification
            self.state.reference_answer_id = previous_reference_id
            self.state.reference_match_confidence = previous_confidence

            if previous_nlp_state is not None:
                self.state.nlp_state = previous_nlp_state

            self._append_history(
                candidate_answer,
                "failed",
                candidate_features=candidate_features,
                error=str(exc),
            )

            self.last_turn_status = "failed"
            self.state_store.save(self.state)

            # Failed evaluations no longer return without advancing.
            self._apply_next_policy_action(candidate_answer)
            return self.state

        # ----------------------------------------------------
        # 7. Select the next action using the policy engine.
        # ----------------------------------------------------

        self._apply_next_policy_action(candidate_answer)
        return self.state

    # ========================================================
    # NLP STATE MAPPING
    # ========================================================

    @staticmethod
    def _build_nlp_state(
        candidate_features: dict,
    ) -> CandidateNLPState:
        return CandidateNLPState(
            approach=candidate_features.get("approach"),
            algorithms=list(candidate_features.get("algorithms") or []),
            concepts=list(candidate_features.get("concepts") or []),
            operations=list(candidate_features.get("operations") or []),
            data_structures=list(
                candidate_features.get("data_structures") or []
            ),
            time_complexity=_normalize_complexity(
                candidate_features.get("time_complexity")
            ),
            space_complexity=_normalize_complexity(
                candidate_features.get("space_complexity")
            ),
            edge_cases=list(candidate_features.get("edge_cases") or []),
            assumptions=list(candidate_features.get("assumptions") or []),
            reasoning_summary=candidate_features.get(
                "reasoning_summary"
            ),
            optimization=candidate_features.get("optimization"),
        )

    # ========================================================
    # STATE HELPERS
    # ========================================================

    def load_saved_state(self) -> CandidateEvaluationState:
        self.state = self.state_store.load(
            candidate_id=self.state.candidate_id,
            question_id=self.state.question_id,
        )
        return self.state

    def reload_state(self) -> CandidateEvaluationState:
        return self.load_saved_state()

    def save_state(self) -> str:
        return self.state_store.save(self.state)

    def get_next_question(self):
        if self.finished:
            return None

        return self.state.current_interviewer_question

    def is_finished(self) -> bool:
        return self.finished

    def get_state(self) -> CandidateEvaluationState:
        return self.state

    def get_final_state(self) -> CandidateEvaluationState:
        if not self.finished:
            raise RuntimeError(
                "Interview is still in progress."
            )

        return self.state

    def get_final_result(self) -> dict:
        if not self.finished:
            raise RuntimeError(
                "Cannot generate final result while interview is in progress."
            )

        return build_final_result(self.state)
