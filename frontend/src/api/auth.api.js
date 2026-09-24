import { apiClient, apiRequest, setAccessToken } from '../lib/apiClient.js'

const getUser = (data) => data?.user ?? data ?? null

export const register = async ({
  firstName,
  lastName,
  email,
  password,
}) => {
  const result = await apiRequest('/auth/register', {
    method: 'POST',
    body: {
      firstName,
      lastName,
      email,
      password,
    },
    skipAuth: true,
  })

  return result.data
}


export const login = async ({ email, password }) => {
  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: {
      email,
      password,
    },
    skipAuth: true,
  })

  setAccessToken(result.accessToken)

  return getUser(result.data)
}


export const refresh = async () => {
  try {
    const result = await apiRequest('/auth/refresh', {
      method: 'POST',
      skipAuth: true,
      skipRefresh: true,
    })

    setAccessToken(result.data.accessToken)

    return getUser(result.data)
  } catch {
    return null
  }
}


export const me = async () => {
  const result = await apiClient.get('/auth/me')

  return getUser(result.data)
}


export const logout = async () => {
  await apiRequest('/auth/logout', {
    method: 'POST',
    skipRefresh: true,
  })

  setAccessToken(null)
}