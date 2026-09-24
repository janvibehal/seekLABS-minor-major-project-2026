from AI.evaluation.scoring.adaptive_probe import (
    get_unassessed_dimensions,
    get_unassessed_probe
)


def test_unassessed_dimensions():

    evaluation = {
        "scores": {
            "algorithm_correctness": {
                "score": 100,
                "assessment_status": "ASSESSED"
            },

            "logical_reasoning": {
                "score": 90,
                "assessment_status": "ASSESSED"
            },

            "concept_coverage": {
                "score": 100,
                "assessment_status": "ASSESSED"
            },

            "completeness": {
                "score": 80,
                "assessment_status": "ASSESSED"
            },

            "data_structure": {
                "score": 95,
                "assessment_status": "ASSESSED"
            },

            "complexity": {
                "score": 100,
                "assessment_status": "ASSESSED"
            },

            "edge_cases": {
                "score": None,
                "assessment_status": "NOT_ASSESSED"
            }
        }
    }

    unassessed = get_unassessed_dimensions(
        evaluation
    )

    print("\nUnassessed dimensions:")
    print(unassessed)

    assert unassessed == [
        "edge_cases"
    ]

    print(
        "UNASSESSED DIMENSION TEST PASSED"
    )


def test_probe_selection():

    evaluation = {
        "scores": {
            "complexity": {
                "score": None,
                "assessment_status": "NOT_ASSESSED"
            },

            "edge_cases": {
                "score": None,
                "assessment_status": "NOT_ASSESSED"
            }
        }
    }

    probe = get_unassessed_probe(
        evaluation,
        already_probed=[]
    )

    print("\nSelected probe:")
    print(probe)

    assert probe == "Complexity Gap"

    print(
        "PROBE SELECTION TEST PASSED"
    )


def test_already_probed():

    evaluation = {
        "scores": {
            "complexity": {
                "score": None,
                "assessment_status": "NOT_ASSESSED"
            },

            "edge_cases": {
                "score": None,
                "assessment_status": "NOT_ASSESSED"
            }
        }
    }

    probe = get_unassessed_probe(
        evaluation,
        already_probed=[
            "Complexity Gap"
        ]
    )

    print("\nNext probe:")
    print(probe)

    assert probe == "Edge-Case Gap"

    print(
        "ALREADY-PROBED TEST PASSED"
    )


if __name__ == "__main__":

    print("\n==========================================")
    print("       ADAPTIVE PROBE TEST")
    print("==========================================")

    test_unassessed_dimensions()

    test_probe_selection()

    test_already_probed()

    print("\n==========================================")
    print("       STEP 11.1 TESTS PASSED")
    print("==========================================\n")