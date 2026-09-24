import { apiClient } from '../lib/apiClient.js'


// ============================================================
// GET ALL RECRUITER CANDIDATES
// GET /recruiter/candidates
// ============================================================

export const getRecruiterCandidates = async () => {
  const result = await apiClient.get(
    '/recruiter/candidates',
  )

  console.log(
    'RECRUITER CANDIDATES API RESPONSE:',
    result.data,
  )

  // Backend is directly returning an array
  return Array.isArray(result.data)
    ? result.data
    : result.data?.data || []
}


// ============================================================
// GET SINGLE RECRUITER CANDIDATE
// GET /recruiter/candidates/:candidateId
// ============================================================

export const getRecruiterCandidateById = async (
  candidateId,
) => {
  if (!candidateId) {
    throw new Error('Candidate ID is required')
  }

  const result = await apiClient.get(
    `/recruiter/candidates/${candidateId}`,
  )

  console.log(
    'RECRUITER CANDIDATE DETAIL RESPONSE:',
    result.data,
  )

  // Supports both possible backend response structures
  return result.data?.data || result.data || null
}
export const getCandidateOptions = async () => {
  const result = await apiClient.get(
    '/recruiter/candidate-options',
  )

  return Array.isArray(result.data)
    ? result.data
    : result.data?.data || []
}