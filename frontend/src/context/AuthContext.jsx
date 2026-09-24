import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import * as authApi from '../api/auth.api.js'
import { setUnauthorizedHandler } from '../lib/apiClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'authenticated' | 'unauthenticated'

  useEffect(() => {
    let cancelled = false

    authApi.refresh().then((restoredUser) => {
      if (cancelled) return

      if (restoredUser) {
        setUser(restoredUser)
        setStatus('authenticated')
      } else {
        setStatus('unauthenticated')
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      setStatus('unauthenticated')
    })

    return () => setUnauthorizedHandler(null)
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const loggedInUser = await authApi.login({ email, password })
    setUser(loggedInUser)
    setStatus('authenticated')
    return loggedInUser
  }, [])

  const register = useCallback(async (input) => {
    return authApi.register(input)
  }, [])

  const logout = useCallback(async () => {
    await authApi.logout()
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const value = {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
