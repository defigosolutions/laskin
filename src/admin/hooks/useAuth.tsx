import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, type AuthUser } from '../services/auth.service'
import type { ApiError } from '../lib/apiClient'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // On mount: restore user from storage and silently refresh the access token.
  // This handles page reloads — the accessToken is in-memory only.
  useEffect(() => {
    async function init() {
      const stored = authService.getStoredUser()
      if (!stored) {
        setLoading(false)
        return
      }

      // Optimistically set user so the UI doesn't flash to login
      setUser(stored)

      const ok = await authService.refresh()
      if (!ok) {
        // Refresh token expired or revoked — force re-login
        setUser(null)
      }

      setLoading(false)
    }
    init()
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const loggedInUser = await authService.login(email, password)
    setUser(loggedInUser)
    navigate('/admin-laskin/dashboard')
  }, [navigate])

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout()
    setUser(null)
    navigate('/admin-laskin/login')
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

/** Re-export so callers don't need a separate import */
export type { AuthUser, ApiError }
