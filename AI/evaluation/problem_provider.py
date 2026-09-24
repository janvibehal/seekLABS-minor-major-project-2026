"""
LeetCode GraphQL problem provider.

LeetCode is the source of coding-problem statements.

Responsibilities:
    - Fetch problems from LeetCode GraphQL.
    - Dynamically select a problem.
    - Fetch complete problem details.
    - Normalize the result for InterviewSession.
    - Convert LeetCode questionFrontendId to the project's
      canonical Problem ID format.

Architecture:
    LeetCode
        ↓
    ProblemProvider
        ↓
    InterviewSession
        ↓
    Candidate answer
        ↓
    NLP / Reference Matching / Evaluation

Reference solutions remain in the Excel repository.
This provider does NOT select references or targets.
"""

from __future__ import annotations

import random
import re
from typing import Any, Optional

import httpx

from AI.evaluation.dataset_loader import load_reference_dataset


# ============================================================
# CONFIGURATION
# ============================================================

LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

DEFAULT_TIMEOUT = 30.0

DEFAULT_HEADERS = {
    "Content-Type": "application/json",
    "Origin": "https://leetcode.com",
    "Referer": "https://leetcode.com/",
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36"
    ),
}


# ============================================================
# GRAPHQL QUERIES
# ============================================================

QUESTION_LIST_QUERY = """
query questionListV2(
    $limit: Int,
    $skip: Int
) {
    problemsetQuestionListV2(
        limit: $limit
        skip: $skip
    ) {
        questions {
            id
            questionFrontendId
            title
            titleSlug
            difficulty
            paidOnly
            topicTags {
                name
                slug
            }
        }
    }
}
"""


QUESTION_DETAIL_QUERY = """
query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        titleSlug
        content
        difficulty
        isPaidOnly
        exampleTestcases
        topicTags {
            name
            slug
        }
        codeSnippets {
            lang
            langSlug
            code
        }
    }
}
"""


# ============================================================
# EXCEPTIONS
# ============================================================


class ProblemProviderError(RuntimeError):
    """Base exception for problem-provider failures."""


class LeetCodeAPIError(ProblemProviderError):
    """Raised when LeetCode GraphQL returns an error."""


# ============================================================
# PROVIDER
# ============================================================


