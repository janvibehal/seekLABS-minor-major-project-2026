const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

// Access tokens are short-lived (15m) and kept in memory only - never in
// localStorage/sessionStorage. The refresh token lives in an httpOnly
// cookie set by the backend, so a page reload just calls /auth/refresh.
let accessToken = null
let onUnauthorized = null

export const setAccessToken = (token) => {
  accessToken = token
}

export const getAccessToken = () => accessToken

// Registered by AuthContext so the client can clear state on a hard 401.
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

const rawRequest = async (path, { method = 'GET', body, skipAuth = false } = {}) => {
  const headers = { 'Content-Type': 'application/json' }

  if (!skipAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include', // send/receive the refresh-token cookie
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  let payload
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  return { response, payload }
}

const refreshAccessToken = async () => {
  const { response, payload } = await rawRequest('/auth/refresh', {
    method: 'POST',
    skipAuth: true,
  })

  if (!response.ok || !payload?.success) {
    return false
  }

  setAccessToken(payload.data.accessToken)
  return true
}

export const apiRequest = async (path, options = {}) => {
  let { response, payload } = await rawRequest(path, options)

  // Access token expired mid-session - refresh once and retry.
  if (response.status === 401 && !options.skipAuth && !options.skipRefresh) {
    const refreshed = await refreshAccessToken()

    if (refreshed) {
      ;({ response, payload } = await rawRequest(path, options))
    } else {
      onUnauthorized?.()
    }
  }

  if (!response.ok || !payload?.success) {
    const message = payload?.message || 'Something went wrong. Please try again.'
    throw new ApiError(message, response.status, payload?.errors)
  }

  return payload
}

export const apiClient = {
  get: (path) => apiRequest(path, { method: 'GET' }),
  post: (path, body) => apiRequest(path, { method: 'POST', body }),
  refreshAccessToken,
}
