from AI.evaluation.pipeline.evaluate import evaluate_submission
from AI.evaluation.pipeline.terminal_formatter import print_evaluation


problem = {
    "statement": (
        "Given an array of integers nums and an integer target, "
        "return the indices of the two numbers such that they add "
        "up to target. You may assume that each input has exactly "
        "one solution, and you may not use the same element twice."
    )
}


candidate_answer = (
    "I'll use a hash map. I'll store the numbers I've already "
    "seen and check whether the complement exists. "
    "This should take O(n) time and O(n) space."
)


reference_solution = (
    "Use a hash map. For each number, calculate target - number "
    "and check whether the complement is already present in the "
    "map. If it is, return the two indices; otherwise store the "
    "current number and its index. The expected complexity is "
    "O(n) time and O(n) space."
)


result = evaluate_submission(
    problem,
    candidate_answer,
    reference_solution
)


print_evaluation(result)