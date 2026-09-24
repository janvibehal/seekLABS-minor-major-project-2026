import { apiClient } from '../lib/apiClient.js'

export const getRecruiterQuestions = async (difficulty) => {
    const query = difficulty
        ? `?difficulty=${encodeURIComponent(difficulty)}`
        : ''
    const result = await apiClient.get(`/recruiter/questions${query}`)
    return result.data
}

export const createRecruiterQuestion = async (data) => {
    const result = await apiClient.post('/recruiter/questions', data)
    return result.data
}
