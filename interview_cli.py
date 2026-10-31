#!/usr/bin/env python3
"""
Run a complete interview from the terminal, exactly the way the backend
drives the AI API: turn by turn, then one cumulative final result.

Run it from the folder that contains AI/ (with the venv active):

    python interview_cli.py --list
    python interview_cli.py --in-process --problem "Two Sum"
    python interview_cli.py --in-process --problem "Two Sum" --problem "Valid Anagram"
    python interview_cli.py --url http://127.0.0.1:8000 --problem "Two Sum"
    python interview_cli.py --in-process --problem "Two Sum" --answers answers.txt

Interactive commands while answering:
    /next   finish the current question and go to the next one
    /end    finish the whole interview and show the result

--in-process runs the API inside this script (no uvicorn needed).
Without it, the script calls a running server (--url).
Every run makes real Groq calls and needs Ollama running for embeddings.
"""

import argparse
import os
import sys
import time
import uuid

DIMENSIONS = [
    "algorithm_correctness",
    "logical_reasoning",
    "concept_coverage",
    "completeness",
    "data_structure",
    "complexity",
    "edge_cases",
]


def parse_args():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--problem", action="append", default=[],
                        help="Question title (repeat for several questions). "
                             "Must match a title in the reference dataset to run adaptively.")
    parser.add_argument("--list", action="store_true",
                        help="List the titles that have reference solutions and exit.")
    parser.add_argument("--in-process", action="store_true",
                        help="Run the API inside this script instead of calling a server.")
    parser.add_argument("--url", default="http://127.0.0.1:8000")
    parser.add_argument("--api-key", default=os.getenv("INTERVIEW_AI_API_KEY", ""),
                        help="X-API-Key value, if the API has INTERVIEW_AI_API_KEY set.")
    parser.add_argument("--answers",
                        help="Text file with one candidate answer per line (non-interactive).")
    parser.add_argument("--max-turns", type=int, default=5,
                        help="Candidate-turn cap per question (default 5).")
    parser.add_argument("--minutes", type=float, default=45,
                        help="Interview length used for the time-remaining value.")
    parser.add_argument("--timeout", type=float, default=180,
                        help="HTTP timeout in seconds when calling a server.")
    parser.add_argument("--candidate-id", default="cli_candidate")
    return parser.parse_args()


def list_titles():
    from AI.evaluation.dataset_loader import load_reference_dataset

    titles = sorted({
        reference["Problem Title"]
        for data in load_reference_dataset().values()
        for reference in data["reference_solutions"]
    })

    print("Questions with reference solutions (adaptive):")
    for title in titles:
        print(f"  - {title}")


def make_post(args):
    """Return post(path, body) -> (status_code, json_body)."""

    headers = {}

    if args.in_process:
        from fastapi.testclient import TestClient

        from AI.evaluation import api_server
        from AI.evaluation.configs.ai_config import API_ACCESS_KEY

        client = TestClient(api_server.app)

        if API_ACCESS_KEY:
            headers["X-API-Key"] = API_ACCESS_KEY

        def post(path, body):
            response = client.post(path, json=body, headers=headers)
            return response.status_code, _json(response)

        return post

    import httpx

    if args.api_key:
        headers["X-API-Key"] = args.api_key

    def post(path, body):
        response = httpx.post(args.url + path, json=body,
                              headers=headers, timeout=args.timeout)
        return response.status_code, _json(response)

    return post


def _json(response):
    try:
        return response.json()
    except ValueError:
        return {"detail": response.text[:300]}


def show_scores(scores):
    for dimension in DIMENSIONS:
        entry = scores.get(dimension)
        value = entry.get("score") if isinstance(entry, dict) else entry

        if isinstance(value, (int, float)):
            print(f"    {dimension:<22} {value:6.1f}")
        else:
            print(f"    {dimension:<22}  not assessed")


class AnswerSource:
    """Candidate answers: from a file (one per line) or from the keyboard."""

    def __init__(self, path):
        self.lines = None

        if path:
            with open(path, encoding="utf-8") as handle:
                self.lines = [line.strip() for line in handle if line.strip()]

    def next(self):
        if self.lines is not None:
            if not self.lines:
                return "/end"

            answer = self.lines.pop(0)
            print(f"You> {answer}")
            return answer

        try:
            return input("You> ").strip()
        except EOFError:
            return "/end"


