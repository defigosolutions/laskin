import { apiClient, setAccessToken } from '../lib/apiClient'

// ─── Types matching the real API response ─────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: string
  branchId: string | null
}

interface LoginApiResponse {
  data: {
    accessToken: string
    refreshToken: string
    user: AuthUser
  }
}

interface RefreshApiResponse {
  data: {
    accessToken: string
  }
}

// ─── Storage keys ─────────────────────────────────────────────────────────────

const LS_REFRESH = 'laskin_refresh_token'
const LS_USER    = 'laskin_user'

// ─── Auth service ─────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Authenticate with email + password.
   * Stores refreshToken in localStorage; keeps accessToken in memory via apiClient.
   */
  async login(email: string, password: string): Promise<AuthUser> {
    const { data } = await apiClient.post<LoginApiResponse>('/admin/auth/login', { email, password })
    const { accessToken, refreshToken, user } = data.data

    setAccessToken(accessToken)
    localStorage.setItem(LS_REFRESH, refreshToken)
    localStorage.setItem(LS_USER, JSON.stringify(user))

    return user
  },

  /**
   * Exchange a stored refresh token for a new access token.
   * Returns true on success, false if no token exists or the request fails.
   */
  async refresh(): Promise<boolean> {
    const refreshToken = localStorage.getItem(LS_REFRESH)
    if (!refreshToken) return false

    try {
      const { data } = await apiClient.post<RefreshApiResponse>('/admin/auth/refresh', { refreshToken })
      setAccessToken(data.data.accessToken)
      return true
    } catch {
      authService.clearSession()
      return false
    }
  },

  /**
   * Invalidate the session on the backend, then clear local state.
   * Fire-and-forget on network errors — we always clear locally.
   */
  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem(LS_REFRESH)
    if (refreshToken) {
      try {
        await apiClient.post('/admin/auth/logout', { refreshToken })
      } catch {
        // Best-effort — clear locally regardless
      }
    }
    authService.clearSession()
  },

  /** Return the user stored from the last successful login. */
  getStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(LS_USER)
      return raw ? (JSON.parse(raw) as AuthUser) : null
    } catch {
      return null
    }
  },

  /** Remove all tokens and user data from storage and memory. */
  clearSession(): void {
    setAccessToken(null)
    localStorage.removeItem(LS_REFRESH)
    localStorage.removeItem(LS_USER)
  },
}
