import axios, { type AxiosRequestConfig, type AxiosError } from 'axios'

const BASE_URL = (import.meta as ImportMeta & { env: Record<string, string> }).env?.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1'

// ─── In-memory access token ───────────────────────────────────────────────────
// Stored in memory only — never in localStorage — to reduce XSS exposure.
// The refresh token lives in localStorage and is used to re-issue access tokens.
let _accessToken: string | null = null

export const setAccessToken = (token: string | null): void => { _accessToken = token }
export const getAccessToken = (): string | null => _accessToken

// ─── Axios instance ───────────────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// Attach access token to every outgoing request
apiClient.interceptors.request.use((config) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`
  return config
})

// ─── 401 → refresh → retry ────────────────────────────────────────────────────
// Queues concurrent requests while a refresh is in flight, then replays them.

let _isRefreshing = false
let _refreshQueue: Array<(newToken: string) => void> = []

function drainQueue(newToken: string) {
  _refreshQueue.forEach((cb) => cb(newToken))
  _refreshQueue = []
}

type RetryableConfig = AxiosRequestConfig & { _retried?: boolean }

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const cfg = error.config as RetryableConfig | undefined

    // Only intercept 401s that haven't been retried yet
    if (error.response?.status !== 401 || !cfg || cfg._retried) {
      return Promise.reject(normaliseError(error))
    }

    // Don't retry auth endpoints (would cause infinite loops)
    if (cfg.url?.includes('/auth/')) {
      return Promise.reject(normaliseError(error))
    }

    cfg._retried = true

    if (!_isRefreshing) {
      _isRefreshing = true
      const storedRefresh = localStorage.getItem('laskin_refresh_token')

      if (!storedRefresh) {
        _isRefreshing = false
        clearSessionAndRedirect()
        return Promise.reject(normaliseError(error))
      }

      try {
        // Use a raw axios call — not apiClient — to avoid triggering this interceptor again
        const { data } = await axios.post<{ data: { accessToken: string } }>(
          `${BASE_URL}/admin/auth/refresh`,
          { refreshToken: storedRefresh },
          { headers: { 'Content-Type': 'application/json' } },
        )
        const newToken = data.data.accessToken
        setAccessToken(newToken)
        _isRefreshing = false
        drainQueue(newToken)
      } catch {
        _isRefreshing = false
        _refreshQueue = []
        clearSessionAndRedirect()
        return Promise.reject(normaliseError(error))
      }
    }

    // Enqueue this request to retry once the refresh resolves
    return new Promise((resolve) => {
      _refreshQueue.push((newToken: string) => {
        if (cfg.headers) cfg.headers.Authorization = `Bearer ${newToken}`
        resolve(apiClient(cfg))
      })
    })
  },
)

function clearSessionAndRedirect() {
  setAccessToken(null)
  localStorage.removeItem('laskin_refresh_token')
  localStorage.removeItem('laskin_user')
  window.location.replace('/admin-laskin/login')
}

// ─── Typed error shape ────────────────────────────────────────────────────────

export interface ApiError {
  code: string
  message: string
  details?: { formErrors: string[]; fieldErrors: Record<string, string[]> }
  status: number
}

function normaliseError(error: AxiosError): ApiError {
  const body = error.response?.data as { error?: Partial<ApiError> } | undefined
  
  let message = body?.error?.message ?? error.message ?? 'An unexpected error occurred.'
  
  if (body?.error?.details?.fieldErrors) {
    const fields = Object.entries(body.error.details.fieldErrors)
      .map(([field, msgs]) => `${field}: ${msgs.join(', ')}`)
    if (fields.length > 0) {
      message += '\n\n' + fields.join('\n')
    }
  }

  return {
    code:    body?.error?.code    ?? 'NETWORK_ERROR',
    message,
    details: body?.error?.details,
    status:  error.response?.status ?? 0,
  }
}
