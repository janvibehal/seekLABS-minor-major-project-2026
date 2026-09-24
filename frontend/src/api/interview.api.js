import { apiClient, apiRequest } from '../lib/apiClient.js'


export const getRecruiterInterviews = async () => {
  const result = await apiClient.get(
    '/recruiter/interviews'
  )

  return result.data
}


export const getRecruiterInterviewById = async (
  interviewId,
) => {
  const result = await apiClient.get(
    `/recruiter/interviews/${interviewId}`
  )

  return result.data
}


export const createInterview = async (data) => {
  const result = await apiClient.post(
    '/recruiter/interviews',
    data,
  )

  return result.data
}


export const updateInterview = async (
  interviewId,
  data,
) => {
  const result = await apiRequest(
    `/recruiter/interviews/${interviewId}`,
    {
      method: 'PATCH',
      body: data,
    },
  )

  return result.data
}


export const deleteInterview = async (
  interviewId,
) => {
  const result = await apiRequest(
    `/recruiter/interviews/${interviewId}`,
    {
      method: 'DELETE',
    },
  )

  return result.data
}


/* ============================================================
   ANALYTICS
============================================================ */

export const getRecruiterAnalytics = async () => {
  const result = await apiClient.get(
    '/recruiter/analytics'
  )

  return result.data
}


