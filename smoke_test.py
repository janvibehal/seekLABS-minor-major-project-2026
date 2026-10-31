"""
Live smoke test for the evaluation API. Run from the folder that contains AI/:

    uvicorn AI.evaluation.api_server:app --port 8000     (in another terminal)
    python smoke_test.py

It sends the 23 benchmark answers to POST /v1/evaluate/final and prints the
score next to the answer's category, then checks that better categories score
higher on average. It makes real Groq calls (about 3 per answer).
"""
import json
import statistics
import sys
import time
from pathlib import Path

import httpx

BASE = "http://localhost:8000"
HEADERS = {}  # add {"X-API-Key": "..."} if INTERVIEW_AI_API_KEY is set
BENCH = Path("AI/dataset/benchmark/candidate_answers.json")

# Higher rank = better answer category (my ordering; adjust if you disagree)
RANK = {
    "fully_correct": 5,
    "correct_but_incomplete": 4,
    "correct_but_inefficient": 3,
    "edge_case_missing": 3,
    "complexity_mistake": 2,
    "partially_correct": 1,
}


def main():
    answers = json.loads(BENCH.read_text(encoding="utf-8"))["candidate_answers"]
    rows, failures = [], 0

    for item in answers:
        body = {
            "problem": {"problem_id": item["problem_id"], "title": item["problem_id"]},
            "candidate_answer": item["answer"],
        }
        start = time.time()
        try:
            r = httpx.post(f"{BASE}/v1/evaluate/final", json=body,
                           headers=HEADERS, timeout=180)
        except httpx.HTTPError as e:
            print(f"{item['test_answer_id']}: REQUEST ERROR {e}")
            failures += 1
            continue

        if r.status_code != 200:
            print(f"{item['test_answer_id']}: HTTP {r.status_code} {r.text[:150]}")
            failures += 1
            continue

        score = r.json()["data"]["overallScore"]
        rows.append((item["category"], score))
        print(f"{item['test_answer_id']:<12} {item['category']:<26} "
              f"score={score:>6}  ({time.time() - start:.1f}s)")

    print(f"\nrequests failed: {failures}/{len(answers)}")
    if not rows:
        sys.exit(1)

    by_cat = {}
    for cat, score in rows:
        by_cat.setdefault(cat, []).append(score)
    print("\nmean score per category (best first):")
    means = {c: statistics.mean(v) for c, v in by_cat.items()}
    for c in sorted(means, key=lambda c: -RANK.get(c, 0)):
        print(f"  {c:<26} {means[c]:6.1f}  (n={len(by_cat[c])})")

    good = means.get("fully_correct")
    bad = means.get("partially_correct")
    if good is not None and bad is not None:
        print("\nSANITY:", "PASS" if good > bad else "FAIL",
              f"(fully_correct {good:.1f} vs partially_correct {bad:.1f})")


if __name__ == "__main__":
    main()