import type { InputJsonValue } from '@prisma/client/runtime/client'

import {
  createQuestion,
  findQuestionByTitle,
  updateQuestionContent,
} from '../../repositories/question.repository.js'

import {
  getLeetCodeProblem,
  searchLeetCodeProblems,
} from '../leetcode.client.js'

const normalizeDifficulty = (
  difficulty: string,
) => {
  const value =
    difficulty?.toUpperCase()

  if (
    value === 'EASY' ||
    value === 'MEDIUM' ||
    value === 'HARD'
  ) {
    return value
  }

  return 'MEDIUM'
}

const normalizeTopics = (
  topicTags: Array<{
    name?: string
    slug?: string
  }> = [],
) =>
  topicTags
    .map(
      (topic) =>
        topic?.name ||
        topic?.slug ||
        '',
    )
    .map((topic) =>
      topic.trim(),
    )
    .filter(Boolean)

const normalizeConstraints = (
  constraints: string,
) =>
  constraints
    .split(/\n+/)
    .map((line) =>
      line
        .replace(
          /^[-•]\s*/,
          '',
        )
        .trim(),
    )
    .filter(Boolean)

const normalizeExamples = (
  examples: Array<
    Record<string, unknown>
  > = [],
  fallbackTestcases = '',
) => {
  if (examples.length > 0) {
    return examples.map(
      (example) => ({
        input: String(
          example.input || '',
        ),
        output: String(
          example.output || '',
        ),
        explanation: String(
          example.explanation ||
            '',
        ),
      }),
    )
  }

  const inputs =
    fallbackTestcases
      .split(/\n+/)
      .map((value) =>
        value.trim(),
      )
      .filter(Boolean)

  return inputs
    .slice(0, 3)
    .map((input) => ({
      input,
      output: '',
      explanation: '',
    }))
}

export const getRecruiterLeetCodeQuestions =
  async ({
    query = '',
    difficulty,
    limit = 5,
    skip = 0,
  }: {
    query?: string
    difficulty?: string
    limit?: number
    skip?: number
  } = {}) => {
    return searchLeetCodeProblems({
      query,
      ...(difficulty
        ? { difficulty }
        : {}),
      limit,
      skip,
    })
  }

export const importLeetCodeQuestion =
  async (
    titleSlug: string,
  ) => {
    const problem =
      await getLeetCodeProblem(
        titleSlug,
      )

    if (problem.is_paid_only) {
      throw new Error(
        'Paid LeetCode problems cannot be added to the question bank.',
      )
    }

    if (
      problem.reference_supported !==
      true
    ) {
      throw new Error(
        'This LeetCode problem is currently unavailable because no AI reference solution is available for it.',
      )
    }

    const existing =
      await findQuestionByTitle(
        problem.title,
      )

    const normalizedFields = {
      difficulty:
        normalizeDifficulty(
          problem.difficulty,
        ) as
          | 'EASY'
          | 'MEDIUM'
          | 'HARD',

      topics: normalizeTopics(
        problem.topic_tags,
      ),

      description:
        problem.description,

      examples:
        normalizeExamples(
          problem.examples,
          problem.example_testcases,
        ) as unknown as InputJsonValue,

      constraints:
        normalizeConstraints(
          problem.constraints,
        ),
    }

    if (existing) {
      // Refresh the stored copy instead of silently returning
      // a stale one — this is what lets a previously-imported
      // question pick up fixes made on the LeetCode/evaluation
      // side (e.g. a cleaned-up description) without recruiters
      // having to delete and re-add it manually.
      return updateQuestionContent(
        existing.id,
        normalizedFields,
      )
    }

    return createQuestion({
      title: problem.title,
      ...normalizedFields,
    })
  }