def run_question(index, title, args, post, answers, session_id, started, history_by_q):
    question_id = f"q{index + 1}"
    problem = {"id": f"cli-{question_id}", "title": title, "description": ""}
    history = history_by_q.setdefault(question_id, [])

    print("\n" + "=" * 70)
    print(f"QUESTION {index + 1}: {title}")
    print("=" * 70)
    print(f"Interviewer> Please explain your approach for solving {title}.\n")

    turns = 0

    while True:
        answer = answers.next()

        if answer == "/end":
            return "end"

        if answer == "/next":
            return "next"

        if not answer:
            continue

        history.append({"sender": "CANDIDATE", "message": answer,
                        "questionId": question_id})

        remaining = max(1, int(args.minutes * 60 - (time.time() - started)))

        status, body = post("/v1/evaluate/turn", {
            "problem": problem,
            "candidate_answer": answer,
            "history": history,
            "candidate_id": args.candidate_id,
            "session_id": session_id,
            "question_id": question_id,
            "time_remaining_seconds": remaining,
            "max_turns": args.max_turns,
        })

        if status != 200:
            history.pop()
            print(f"\n[API ERROR {status}] {body.get('detail', body)}\n")
            continue

        turns += 1
        data = body["data"]
        adaptive = data.get("adaptive", {})

        print("\n  scores so far:")
        show_scores(data["evaluation"]["scores"])

        label = data.get("classification", {}).get("primary_classification")

        if adaptive.get("enabled"):
            print(f"\n  [adaptive] turn={adaptive.get('turn')} "
                  f"matched={adaptive.get('matched_reference_id')} "
                  f"target={adaptive.get('target_reference_id')} "
                  f"classification={label}")
        else:
            print(f"\n  [stateless] no reference solutions for this title "
                  f"(classification={label})")

        message = data.get("message")

        if message:
            history.append({"sender": "AI", "message": message,
                            "questionId": question_id})
            print(f"\nInterviewer> {message}\n")

        if adaptive.get("finished"):
            print("  -> the adaptive policy finished this question.")
            return "next"

        if turns >= args.max_turns:
            print(f"  -> turn cap ({args.max_turns}) reached.")
            return "next"


def main():
    args = parse_args()
    sys.path.insert(0, os.getcwd())

    if args.list:
        list_titles()
        return

    if not args.problem:
        print("Give at least one --problem \"<title>\" (see --list).")
        sys.exit(2)

    post = make_post(args)
    answers = AnswerSource(args.answers)
    session_id = "cli" + uuid.uuid4().hex[:12]
    started = time.time()
    history_by_q = {}
    problems = []

    for index, title in enumerate(args.problem):
        problems.append((f"q{index + 1}", title))

        if run_question(index, title, args, post, answers, session_id,
                        started, history_by_q) == "end":
            break

    # ---------------------------------------------------------------
    # Cumulative final result (what the backend asks for at the end)
    # ---------------------------------------------------------------
    questions = []

    for question_id, title in problems:
        history = history_by_q.get(question_id, [])
        questions.append({
            "question_id": question_id,
            "problem": {"id": f"cli-{question_id}", "title": title,
                        "description": ""},
            "candidate_answer": "\n\n".join(
                m["message"] for m in history if m["sender"] == "CANDIDATE"),
            "history": history,
        })

    print("\n" + "=" * 70)
    print("FINAL RESULT")
    print("=" * 70)

    status, body = post("/v1/evaluate/final", {
        "candidate_id": args.candidate_id,
        "session_id": session_id,
        "questions": questions,
    })

    if status != 200:
        print(f"[API ERROR {status}] {body.get('detail', body)}")
        sys.exit(1)

    data = body["data"]

    print(f"Overall score : {data['overallScore']}")
    print(f"Coverage      : {data['coverage']['answered']} of "
          f"{data['coverage']['total']} questions answered\n")
    print("Cumulative dimensions:")
    show_scores(data["evaluation"]["scores"])

    print("\nPer question:")
    for result in data["questions"]:
        if result["answered"]:
            print(f"  {result['question_id']}  score={result['overallScore']}  "
                  f"source={result['source']}  turns={result['turns']}  "
                  f"class={result['classification'].get('primary_classification')}")
        else:
            print(f"  {result['question_id']}  not answered")

    print(f"\nAdaptive state files for this run: AI/evaluation/data/states/"
          f"{args.candidate_id}_{session_id}_*.json")


if __name__ == "__main__":
    main()
