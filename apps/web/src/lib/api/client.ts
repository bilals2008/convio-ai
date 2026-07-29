import axios from 'axios'
import { supabase } from '@/lib/supabase'
import { getFriendlyErrorMessage } from '@/lib/api/errors'
import { captureError } from '@/lib/error-tracking'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
})

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      captureError(error, { action: 'session-expired' })
      supabase.auth.signOut()
      const currentPath = window.location.pathname + window.location.search
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
      return Promise.reject(error)
    }
    const friendly = getFriendlyErrorMessage(error)
    error.friendlyMessage = friendly
    return Promise.reject(error)
  },
)

export default api
