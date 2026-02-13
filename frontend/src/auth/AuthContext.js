import React, { createContext, useContext, useMemo, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'))
  const [authError, setAuthError] = useState(null)
  const [loading, setLoading] = useState(false)

  const login = async (username, password) => {
    setLoading(true)
    setAuthError(null)
    try {
      const data = await authService.login(username, password)
      localStorage.setItem('auth_token', data.token)
      if (data.expiresAt) {
        localStorage.setItem('auth_expires_at', data.expiresAt)
      }
      setToken(data.token)
      return true
    } catch (error) {
      setAuthError(error?.response?.data?.message || 'Login failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_expires_at')
    setToken(null)
  }

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
      loading,
      authError,
    }),
    [token, loading, authError],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
