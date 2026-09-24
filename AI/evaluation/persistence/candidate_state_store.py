import json
import os
from pathlib import Path
from tempfile import NamedTemporaryFile

from AI.evaluation.scoring.candidate_state import (
    CandidateEvaluationState,
)


class CandidateStateStore:
    """
    Persistent JSON store for CandidateEvaluationState.

    One file represents one candidate/question pair.

    Default location:
        evaluation/data/states/

    The save() method returns the actual path so the caller can verify
    where the state was written.
    """

    def __init__(
        self,
        root_dir: str = "evaluation/data/states"
    ):
        self.root_dir = Path(root_dir)
        self.root_dir.mkdir(
            parents=True,
            exist_ok=True
        )

    def _path(
        self,
        candidate_id: str,
        question_id: str
    ) -> Path:
        filename = (
            f"{candidate_id}_{question_id}.json"
        )

        return self.root_dir / filename

    def save(
        self,
        state: CandidateEvaluationState
    ) -> str:
        if not isinstance(
            state,
            CandidateEvaluationState
        ):
            raise TypeError(
                "state must be a CandidateEvaluationState."
            )

        path = self._path(
            state.candidate_id,
            state.question_id
        )

        data = state.to_dict()

        # Atomic replacement prevents a partially written JSON file
        # if the process is interrupted during save.
        with NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            dir=str(self.root_dir),
            prefix=".candidate_state_",
            suffix=".tmp",
            delete=False
        ) as temp_file:
            temp_path = Path(temp_file.name)

            json.dump(
                data,
                temp_file,
                indent=2,
                ensure_ascii=False
            )

            temp_file.flush()
            os.fsync(temp_file.fileno())

        os.replace(
            temp_path,
            path
        )

        return str(path)

    def exists(
        self,
        candidate_id: str,
        question_id: str
    ) -> bool:
        return self._path(
            candidate_id,
            question_id
        ).exists()

    def load(
        self,
        candidate_id: str,
        question_id: str
    ) -> CandidateEvaluationState:
        path = self._path(
            candidate_id,
            question_id
        )

        if not path.exists():
            raise FileNotFoundError(
                f"No saved state for "
                f"{candidate_id}/{question_id}"
            )

        with path.open(
            "r",
            encoding="utf-8"
        ) as file:
            data = json.load(file)

        return CandidateEvaluationState.from_dict(
            data
        )
