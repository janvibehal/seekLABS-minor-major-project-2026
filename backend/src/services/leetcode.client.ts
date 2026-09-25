const EVALUATION_SERVICE_URL =
  process.env.EVALUATION_SERVICE_URL ||
  'http://127.0.0.1:8000'

type LeetCodeProblemSummary = {
  problem_id: string
  question_id: string
  leetcode_id: string
  title: string
  title_slug: string
  difficulty: string
  is_paid_only: boolean
  topic_tags: Array<{
    name?: string
    slug?: string
  }>
}

type LeetCodeProblem = LeetCodeProblemSummary & {
  description: string
  content: string
  examples: Array<Record<string, unknown>>
  example_testcases: string
  constraints: string
  code_snippets: Array<Record<string, unknown>>
  reference_supported?: boolean
}

type LeetCodeSearchResponse = {
  data: LeetCodeProblemSummary[]
  pagination: {
    page: number
    limit: number
    skip: number
    hasNextPage: boolean
  }
}

const request = async <T>(
  path: string,
): Promise<T> => {
  let response: Response

  try {
    response = await fetch(
      `${EVALUATION_SERVICE_URL}${path}`,
    )
  } catch (error) {
    throw new Error(
      `LeetCode service request failed: ${
        error instanceof Error
          ? error.message
          : String(error)
      }`,
    )
  }

  const raw = await response.text()

  let payload: any = null

  try {
    payload = raw
      ? JSON.parse(raw)
      : null
  } catch {
    throw new Error(
      `LeetCode service returned invalid JSON (HTTP ${response.status}).`,
    )
  }

  if (
    !response.ok ||
    payload?.success === false
  ) {
    throw new Error(
      payload?.detail ||
        payload?.message ||
        `LeetCode service returned HTTP ${response.status}.`,
    )
  }

  return payload as T
}

export const searchLeetCodeProblems = async ({
  query = '',
  difficulty,
  limit = 5,
  skip = 0,
}: {
  query?: string
  difficulty?: string
  limit?: number
  skip?: number
} = {}): Promise<LeetCodeSearchResponse> => {
  const params = new URLSearchParams()

  if (query.trim()) {
    params.set(
      'query',
      query.trim(),
    )
  }

  if (difficulty) {
    params.set(
      'difficulty',
      difficulty,
    )
  }

  params.set(
    'limit',
    String(limit),
  )

  params.set(
    'skip',
    String(skip),
  )

  const payload = await request<{
    success: boolean
    data: LeetCodeProblemSummary[]
    pagination?: {
      page: number
      limit: number
      skip: number
      hasNextPage: boolean
    }
  }>(
    `/v1/problems/search?${params.toString()}`,
  )

  return {
    data: Array.isArray(payload?.data)
      ? payload.data
      : [],
    pagination:
      payload?.pagination ?? {
        page: Math.floor(skip / limit) + 1,
        limit,
        skip,
        hasNextPage: false,
      },
  }
}

export const getLeetCodeProblem = async (
  titleSlug: string,
) => {
  const payload = await request<{
    success: boolean
    data: LeetCodeProblem
  }>(
    `/v1/problems/${encodeURIComponent(
      titleSlug,
    )}`,
  )

  return payload.data
}