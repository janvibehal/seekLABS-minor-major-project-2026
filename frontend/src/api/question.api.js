import { apiClient } from '../lib/apiClient.js'

export const getRecruiterQuestions = async (
  difficulty,
  search = '',
  page = 1,
) => {
  const params = new URLSearchParams()

  params.set('source', 'leetcode')
  params.set('page', String(page))

  if (difficulty && difficulty !== 'ALL') {
    params.set('difficulty', difficulty)
  }

  if (search.trim()) {
    params.set('query', search.trim())
  }

  const result = await apiClient.get(
    `/recruiter/questions?${params.toString()}`,
  )

  return result.data
}

export const importRecruiterLeetCodeQuestion = async (
  titleSlug,
) => {
  const result = await apiClient.post(
    '/recruiter/questions/import-leetcode',
    {
      titleSlug,
    },
  )

  return result.data
}