import { apiClient } from '../lib/apiClient.js'

export const getRecruiterJobs = async () => {
  const result = await apiClient.get('/recruiter/jobs')

  return result.data
}