"""
Single source of truth for the seven evaluation dimension keys.

Runtime keys (produced by llm_evaluator and consumed by scoring,
classification, the API and the adaptive layer) are listed in
EVALUATION_DIMENSIONS.

Other vocabularies found in the project are mapped to the runtime
keys so they can be translated instead of silently mismatching:

- LEGACY_DIMENSION_ALIASES: older runtime/test key names.
- BENCHMARK_DIMENSION_ALIASES: names used in dataset/benchmark/*.json.
"""

EVALUATION_DIMENSIONS = [
    "algorithm_correctness",
    "logical_reasoning",
    "concept_coverage",
    "completeness",
    "data_structure",
    "complexity",
    "edge_cases",
]

LEGACY_DIMENSION_ALIASES = {
    "data_structure_usage": "data_structure",
}

BENCHMARK_DIMENSION_ALIASES = {
    "data_structure_selection": "data_structure",
    "complexity_analysis": "complexity",
    "edge_case_handling": "edge_cases",
}


def canonical_dimension(name: str) -> str:
    """Translate any known dimension name to its runtime key."""
    return (
        LEGACY_DIMENSION_ALIASES.get(name)
        or BENCHMARK_DIMENSION_ALIASES.get(name)
        or name
    )
