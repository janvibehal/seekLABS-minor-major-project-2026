from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any, Optional


def _merge_unique(
    existing: list[str],
    new_values: list[str],
) -> list[str]:
    """Merge two string lists while preserving order and removing duplicates."""
    result = list(existing)

    for value in new_values:
        if value and value not in result:
            result.append(value)

    return result


@dataclass
class CandidateNLPState:
    """
    Structured NLP representation of what the candidate has communicated.

    Exactly 11 NLP fields are maintained here.
    """

    approach: Optional[str] = None
    algorithms: list[str] = field(default_factory=list)
    concepts: list[str] = field(default_factory=list)
    operations: list[str] = field(default_factory=list)
    data_structures: list[str] = field(default_factory=list)
    time_complexity: Optional[str] = None
    space_complexity: Optional[str] = None
    edge_cases: list[str] = field(default_factory=list)
    reasoning_summary: Optional[str] = None
    assumptions: list[str] = field(default_factory=list)
    optimization: Optional[bool] = None

    def to_dict(self) -> dict[str, Any]:
        """Convert NLP state to a dictionary."""
        return asdict(self)

    @classmethod
    def from_dict(
        cls,
        data: Optional[dict[str, Any]],
    ) -> "CandidateNLPState":
        """Create NLP state from a dictionary."""
        if not data:
            return cls()

        optimization = data.get("optimization")

        if optimization is not None and not isinstance(optimization, bool):
            # Tolerate legacy persisted state saved before this fix,
            # where optimization was coerced to the string "True"/"False".
            optimization = str(optimization).strip().casefold() == "true"

        return cls(
            approach=data.get("approach"),
            algorithms=list(
                data.get("algorithms") or []
            ),
            concepts=list(
                data.get("concepts") or []
            ),
            operations=list(
                data.get("operations") or []
            ),
            data_structures=list(
                data.get("data_structures") or []
            ),
            time_complexity=data.get(
                "time_complexity"
            ),
            space_complexity=data.get(
                "space_complexity"
            ),
            edge_cases=list(
                data.get("edge_cases") or []
            ),
            reasoning_summary=data.get(
                "reasoning_summary"
            ),
            assumptions=list(
                data.get("assumptions") or []
            ),
            optimization=optimization,
        )

    def merge(
        self,
        new_state: "CandidateNLPState",
    ) -> None:
        """
        Merge newly extracted NLP information
        into the existing state.
        """

        if new_state.approach:
            self.approach = new_state.approach

        self.algorithms = _merge_unique(
            self.algorithms,
            new_state.algorithms,
        )

        self.concepts = _merge_unique(
            self.concepts,
            new_state.concepts,
        )

        self.operations = _merge_unique(
            self.operations,
            new_state.operations,
        )

        self.data_structures = _merge_unique(
            self.data_structures,
            new_state.data_structures,
        )

        self.edge_cases = _merge_unique(
            self.edge_cases,
            new_state.edge_cases,
        )

        self.assumptions = _merge_unique(
            self.assumptions,
            new_state.assumptions,
        )

        if new_state.time_complexity is not None:
            self.time_complexity = (
                new_state.time_complexity
            )

        if new_state.space_complexity is not None:
            self.space_complexity = (
                new_state.space_complexity
            )

        if new_state.reasoning_summary:
            if not self.reasoning_summary:
                self.reasoning_summary = (
                    new_state.reasoning_summary
                )
            elif (
                new_state.reasoning_summary
                != self.reasoning_summary
            ):
                self.reasoning_summary = (
                    f"{self.reasoning_summary} "
                    f"{new_state.reasoning_summary}"
                )

        if new_state.optimization is not None:
            self.optimization = (
                new_state.optimization
            )


