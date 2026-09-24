from typing import Optional

from AI.evaluation.extraction.extraction_service import (
    extract_candidate_features
)

from AI.evaluation.persistence.candidate_state_store import (
    CandidateStateStore
)

from AI.adaptive.policy_engine import PolicyEngine
from AI.evaluation.scoring.candidate_state import (
    CandidateEvaluationState,
    CandidateNLPState
)

from AI.evaluation.scoring.evaluation_orchestrator import (
    evaluate_candidate_turn
)

from AI.evaluation.scoring.final_result import (
    build_final_result
)

from AI.evaluation.interviewer.followup_generator import (
    generate_followup_question
)

from AI.conversation.timer_service import TimerService

from AI.evaluation.dataset_loader import (
    load_evaluation_context
)


# ============================================================
# DIAGNOSTIC HELPERS
# ============================================================

def _print_section(title: str):
    print()
    print(title)
    print("-" * len(title))


def _display(value):
    if value is None:
        return "Not identified"

    if isinstance(value, list):

        values = [
            str(item).strip()
            for item in value
            if str(item).strip()
        ]

        return (
            ", ".join(values)
            if values
            else "None identified"
        )

    value = str(value).strip()

    return (
        value
        if value
        else "Not identified"
    )


def _print_candidate_answer(
    candidate_answer: str
):
    _print_section(
        "CANDIDATE ANSWER"
    )

    print(
        candidate_answer
    )


def _print_nlp_extraction(
    candidate_features: dict
):
    _print_section(
        "NLP EXTRACTION"
    )

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

        print(
            f"{label:<24}: "
            f"{_display(candidate_features.get(key))}"
        )


# ============================================================
# INTERVIEW SESSION
# ============================================================

