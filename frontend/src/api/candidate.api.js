import { apiClient } from '../lib/apiClient.js'

// ---- normalization helpers -------------------------------------------
// The backend uses upper-case enums (Prisma convention); the existing
// frontend components were designed around lower-case status strings.
// Normalizing here means the components stay as they are.

export const toLowerStatus = (status) => (status ? status.toLowerCase() : status)

export const toChatSender = (sender) => (sender === 'AI' ? 'ai' : 'candidate')

const INTERVIEW_STATUS_LABEL = {
  SCHEDULED: 'Upcoming',
  IN_PROGRESS: 'Upcoming',
  COMPLETED: 'Completed',
  EXPIRED: 'Expired',
  CANCELLED: 'Expired',
}

export const toInterviewStatusLabel = (status) =>
  INTERVIEW_STATUS_LABEL[status] || status

export const formatDate = (isoDate) => {
  const date = new Date(isoDate)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()

  if (isSameDay(date, today)) return 'Today'
  if (isSameDay(date, tomorrow)) return 'Tomorrow'

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  })
}

export const formatTime = (isoDate) =>
  new Date(isoDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

export const formatDuration = (minutes) => `${minutes} min`

// ---- API calls ----------------------------------------------------------

export const getDashboard = async () => {
  const result = await apiClient.get('/candidate/dashboard')
  return result.data
}

export const listInterviews = async (status) => {
  const query = status ? `?status=${status}` : ''
  const result = await apiClient.get(`/candidate/interviews${query}`)
  return result.data
}

export const getInterview = async (interviewId) => {
  const result = await apiClient.get(`/candidate/interviews/${interviewId}`)
  return result.data
}

export const startInterview = async (interviewId) => {
  const result = await apiClient.post(`/candidate/interviews/${interviewId}/start`)
  return result.data
}

export const getSession = async (sessionId) => {
  const result = await apiClient.get(`/candidate/interview-sessions/${sessionId}`)
  return result.data
}

export const getMessages = async (sessionId) => {
  const result = await apiClient.get(
    `/candidate/interview-sessions/${sessionId}/messages`,
  )
  return result.data
}

export const sendMessage = async (sessionId, { questionId, message }) => {
  const result = await apiClient.post(
    `/candidate/interview-sessions/${sessionId}/messages`,
    { questionId, message },
  )
  return result.data
}

export const endInterview = async (sessionId) => {
  const result = await apiClient.post(
    `/candidate/interview-sessions/${sessionId}/end`,
  )
  return result.data
}

export const listResults = async () => {
  const result = await apiClient.get('/candidate/results')
  return result.data
}

export const getResultDetail = async (interviewId) => {
  const result = await apiClient.get(`/candidate/results/${interviewId}`)
  return result.data
}

export const getPreparation = async () => {
  const result = await apiClient.get('/candidate/preparation')
  return result.data
}