class ProblemProvider:
    """
    Provides coding problems from LeetCode GraphQL.

    Example:

        with ProblemProvider() as provider:
            problem = provider.get_random_problem()

        session = InterviewSession(
            candidate_id="candidate-1",
            question_id=problem["question_id"],
            problem=problem,
        )
    """

    def __init__(
        self,
        graphql_url: str = LEETCODE_GRAPHQL_URL,
        timeout: float = DEFAULT_TIMEOUT,
        client: Optional[httpx.Client] = None,
    ) -> None:

        self.graphql_url = graphql_url
        self.timeout = timeout

        self._client = client or httpx.Client(
            headers=DEFAULT_HEADERS,
            timeout=timeout,
        )

        self._owns_client = client is None

    # ========================================================
    # CLEANUP
    # ========================================================

    def close(self) -> None:
        """Close the HTTP client."""

        if self._owns_client:
            self._client.close()

    def __enter__(self) -> "ProblemProvider":
        return self

    def __exit__(
        self,
        exc_type: Any,
        exc_value: Any,
        traceback: Any,
    ) -> None:

        self.close()

    # ========================================================
    # GRAPHQL REQUEST
    # ========================================================

    def _graphql_request(
        self,
        query: str,
        variables: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Execute a GraphQL request against LeetCode.
        """

        try:
            response = self._client.post(
                self.graphql_url,
                json={
                    "query": query,
                    "variables": variables,
                },
            )

        except httpx.HTTPError as exc:
            raise LeetCodeAPIError(
                "Unable to reach LeetCode GraphQL API: "
                f"{exc}"
            ) from exc

        if response.status_code != 200:
            raise LeetCodeAPIError(
                "LeetCode GraphQL API returned HTTP "
                f"{response.status_code}: "
                f"{response.text[:1000]}"
            )

        try:
            payload = response.json()

        except ValueError as exc:
            raise LeetCodeAPIError(
                "LeetCode GraphQL API returned invalid JSON."
            ) from exc

        if not isinstance(payload, dict):
            raise LeetCodeAPIError(
                "LeetCode GraphQL response is not a JSON object."
            )

        errors = payload.get("errors")

        if errors:

            messages: list[str] = []

            if isinstance(errors, list):

                for error in errors:

                    if isinstance(error, dict):

                        message = error.get(
                            "message"
                        )

                        if message:
                            messages.append(
                                str(message)
                            )

                    else:
                        messages.append(
                            str(error)
                        )

            else:
                messages.append(
                    str(errors)
                )

            raise LeetCodeAPIError(
                "LeetCode GraphQL returned errors: "
                + "; ".join(messages)
            )

        data = payload.get("data")

        if not isinstance(data, dict):
            raise LeetCodeAPIError(
                "LeetCode GraphQL response does not contain "
                "a valid data object."
            )

        return data

    # ========================================================
    # CANONICAL PROBLEM ID
    # ========================================================

    @staticmethod
    def _canonical_problem_id(
        question_frontend_id: Any,
    ) -> str:
        """
        Convert LeetCode questionFrontendId to the project's
        canonical Problem ID.

        Examples:

            1    -> P001
            10   -> P010
            137  -> P137
        """

        if question_frontend_id is None:
            raise ProblemProviderError(
                "LeetCode problem is missing "
                "questionFrontendId."
            )

        raw_id = str(
            question_frontend_id
        ).strip()

        if not raw_id:
            raise ProblemProviderError(
                "LeetCode questionFrontendId is empty."
            )

        try:
            numeric_id = int(raw_id)

        except ValueError as exc:
            raise ProblemProviderError(
                "Invalid LeetCode questionFrontendId: "
                f"{raw_id}"
            ) from exc

        if numeric_id <= 0:
            raise ProblemProviderError(
                "LeetCode questionFrontendId must be "
                "greater than zero."
            )

        return f"P{numeric_id:03d}"

    # ========================================================
    # HTML → TEXT
    # ========================================================

    @staticmethod
    def _html_to_text(
        html: Optional[str],
    ) -> str:
        """
        Convert LeetCode's HTML problem content to readable
        plain text.

        Uses a lightweight parser so the provider does not
        introduce another mandatory dependency.
        """

        if not html:
            return ""

        text = html

        # Line-breaking tags.
        text = re.sub(
            r"<\s*(br|/p|/div|/li|/pre|/h[1-6])[^>]*>",
            "\n",
            text,
            flags=re.IGNORECASE,
        )

        # List-item opening tags.
        text = re.sub(
            r"<\s*li[^>]*>",
            "\n- ",
            text,
            flags=re.IGNORECASE,
        )

        # Remove remaining tags.
        text = re.sub(
            r"<[^>]+>",
            "",
            text,
        )

        # Decode common HTML entities.
        replacements = {
            "&nbsp;": " ",
            "&lt;": "<",
            "&gt;": ">",
            "&amp;": "&",
            "&quot;": '"',
            "&#39;": "'",
        }

        for source, target in replacements.items():
            text = text.replace(
                source,
                target,
            )

        # Normalize whitespace.
        text = re.sub(
            r"[ \t]+",
            " ",
            text,
        )

        text = re.sub(
            r"\n\s*\n\s*\n+",
            "\n\n",
            text,
        )

        return text.strip()

    # ========================================================
    # EXTRACT CONSTRAINTS
    # ========================================================

    @staticmethod
    def _extract_constraints(
        content: Optional[str],
    ) -> str:
        """
        Extract the Constraints section from LeetCode's
        HTML content.

        LeetCode does not expose a separate `constraints`
        field on QuestionNode, so constraints are derived
        from the problem content.
        """

        if not content:
            return ""

        plain_text = (
            ProblemProvider._html_to_text(
                content
            )
        )

        # Try common heading forms.
        patterns = [
            r"(?is)\bConstraints\s*:?\s*(.*?)(?=\n\s*(?:Follow-up|Related Topics|Companies|Similar Questions|$))",
            r"(?is)\bConstraints\s*:?\s*(.*)$",
        ]

        for pattern in patterns:

            match = re.search(
                pattern,
                plain_text,
            )

            if match:

                constraints = (
                    match.group(1)
                    .strip()
                )

                if constraints:
                    return constraints

        return ""

    # ========================================================
    # LIST PROBLEMS
    # ========================================================

    def list_problems(
        self,
        *,
        limit: int = 100,
        skip: int = 0,
        difficulty: Optional[str] = None,
        paid_only: Optional[bool] = False,
    ) -> list[dict[str, Any]]:
        """
        Fetch a list of LeetCode problems.

        Filtering is performed locally to avoid dependence
        on LeetCode's changing GraphQL filter-input schema.
        """

        if limit <= 0:
            raise ValueError(
                "limit must be greater than 0."
            )

        if skip < 0:
            raise ValueError(
                "skip cannot be negative."
            )

        requested_difficulty: Optional[str] = None

        if difficulty is not None:

            requested_difficulty = (
                str(difficulty)
                .strip()
                .upper()
            )

            if requested_difficulty not in {
                "EASY",
                "MEDIUM",
                "HARD",
            }:
                raise ValueError(
                    "difficulty must be one of: "
                    "EASY, MEDIUM, HARD."
                )

        data = self._graphql_request(
            QUESTION_LIST_QUERY,
            {
                "limit": limit,
                "skip": skip,
            },
        )

        problemset = data.get(
            "problemsetQuestionListV2"
        )

        if not isinstance(
            problemset,
            dict,
        ):
            raise LeetCodeAPIError(
                "LeetCode response does not contain "
                "'problemsetQuestionListV2'."
            )

        questions = problemset.get(
            "questions"
        )

        if not isinstance(
            questions,
            list,
        ):
            raise LeetCodeAPIError(
                "LeetCode response does not contain "
                "a valid questions list."
            )

        problems: list[dict[str, Any]] = []

        for question in questions:

            if not isinstance(
                question,
                dict,
            ):
                continue

            # --------------------------------------------
            # Paid filtering
            # --------------------------------------------

            is_paid = bool(
                question.get(
                    "paidOnly",
                    False,
                )
            )

            if (
                paid_only is False
                and is_paid
            ):
                continue

            if (
                paid_only is True
                and not is_paid
            ):
                continue

            # --------------------------------------------
            # Difficulty filtering
            # --------------------------------------------

            current_difficulty = (
                question.get(
                    "difficulty"
                )
            )

            if (
                requested_difficulty is not None
                and str(
                    current_difficulty or ""
                ).upper()
                != requested_difficulty
            ):
                continue

            # --------------------------------------------
            # Required fields
            # --------------------------------------------

            question_frontend_id = (
                question.get(
                    "questionFrontendId"
                )
            )

            title_slug = question.get(
                "titleSlug"
            )

            if (
                not question_frontend_id
                or not title_slug
            ):
                continue

            problem_id = (
                self._canonical_problem_id(
                    question_frontend_id
                )
            )

            problems.append(
                {
                    "problem_id": problem_id,

                    "question_id": (
                        str(
                            question.get(
                                "id"
                            )
                        )
                        if question.get("id")
                        is not None
                        else ""
                    ),

                    "leetcode_id": str(
                        question_frontend_id
                    ),

                    "title": question.get(
                        "title"
                    ),

                    "title_slug": title_slug,

                    "difficulty": current_difficulty,

                    "is_paid_only": is_paid,

                    "topic_tags": (
                        question.get(
                            "topicTags"
                        )
                        or []
                    ),
                }
            )

        return problems

    # ========================================================
    # GET COMPLETE PROBLEM
    # ========================================================

    def get_problem(
        self,
        title_slug: str,
    ) -> dict[str, Any]:
        """
        Fetch the complete problem using titleSlug.
        """

        if not title_slug:
            raise ValueError(
                "title_slug cannot be empty."
            )

        title_slug = str(
            title_slug
        ).strip()

        if not title_slug:
            raise ValueError(
                "title_slug cannot be empty."
            )

        data = self._graphql_request(
            QUESTION_DETAIL_QUERY,
            {
                "titleSlug": title_slug,
            },
        )

        question = data.get(
            "question"
        )

        if not isinstance(
            question,
            dict,
        ):
            raise ProblemProviderError(
                "LeetCode did not return problem details "
                f"for title slug: {title_slug}"
            )

        return self._normalize_problem(
            question
        )

    # ========================================================
    # RANDOM PROBLEM
    # ========================================================

    def _get_supported_problem_ids(self) -> set[str]:
        """Return Problem IDs that have reference solutions in Excel."""
        reference_dataset = load_reference_dataset()
        if not isinstance(reference_dataset, dict):
            raise ProblemProviderError(
                "Reference dataset must be a dictionary keyed by Problem ID."
            )
        supported_ids = {
            str(problem_id).strip().upper()
            for problem_id in reference_dataset.keys()
            if problem_id is not None
        }
        supported_ids.discard("")
        if not supported_ids:
            raise ProblemProviderError(
                "No supported problem IDs were found in the reference repository."
            )
        return supported_ids

    def _find_supported_problems(
        self,
        *,
        difficulty: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        """Find live LeetCode problems supported by the reference repository."""
        supported_ids = self._get_supported_problem_ids()
        matched: dict[str, dict[str, Any]] = {}
        skip = 0
        page_size = 100

        while supported_ids - matched.keys():
            page = self.list_problems(
                limit=page_size,
                skip=skip,
                difficulty=difficulty,
                paid_only=False,
            )
            if not page:
                break

            for problem in page:
                problem_id = str(problem.get("problem_id", "")).strip().upper()
                if problem_id in supported_ids:
                    matched[problem_id] = problem

            skip += page_size

        return list(matched.values())

    def get_random_problem(
        self,
        *,
        difficulty: Optional[str] = None,
    ) -> dict[str, Any]:
        """Select a random supported free LeetCode problem and fetch its details."""
        problems = self._find_supported_problems(difficulty=difficulty)

        if not problems:
            suffix = f" for difficulty '{difficulty}'" if difficulty else ""
            raise ProblemProviderError(
                "No LeetCode problems with matching project reference "
                f"solutions were found{suffix}."
            )

        selected_problem = random.choice(problems)
        title_slug = selected_problem.get("title_slug")

        if not title_slug:
            raise ProblemProviderError(
                "Selected LeetCode problem has no title slug."
            )

        return self.get_problem(title_slug)


    # ========================================================
    # NORMALIZE COMPLETE PROBLEM
    # ========================================================

    def _normalize_problem(
        self,
        question: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Normalize a QuestionNode into the problem dictionary
        expected by InterviewSession.
        """

        question_frontend_id = (
            question.get(
                "questionFrontendId"
            )
        )

        problem_id = (
            self._canonical_problem_id(
                question_frontend_id
            )
        )

        question_id = question.get(
            "questionId"
        )

        title = question.get(
            "title"
        )

        title_slug = question.get(
            "titleSlug"
        )

        content = question.get(
            "content"
        )

        if not title:
            raise ProblemProviderError(
                f"Problem {problem_id} is missing title."
            )

        if not title_slug:
            raise ProblemProviderError(
                f"Problem {problem_id} is missing title slug."
            )

        if not content:
            raise ProblemProviderError(
                f"Problem {problem_id} is missing problem content."
            )

        # Convert HTML statement to plain text.
        description = (
            self._html_to_text(
                content
            )
        )

        # Constraints are part of the HTML content.
        constraints = (
            self._extract_constraints(
                content
            )
        )

        return {
            # ================================================
            # Canonical project identity
            # ================================================

            "problem_id": problem_id,

            # ================================================
            # LeetCode identity
            # ================================================

            "question_id": (
                str(question_id)
                if question_id is not None
                else ""
            ),

            "leetcode_id": str(
                question_frontend_id
            ),

            "title_slug": title_slug,

            # ================================================
            # Problem statement
            # ================================================

            "title": title,

            "description": description,

            # Preserve original HTML too.
            "content": content,

            # ================================================
            # Metadata
            # ================================================

            "difficulty": question.get(
                "difficulty"
            ),

            "is_paid_only": bool(
                question.get(
                    "isPaidOnly",
                    False,
                )
            ),

            # ================================================
            # Examples
            # ================================================

            "example_testcases": (
                question.get(
                    "exampleTestcases"
                )
                or ""
            ),

            # ================================================
            # Constraints
            # ================================================

            "constraints": constraints,

            # ================================================
            # Topics
            # ================================================

            "topic_tags": (
                question.get(
                    "topicTags"
                )
                or []
            ),

            # ================================================
            # Starter code
            # ================================================

            "code_snippets": (
                question.get(
                    "codeSnippets"
                )
                or []
            ),
        }

    # ========================================================
    # GET BY PROJECT PROBLEM ID
    # ========================================================

    def get_problem_by_id(
        self,
        problem_id: str,
    ) -> dict[str, Any]:
        """
        Get a LeetCode problem using the project's
        canonical Problem ID.

        Example:

            P001 -> LeetCode #1
            P010 -> LeetCode #10
            P137 -> LeetCode #137
        """

        if not problem_id:
            raise ValueError(
                "problem_id cannot be empty."
            )

        normalized = str(
            problem_id
        ).strip().upper()

        if not normalized.startswith("P"):
            raise ValueError(
                "problem_id must use the canonical "
                "format P001, P002, etc."
            )

        numeric_part = normalized[1:]

        if not numeric_part.isdigit():
            raise ValueError(
                f"Invalid problem_id: {problem_id}"
            )

        requested_leetcode_id = str(
            int(numeric_part)
        )

        skip = 0
        page_size = 100

        while True:
            problems = self.list_problems(
                limit=page_size,
                skip=skip,
                paid_only=False,
            )
            if not problems:
                break

            for problem in problems:
                if problem.get("leetcode_id") == requested_leetcode_id:
                    title_slug = problem.get("title_slug")
                    if title_slug:
                        return self.get_problem(title_slug)

            skip += page_size

        raise FileNotFoundError(
            "LeetCode problem not found for "
            f"problem_id: {problem_id}"
        )


# ============================================================
# CONVENIENCE FUNCTIONS
# ============================================================


def get_random_problem(
    difficulty: Optional[str] = None,
) -> dict[str, Any]:
    """
    Get one dynamically selected LeetCode problem.
    """

    with ProblemProvider() as provider:
        return provider.get_random_problem(
            difficulty=difficulty
        )


def get_problem(
    problem_id: str,
) -> dict[str, Any]:
    """
    Get a LeetCode problem using the project's
    canonical Problem ID.
    """

    with ProblemProvider() as provider:
        return provider.get_problem_by_id(
            problem_id
        )