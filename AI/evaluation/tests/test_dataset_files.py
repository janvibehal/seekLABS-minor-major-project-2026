import json
from pathlib import Path

from AI.evaluation import dataset_loader
from AI.evaluation.persistence.candidate_state_store import (
    CandidateStateStore,
)
from AI.evaluation.scoring.dimensions import canonical_dimension

DATASET_DIR = Path(dataset_loader.__file__).resolve().parent.parent / "dataset"


def test_test_answer_ids_are_unique_and_match_benchmark():

    benchmark = json.loads(
        (DATASET_DIR / "benchmark" / "candidate_answers.json").read_text(
            encoding="utf-8"
        )
    )["candidate_answers"]

    text_to_id = {
        item["answer"].strip(): item["test_answer_id"]
        for item in benchmark
    }

    for path in sorted((DATASET_DIR / "test_answers").glob("*.json")):

        items = json.loads(path.read_text(encoding="utf-8"))[
            "candidate_test_answers"
        ]

        ids = [item["test_answer_id"] for item in items]

        assert len(ids) == len(set(ids)), path.name

        for item in items:
            assert text_to_id[item["answer"].strip()] == item["test_answer_id"]


def test_reference_dataset_cache_returns_independent_copies():

    first = dataset_loader.load_reference_dataset()
    first["P001"]["reference_solutions"].clear()

    second = dataset_loader.load_reference_dataset()

    assert second["P001"]["reference_solutions"]


def test_dataset_root_does_not_depend_on_folder_name():

    assert dataset_loader.DATASET_ROOT == DATASET_DIR
    assert dataset_loader.REFERENCE_DATASET.exists()


def test_state_store_default_path_is_cwd_independent(monkeypatch, tmp_path):

    monkeypatch.chdir(tmp_path)

    assert CandidateStateStore.DEFAULT_ROOT_DIR.is_absolute()
    assert CandidateStateStore.DEFAULT_ROOT_DIR.parts[-3:] == (
        "evaluation",
        "data",
        "states",
    )


def test_benchmark_dimension_names_map_to_runtime_names():

    assert canonical_dimension("data_structure_selection") == "data_structure"
    assert canonical_dimension("complexity_analysis") == "complexity"
    assert canonical_dimension("edge_case_handling") == "edge_cases"
    assert canonical_dimension("data_structure_usage") == "data_structure"
    assert canonical_dimension("algorithm_correctness") == (
        "algorithm_correctness"
    )