class InterviewSession:
    """
    Controls one complete adaptive interview session.

    Pipeline:

        Candidate Answer
              |
              v
        LLM NLP Extraction
              |
              v
        CandidateNLPState
              |
              v
        CandidateEvaluationState
              |
              v
        SAVE NLP STATE
              |
              v
        Evaluation Engine
              |
              v
        SAVE EVALUATION STATE
              |
              v
        Adaptive Policy
              |
              v
        Follow-Up / Finish

    Semantic NLP extraction is performed only by the LLM extractor.
    This class does not perform regex, keyword, rule-based,
    or heuristic semantic extraction.
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
    max_turns: Optional[int] = None
    ):
        if not candidate_id:
            raise ValueError(
                "candidate_id cannot be empty."
            )

        if not question_id:
            raise ValueError(
                "question_id cannot be empty."
            )

        if not isinstance(
            problem,
            dict
        ):
            raise TypeError(
                "problem must be a dictionary."
            )

        self.problem = problem
        self.time_remaining = time_remaining
        self.candidate_level = candidate_level

        if max_turns is not None and max_turns <= 0:
            raise ValueError(
                "max_turns must be greater than 0."
            )

        self.max_turns = max_turns

        self.timer_service = TimerService(
            duration_seconds=time_remaining
        )
        self.timer_service.start()

        self.state_store = (
            state_store
            if state_store is not None
            else CandidateStateStore()
        )

        if (
            resume_existing
            and self.state_store.exists(
                candidate_id,
                question_id
            )
        ):
            self.state = (
                self.state_store.load(
                    candidate_id,
                    question_id
                )
            )
        else:
            self.state = (
                CandidateEvaluationState(
                    candidate_id=candidate_id,
                    question_id=question_id
                )
            )

        self.policy_engine = (
            PolicyEngine()
        )

        # ---------------------------------------------------------
        # INITIAL INTERVIEWER QUESTION
        # ---------------------------------------------------------

        if self.state.current_interviewer_question is None:

            problem_title = self.problem.get(
                "title",
                ""
            ).strip()

            problem_question = self.problem.get(
                "question",
                ""
            )

            if isinstance(problem_question, str):
                problem_question = problem_question.strip()
            else:
                problem_question = ""

            if problem_question:
                self.state.current_interviewer_question = problem_question

            elif problem_title:
                self.state.current_interviewer_question = (
                    f"Please explain your approach for solving "
                    f"{problem_title}."
                )

            else:
                self.state.current_interviewer_question = (
                    "Please explain your approach for solving "
                    "the problem."
                )

            self.state_store.save(self.state)

        # ==================================================
        # SELECT CANONICAL TARGET REFERENCE
        # ==================================================
        #
        # Target selection is performed only when the
        # problem contains an identifier that can be used
        # by the reference-solution dataset.
        #
        # This keeps lightweight Conversation/Timer tests
        # independent of the reference dataset.

        if self.state.target_reference_id is None:

            problem_id = (
                self.problem.get("problem_id")
                or self.problem.get("id")
            )

            if problem_id:

                reference_solutions, _ = (
                    load_evaluation_context(
                        self.problem
                    )
                )

                self.state.target_reference_id = (
                    self.policy_engine.select_target_reference(
                        reference_solutions
                    )
                )

                if self.state.target_reference_id is None:
                    raise RuntimeError(
                        "Unable to select a target reference "
                        "solution for this problem."
                    )

                self.state_store.save(
                    self.state
                )

        print()
        print(
            f"Target Reference: "
            f"{self.state.target_reference_id}"
        )

        # ---------------------------------------------------------
        # SESSION COMPLETION STATE
        # ---------------------------------------------------------
        #
        # A brand-new session has no completed candidate turns,
        # so it must remain active even if should_continue has
        # a default false-like value.
        #
        # A resumed session with existing history and
        # should_continue=False represents a completed interview.

        self.finished = bool(
            self.state.history
            and not self.state.should_continue
        )

    # ========================================================
    # POLICY FOLLOW-UP GENERATION
    # ========================================================

    def _generate_policy_followup(
        self,
        policy_decision: dict,
        candidate_answer: str
    ) -> Optional[str]:
        """
        Convert the PolicyEngine decision into the
        follow-up strategy format expected by the
        existing follow-up generator.

        PolicyEngine remains responsible for deciding
        WHAT should be asked.

        Follow-up generator is responsible only for
        converting that decision into natural language.
        """

        if not isinstance(
            policy_decision,
            dict
        ):
            return None

        action = policy_decision.get(
            "action"
        )

        if action == "STOP":
            return None

        strategy = {
            "adaptive_gap": policy_decision.get(
                "target_dimension",
                ""
            ),

            "objective": policy_decision.get(
                "goal",
                ""
            ),

            "focus": [
                policy_decision.get(
                    "target_dimension"
                )
            ]
            if policy_decision.get(
                "target_dimension"
            )
            else [],

            "instruction": policy_decision.get(
                "reason",
                ""
            ),

            "current_reference_id": (
                self.state.reference_answer_id
            ),

            "target_reference_id": (
                self.state.target_reference_id
            )
        }

        # CandidateEvaluationState is converted
        # into the dictionary format expected by
        # generate_followup_question().
        if hasattr(
            self.state,
            "to_dict"
        ):
            candidate_state = (
                self.state.to_dict()
            )
        else:
            candidate_state = self.state

        return generate_followup_question(
            problem=self.problem,
            candidate_answer=candidate_answer,
            candidate_state=candidate_state,
            followup_strategy=strategy
        )

    # ========================================================
    # SUBMIT ANSWER
    # ========================================================

    def submit_answer(
        self,
        candidate_answer: str,
        candidate_features: Optional[dict] = None
    ) -> CandidateEvaluationState:
        """
        Submit one candidate answer.

        If candidate_features is omitted, the LLM extraction
        service performs semantic extraction.

        The extracted information is converted into
        CandidateNLPState and merged into the existing
        CandidateEvaluationState.

        The accumulated state is persisted BEFORE evaluation.
        """

        if self.finished:
            raise RuntimeError(
                "Interview session has already finished."
            )

        if not isinstance(
            candidate_answer,
            str
        ):
            raise TypeError(
                "Candidate answer must be a string."
            )

        candidate_answer = (
            candidate_answer.strip()
        )

        if not candidate_answer:
            raise ValueError(
                "Candidate answer cannot be empty."
            )

        current_turn = (
            len(self.state.history) + 1
        )

        turns_remaining = None

        if self.max_turns is not None:
            turns_remaining = (
                self.max_turns - current_turn
            )

        print()
        print("=" * 60)
        print(
            f"TURN {current_turn}"
            .center(60)
        )
        print("=" * 60)

        # ====================================================
        # 1. CANDIDATE ANSWER
        # ====================================================

        _print_candidate_answer(
            candidate_answer
        )

        # ====================================================
        # 2. LLM NLP EXTRACTION
        # ====================================================

        if candidate_features is None:

            candidate_features = (
                extract_candidate_features(
                    candidate_answer,
                    self.problem
                )
            )

        if not isinstance(
            candidate_features,
            dict
        ):
            raise TypeError(
                "candidate_features must be a dictionary."
            )

        _print_nlp_extraction(
            candidate_features
        )

        # ====================================================
        # 3. BUILD AND SAVE NLP STATE
        # ====================================================

        nlp_state = self._build_nlp_state(
            candidate_features
        )

        self.state.update_nlp_state(
            nlp_state
        )

        nlp_path = (
            self.state_store.save(
                self.state
            )
        )

        print()
        print(
            f"NLP state saved: {nlp_path}"
        )

        # ====================================================
        # 4. EVALUATION
        # ====================================================

        self.state = (
            evaluate_candidate_turn(
                state=self.state,
                candidate_answer=candidate_answer,
                problem=self.problem,
                candidate_features=candidate_features
            )
        )

        # ====================================================
        # 5. SAVE COMPLETE STATE
        # ====================================================

        evaluation_path = (
            self.state_store.save(
                self.state
            )
        )

        print()
        print(
            f"Evaluation state saved: "
            f"{evaluation_path}"
        )

        # ----------------------------------------------------
        # 6. ADAPTIVE POLICY
        # ----------------------------------------------------

        self.time_remaining = (
            self.timer_service.get_time_remaining()
        )

        # Hard safety limits are enforced by the
        # Conversation layer. The PolicyEngine decides
        # the adaptive action only when another turn is
        # actually possible.

        turn_limit_reached = (
            self.max_turns is not None
            and current_turn >= self.max_turns
        )

        time_limit_reached = (
            self.time_remaining <= 0
        )

        if turn_limit_reached or time_limit_reached:

            policy_decision = {
                "action": "STOP",
                "reason": (
                    "Interview limit reached."
                )
            }

        else:

            policy_decision = (
                self.policy_engine.decide(
                    scores=self.state.scores,
                    time_remaining=self.time_remaining,
                    candidate_level=self.candidate_level,
                    candidate_state=self.state,
                    turns_remaining=turns_remaining,
                    current_reference_id=(
                        self.state.reference_answer_id
                    ),
                    target_reference_id=(
                        self.state.target_reference_id
                    ),
                    reference_match_confidence=self.state.reference_match_confidence,
                )
            )

        # ----------------------------------------------------
        # TARGET-REFERENCE SAFEGUARD
        # ----------------------------------------------------
        #
        # Reaching the target reference does NOT mean the
        # interview can finish if an evaluation dimension
        # is still unassessed.
        #
        # The production state can contain scores in either
        # of these forms:
        #
        #   dimension -> numeric score
        #
        # or:
        #
        #   dimension -> {
        #       "score": numeric score,
        #       "assessment_status": "ASSESSED"
        #   }
        #
        # Therefore both formats are handled here.
        #
        # Example:
        #
        #   algorithm_correctness = 100
        #   logical_reasoning    = 85
        #   concept_coverage     = 90
        #   completeness         = 80
        #   data_structure       = 100
        #   complexity           = 100
        #   edge_cases           = None
        #
        # The interview must continue in this situation so
        # the candidate can answer the generated edge-case
        # follow-up question.
        #
        # Hard limits above remain authoritative and are
        # never overridden by this safeguard.
        # ----------------------------------------------------

        if policy_decision.get(
            "action"
        ) == "STOP":

            stop_reason = str(
                policy_decision.get(
                    "reason",
                    ""
                )
            ).lower()

            target_reached_stop = (
                "target reference" in stop_reason
                or "reached the target" in stop_reason
                or "target reference solution" in stop_reason
            )

            unassessed_dimensions = []

            if isinstance(
                self.state.scores,
                dict
            ):

                for dimension, score_data in (
                    self.state.scores.items()
                ):

                    # ----------------------------------------
                    # Numeric score representation:
                    #
                    # dimension -> 100.0
                    # dimension -> None
                    # ----------------------------------------

                    if score_data is None:

                        unassessed_dimensions.append(
                            dimension
                        )

                        continue

                    if isinstance(
                        score_data,
                        (int, float)
                    ):

                        continue

                    # ----------------------------------------
                    # Dictionary score representation:
                    #
                    # dimension -> {
                    #     "score": ...,
                    #     "assessment_status": ...
                    # }
                    # ----------------------------------------

                    if isinstance(
                        score_data,
                        dict
                    ):

                        assessment_status = (
                            score_data.get(
                                "assessment_status"
                            )
                        )

                        score = score_data.get(
                            "score"
                        )

                        if (
                            assessment_status
                            == "NOT_ASSESSED"
                            or score is None
                        ):

                            unassessed_dimensions.append(
                                dimension
                            )

                        continue

                    # ----------------------------------------
                    # Unknown score representation.
                    # Treat it as unassessed instead of
                    # incorrectly considering the dimension
                    # complete.
                    # ----------------------------------------

                    unassessed_dimensions.append(
                        dimension
                    )

            if (
                target_reached_stop
                and unassessed_dimensions
            ):

                next_dimension = (
                    unassessed_dimensions[0]
                )

                policy_decision = {
                    **policy_decision,
                    "action": "CONTINUE",
                    "target_dimension": (
                        next_dimension
                    ),
                    "goal": (
                        "Assess the candidate's "
                        f"{next_dimension.replace('_', ' ')}."
                    ),
                    "reason": (
                        "Target reference reached, but "
                        "one or more evaluation dimensions "
                        "remain unassessed."
                    ),
                }

        print()
        print("Policy Decision:")
        print(policy_decision)

        # PolicyEngine is authoritative for normal STOP/CONTINUE
        # decisions. The only exception is the safeguard above:
        # reaching the target reference cannot finish an interview
        # while required evaluation dimensions remain unassessed.

        if policy_decision.get(
            "action"
        ) == "STOP":

            self.state.should_continue = False
            self.finished = True

        else:

            self.state.should_continue = True

            next_question = (
                self._generate_policy_followup(
                    policy_decision=policy_decision,
                    candidate_answer=candidate_answer
                )
            )

            if next_question:

                self.state.set_interviewer_question(
                    next_question
                )

                print()
                print(
                    "Next Interviewer Question:"
                )
                print(
                    next_question
                )

            else:

                # If the follow-up generator cannot produce
                # a valid question, fail closed rather than
                # leaving the interview in a continuation
                # state with no question.

                self.state.should_continue = False
                self.finished = True

        # ----------------------------------------------------
        # PERSIST FINAL TURN STATE
        # ----------------------------------------------------
        #
        # This save happens AFTER policy/follow-up processing
        # so that:
        #
        # - should_continue
        # - finished-related state
        # - current interviewer question
        # - conversation history
        #
        # are persisted together.

        final_state_path = (
            self.state_store.save(
                self.state
            )
        )

        print()
        print(
            f"Final turn state saved: "
            f"{final_state_path}"
        )

        # ====================================================
        # 7. FINISH / CONTINUE
        # ====================================================

        if not self.state.should_continue:

            self.finished = True

            print()
            print(
                f"INTERVIEW FINISHED — TURN {current_turn}"
            )

        else:

            print()
            print(
                f"TURN {current_turn} COMPLETE"
            )

            if self.state.current_interviewer_question:

                print()
                print(
                    "NEXT QUESTION"
                )
                print(
                    self.state.current_interviewer_question
                )

        return self.state

    # ========================================================
    # NLP STATE MAPPING
    # ========================================================

    @staticmethod
    def _build_nlp_state(
        candidate_features: dict
    ) -> CandidateNLPState:
        """
        Convert the LLM extractor's dictionary into
        CandidateNLPState.

        No semantic extraction occurs here.

        This method performs only structural mapping.
        """

        return CandidateNLPState(
            approach=candidate_features.get(
                "approach"
            ),

            algorithms=list(
                candidate_features.get(
                    "algorithms"
                ) or []
            ),

            concepts=list(
                candidate_features.get(
                    "concepts"
                ) or []
            ),

            operations=list(
                candidate_features.get(
                    "operations"
                ) or []
            ),

            data_structures=list(
                candidate_features.get(
                    "data_structures"
                ) or []
            ),

            time_complexity=candidate_features.get(
                "time_complexity"
            ),

            space_complexity=candidate_features.get(
                "space_complexity"
            ),

            edge_cases=list(
                candidate_features.get(
                    "edge_cases"
                ) or []
            ),

            assumptions=list(
                candidate_features.get(
                    "assumptions"
                ) or []
            ),

            reasoning_summary=candidate_features.get(
                "reasoning_summary"
            ),

            optimization=candidate_features.get(
                "optimization"
            )
        )

    # ========================================================
    # LOAD SAVED STATE
    # ========================================================

    def load_saved_state(
        self
    ) -> CandidateEvaluationState:

        self.state = (
            self.state_store.load(
                candidate_id=self.state.candidate_id,
                question_id=self.state.question_id
            )
        )

        return self.state

    # ========================================================
    # RELOAD STATE
    # ========================================================

    def reload_state(
        self
    ) -> CandidateEvaluationState:

        return self.load_saved_state()

    # ========================================================
    # FORCE SAVE
    # ========================================================

    def save_state(
        self
    ) -> str:

        return self.state_store.save(
            self.state
        )

    # ========================================================
    # NEXT QUESTION
    # ========================================================

    def get_next_question(
        self
    ):

        if self.finished:
            return None

        return (
            self.state.current_interviewer_question
        )

    # ========================================================
    # FINISHED
    # ========================================================

    def is_finished(
        self
    ) -> bool:

        return self.finished

    # ========================================================
    # CURRENT STATE
    # ========================================================

    def get_state(
        self
    ) -> CandidateEvaluationState:

        return self.state

    # ========================================================
    # FINAL STATE
    # ========================================================

    def get_final_state(
        self
    ) -> CandidateEvaluationState:

        if not self.finished:
            raise RuntimeError(
                "Interview is still in progress."
            )

        return self.state

    # ========================================================
    # FINAL RESULT
    # ========================================================

    def get_final_result(
        self
    ) -> dict:

        if not self.finished:
            raise RuntimeError(
                "Cannot generate final result while "
                "the interview is still in progress."
            )

        return build_final_result(
            self.state
        )