@dataclass
class CandidateEvaluationState:
    """
    Complete evaluation state for a candidate's current question.
    """

    candidate_id: str
    question_id: str

    # Current reference identified by the Reference Matcher.
    reference_answer_id: Optional[str] = None

    # Confidence of the current reference match.
    reference_match_confidence: Optional[float] = None

    # Target reference selected by the adaptive/policy logic.
    target_reference_id: Optional[str] = None

    current_answer: Optional[str] = None

    nlp_state: CandidateNLPState = field(
        default_factory=CandidateNLPState
    )

    scores: dict[str, Optional[float]] = field(
        default_factory=dict
    )

    primary_classification: Optional[str] = None
    secondary_classification: Optional[str] = None

    adaptive_classifications: list[Any] = field(
        default_factory=list
    )

    primary_adaptive_gap: Optional[str] = None

    evidence: dict[str, Optional[str]] = field(
        default_factory=dict
    )

    history: list[dict[str, Any]] = field(
        default_factory=list
    )

    current_interviewer_question: Optional[str] = None

    should_continue: bool = False

    @property
    def turn_number(self) -> int:
        """Return the current interview turn number."""
        return len(self.history) + 1

    def update_nlp_state(
        self,
        new_nlp_state: CandidateNLPState,
    ) -> None:
        """Merge newly extracted NLP information."""
        self.nlp_state.merge(new_nlp_state)

    def set_interviewer_question(
        self,
        question: str,
    ) -> None:
        """Store the current interviewer question."""
        self.current_interviewer_question = question

    def get_previous_questions(self) -> list[str]:
        """Return stored interviewer questions, including the current question."""
        questions = [
            item["current_interviewer_question"]
            for item in self.history
            if item.get("current_interviewer_question")
        ]

        if (
            self.current_interviewer_question
            and self.current_interviewer_question not in questions
        ):
            questions.append(
                self.current_interviewer_question
            )

        return questions

    def update(
        self,
        candidate_answer: Optional[str] = None,
        scores: Optional[
            dict[str, Optional[float]]
        ] = None,
        primary_classification: Optional[str] = None,
        secondary_classification: Optional[str] = None,
        adaptive_classifications: Optional[list[Any]] = None,
        primary_adaptive_gap: Optional[str] = None,
        evidence: Optional[
            dict[str, Optional[str]]
        ] = None,
        interviewer_question: Optional[str] = None,
    ) -> None:
        """Update evaluation state and record a history snapshot."""

        if candidate_answer is not None:
            self.current_answer = candidate_answer

        if scores is not None:
            self.scores = scores

        if primary_classification is not None:
            self.primary_classification = (
                primary_classification
            )

        if secondary_classification is not None:
            self.secondary_classification = (
                secondary_classification
            )

        if adaptive_classifications is not None:
            self.adaptive_classifications = (
                adaptive_classifications
            )

        if primary_adaptive_gap is not None:
            self.primary_adaptive_gap = (
                primary_adaptive_gap
            )

        if evidence is not None:
            self.evidence = evidence

        if interviewer_question is not None:
            self.current_interviewer_question = (
                interviewer_question
            )

        self.history.append(
            {
                "turn_number": self.turn_number,
                "candidate_answer": self.current_answer,

                "reference_answer_id": (
                    self.reference_answer_id
                ),

                "reference_match_confidence": (
                    self.reference_match_confidence
                ),

                "target_reference_id": (
                    self.target_reference_id
                ),
                "scores": dict(self.scores),
                "primary_classification": (
                    self.primary_classification
                ),
                "secondary_classification": (
                    self.secondary_classification
                ),
                "adaptive_classifications": list(
                    self.adaptive_classifications
                ),
                "primary_adaptive_gap": (
                    self.primary_adaptive_gap
                ),
                "evidence": dict(self.evidence),
                "current_interviewer_question": (
                    self.current_interviewer_question
                ),
                "nlp_state": self.nlp_state.to_dict(),
            }
        )

    def to_dict(self) -> dict[str, Any]:
        """Convert complete evaluation state to a dictionary."""
        return asdict(self)

    @classmethod
    def from_dict(
        cls,
        data: dict[str, Any],
    ) -> "CandidateEvaluationState":
        """Create evaluation state from a dictionary."""

        #marker
        return cls(
            candidate_id=data["candidate_id"],
            question_id=data["question_id"],
            reference_answer_id=data.get(
                "reference_answer_id"
            ),
            reference_match_confidence=data.get(
                "reference_match_confidence"
            ),
            target_reference_id=data.get(
                "target_reference_id"
            ),
            current_answer=data.get(
                "current_answer",
                data.get("candidate_answer")
            ),
            nlp_state=CandidateNLPState.from_dict(
                data.get("nlp_state")
            ),
            scores=dict(
                data.get("scores") or {}
            ),
            primary_classification=data.get(
                "primary_classification"
            ),
            secondary_classification=data.get(
                "secondary_classification"
            ),
            adaptive_classifications=list(
                data.get(
                    "adaptive_classifications"
                ) or []
            ),
            primary_adaptive_gap=data.get(
                "primary_adaptive_gap"
            ),
            evidence=dict(
                data.get("evidence") or {}
            ),
            history=list(
                data.get("history") or []
            ),
            current_interviewer_question=data.get(
                "current_interviewer_question"
            ),
            should_continue=bool(
                data.get(
                    "should_continue",
                    False,
                )
            ),
        )