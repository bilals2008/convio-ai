import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export interface SessionInfo {
  sessionId: string
  issuedAt: number
  expiresAt: number
  device: DeviceInfo
}

export interface DeviceInfo {
  browser: string
  os: string
  type: 'Desktop' | 'Mobile' | 'Tablet'
}

function parseUserAgent(ua: string): DeviceInfo {
  const browser = (() => {
    if (/edg\//i.test(ua)) return 'Edge'
    if (/opr\/|opera/i.test(ua)) return 'Opera'
    if (/chrome|crios|crmo/i.test(ua)) return 'Chrome'
    if (/firefox|fxios/i.test(ua)) return 'Firefox'
    if (/safari/i.test(ua)) return 'Safari'
    return 'Browser'
  })()

  const os = (() => {
    if (/windows/i.test(ua)) return 'Windows'
    if (/macintosh|mac os x/i.test(ua)) return 'macOS'
    if (/android/i.test(ua)) return 'Android'
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS'
    if (/linux/i.test(ua)) return 'Linux'
    return 'Unknown'
  })()

  const type: DeviceInfo['type'] = /android|iphone|ipad|ipod|mobile|windows phone/i.test(ua)
    ? /ipad|tablet/i.test(ua)
      ? 'Tablet'
      : 'Mobile'
    : 'Desktop'

  return { browser, os, type }
}

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    const padded = part + '==='.slice((part.length + 3) % 4)
    const json = atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(json)
  } catch {
    return null
  }
}

export function useCurrentSession() {
  return useQuery<SessionInfo | null>({
    queryKey: ['auth', 'current-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return null

      const payload = decodeJwt(session.access_token)
      const sessionId =
        (payload?.['jti'] as string | undefined) ??
        (payload?.['session_id'] as string | undefined) ??
        session.user.id
      const issuedAt = (payload?.['iat'] as number | undefined) ?? session.user.created_at ?? Date.now()
      const expiresAt =
        (payload?.['exp'] as number | undefined) ??
        (session.expires_at ? session.expires_at : (issuedAt + 3600))

      return {
        sessionId,
        issuedAt: issuedAt * 1000,
        expiresAt: expiresAt * 1000,
        device: parseUserAgent(navigator.userAgent),
      }
    },
    staleTime: 60 * 1000,
    retry: false,
  })
}

export function useSignOutAll() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'session'], null)
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}

export function useSignOutOthers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut({ scope: 'others' })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'current-session'] })
    },
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (input: { newPassword: string }) => {
      const { error } = await supabase.auth.updateUser({ password: input.newPassword })
      if (error) throw error
    },
  })
}

export { parseUserAgent, decodeJwt }
