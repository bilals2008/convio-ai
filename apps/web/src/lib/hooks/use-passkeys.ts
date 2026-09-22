import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import api from '@/lib/api'
import { toast } from '@/lib/toast'
import { getErrorMessage } from './useAuth'

export interface Passkey {
  id: string
  friendly_name?: string
  created_at: string
  last_used_at?: string
}

const PASSKEY_QUERY_KEY = ['auth', 'passkeys']

// Supabase returns machine codes; a raw `webauthn_verification_failed` in a
// toast tells the user nothing.
const PASSKEY_ERROR_MESSAGES: Record<string, string> = {
  passkey_disabled: 'Passkeys are not enabled for this project yet.',
  too_many_passkeys: 'You have reached the maximum number of passkeys for this account.',
  webauthn_credential_exists: 'This device is already registered as a passkey.',
  webauthn_credential_not_found: 'This passkey is not registered with your account.',
  webauthn_challenge_not_found: 'That request expired. Please try again.',
  webauthn_challenge_expired: 'That request expired. Please try again.',
  webauthn_verification_failed: 'Could not verify this passkey. Please try again.',
  email_not_confirmed: 'Confirm your email address before using a passkey.',
  phone_not_confirmed: 'Confirm your phone number before using a passkey.',
  user_banned: 'This account has been suspended.',
}

function passkeyErrorMessage(error: unknown, fallback: string): string {
  const err = error as { code?: string; name?: string; message?: string }

  // Thrown by navigator.credentials when the platform prompt is dismissed.
  if (err?.name === 'NotAllowedError' || err?.name === 'AbortError') {
    return 'Passkey prompt was dismissed'
  }
  if (err?.code && PASSKEY_ERROR_MESSAGES[err.code]) return PASSKEY_ERROR_MESSAGES[err.code]

  return getErrorMessage(error) || fallback
}

/**
 * WebAuthn is unavailable on insecure origins and in older browsers, so the UI
 * hides the passkey controls rather than offering a guaranteed failure.
 */
export function isPasskeySupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    !!navigator.credentials &&
    typeof navigator.credentials.create === 'function' &&
    typeof navigator.credentials.get === 'function'
  )
}

export function usePasskeys() {
  return useQuery<Passkey[]>({
    queryKey: PASSKEY_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.auth.passkey.list()
      if (error) throw error
      return (data ?? []) as Passkey[]
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useRegisterPasskey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.registerPasskey()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PASSKEY_QUERY_KEY })
      toast.success('Passkey added')
    },
    onError: (error) => {
      toast.error(passkeyErrorMessage(error, 'Could not add passkey'))
    },
  })
}

export function useRenamePasskey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { passkeyId: string; friendlyName: string }) => {
      const { error } = await supabase.auth.passkey.update({
        passkeyId: input.passkeyId,
        friendlyName: input.friendlyName,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PASSKEY_QUERY_KEY })
      toast.success('Passkey renamed')
    },
    onError: (error) => {
      toast.error(passkeyErrorMessage(error, 'Could not rename passkey'))
    },
  })
}

export function useDeletePasskey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { passkeyId: string }) => {
      const { error } = await supabase.auth.passkey.delete({ passkeyId: input.passkeyId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PASSKEY_QUERY_KEY })
      toast.success('Passkey removed')
    },
    onError: (error) => {
      toast.error(passkeyErrorMessage(error, 'Could not remove passkey'))
    },
  })
}

/**
 * Mirrors `useLogin`'s post-sign-in flow. Passkey sign-in never touches the
 * password path, so the session refresh, login-activity record and redirect
 * have to be repeated here or sign-in would silently land on a stale session.
 */
export function usePasskeyLogin(redirectTo?: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithPasskey()
      if (error) throw error
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
      api.post('/auth/login-activity', { userAgent: navigator.userAgent }).catch(() => {})
      const redirect = redirectTo
      if (redirect && !redirect.startsWith('/login')) {
        navigate(redirect, { replace: true })
        return
      }
      const pendingRedirect = sessionStorage.getItem('pendingBillingRedirect')
      if (pendingRedirect) {
        sessionStorage.removeItem('pendingBillingRedirect')
        navigate(`/settings/billing?${pendingRedirect}`, { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    },
    onError: (error) => {
      toast.error(passkeyErrorMessage(error, 'Could not sign in with passkey'))
    },
  })
}

export { passkeyErrorMessage }
