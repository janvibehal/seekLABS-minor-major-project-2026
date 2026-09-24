from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class ConversationState:
    """
    Stores the complete state of one candidate conversation.
    """

    session_id: str
    question: Optional[dict[str, Any]] = None

    candidate_responses: list[dict[str, Any]] = field(default_factory=list)
    evaluation_results: list[dict[str, Any]] = field(default_factory=list)

    current_score: float = 0.0
    candidate_state: dict[str, Any] = field(default_factory=dict)

    questions_asked: list[dict[str, Any]] = field(default_factory=list)
    hints_given: list[dict[str, Any]] = field(default_factory=list)

    time_remaining: int = 0

    final_evaluation: Optional[dict[str, Any]] = None

    status: str = "active"


class ConversationManager:
    """
    Manages the state and history of a candidate's conversation.

    This class does not:
    - evaluate candidate answers
    - decide the next action
    - generate questions
    - generate hints

    It only stores and updates conversation state.
    """

    def __init__(self, session_id: str, initial_time: int = 600):
        self.state = ConversationState(
            session_id=session_id,
            time_remaining=initial_time
        )

    # ---------------------------------------------------------
    # Question management
    # ---------------------------------------------------------

    def set_question(self, question: dict[str, Any]) -> None:
        """Set the current problem/question."""

        self.state.question = question

        self.state.questions_asked.append(question)

    def get_current_question(self) -> Optional[dict[str, Any]]:
        """Return the current question."""

        return self.state.question

    # ---------------------------------------------------------
    # Candidate response management
    # ---------------------------------------------------------

    def add_candidate_response(
        self,
        response: str,
        metadata: Optional[dict[str, Any]] = None
    ) -> dict[str, Any]:
        """
        Store a candidate response.

        Returns the stored response record.
        """

        response_record = {
            "response": response,
            "metadata": metadata or {}
        }

        self.state.candidate_responses.append(response_record)

        return response_record

    def get_candidate_responses(self) -> list[dict[str, Any]]:
        """Return all candidate responses."""

        return self.state.candidate_responses

    # ---------------------------------------------------------
    # Evaluation management
    # ---------------------------------------------------------

    def add_evaluation_result(
        self,
        evaluation: dict[str, Any]
    ) -> None:
        """Store an evaluation result."""

        self.state.evaluation_results.append(evaluation)

        if "weighted_score" in evaluation:
            self.state.current_score = evaluation["weighted_score"]

    def get_evaluation_results(self) -> list[dict[str, Any]]:
        """Return all evaluation results."""

        return self.state.evaluation_results

    # ---------------------------------------------------------
    # Candidate state management
    # ---------------------------------------------------------

    def update_candidate_state(
        self,
        candidate_state: dict[str, Any]
    ) -> None:
        """
        Replace the current candidate state with the latest
        state received from the NLP/context layer.
        """

        self.state.candidate_state = candidate_state

    def get_candidate_state(self) -> dict[str, Any]:
        """Return the current candidate state."""

        return self.state.candidate_state

    # ---------------------------------------------------------
    # Question history
    # ---------------------------------------------------------

    def add_question(
        self,
        question: dict[str, Any]
    ) -> None:
        """
        Add a follow-up question to the conversation history
        and make it the current question.
        """

        self.state.questions_asked.append(question)
        self.state.question = question

    def get_questions_asked(self) -> list[dict[str, Any]]:
        """Return all questions asked during the session."""

        return self.state.questions_asked

    # ---------------------------------------------------------
    # Hint management
    # ---------------------------------------------------------

    def add_hint(
        self,
        hint: dict[str, Any]
    ) -> None:
        """Store a hint given to the candidate."""

        self.state.hints_given.append(hint)

    def get_hints_given(self) -> list[dict[str, Any]]:
        """Return all hints given during the session."""

        return self.state.hints_given

    # ---------------------------------------------------------
    # Timer state
    # ---------------------------------------------------------

    def update_time_remaining(
        self,
        seconds: int
    ) -> None:
        """Update the remaining conversation time."""

        if seconds < 0:
            seconds = 0

        self.state.time_remaining = seconds

    def get_time_remaining(self) -> int:
        """Return remaining time in seconds."""

        return self.state.time_remaining

    # ---------------------------------------------------------
    # Final evaluation
    # ---------------------------------------------------------

    def set_final_evaluation(
        self,
        final_evaluation: dict[str, Any]
    ) -> None:
        """Store the final evaluation and mark the session complete."""

        self.state.final_evaluation = final_evaluation
        self.state.status = "completed"

    def get_final_evaluation(self) -> Optional[dict[str, Any]]:
        """Return the final evaluation."""

        return self.state.final_evaluation

    # ---------------------------------------------------------
    # Session status
    # ---------------------------------------------------------

    def end_session(self) -> None:
        """End the conversation without necessarily storing a final evaluation."""

        self.state.status = "completed"

    def is_active(self) -> bool:
        """Return True if the conversation is still active."""

        return self.state.status == "active"

    # ---------------------------------------------------------
    # Complete state
    # ---------------------------------------------------------

    def get_state(self) -> dict[str, Any]:
        """
        Return the complete conversation state as a dictionary.
        """

        return {
            "session_id": self.state.session_id,
            "question": self.state.question,
            "candidate_responses": self.state.candidate_responses,
            "evaluation_results": self.state.evaluation_results,
            "current_score": self.state.current_score,
            "candidate_state": self.state.candidate_state,
            "questions_asked": self.state.questions_asked,
            "hints_given": self.state.hints_given,
            "time_remaining": self.state.time_remaining,
            "final_evaluation": self.state.final_evaluation,
            "status": self.state.status
        }