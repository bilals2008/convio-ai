import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from '@/lib/toast'

export interface User {
  id: string
  name: string | null
  email: string
  avatar: string | null
}

export interface Session {
  user: User
}

function getErrorMessage(error: unknown): string {
  const err = error as { message?: string }
  return err.message || 'An unexpected error occurred'
}

export function useSession() {
  return useQuery<Session | null>({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return null

      return {
        user: {
          id: session.user.id,
          name: session.user.user_metadata?.name ?? null,
          email: session.user.email ?? '',
          avatar: session.user.user_metadata?.avatar ?? null,
        },
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnMount: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword(input)
      if (error) throw error
      return data
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
      const pendingRedirect = sessionStorage.getItem('pendingBillingRedirect')
      if (pendingRedirect) {
        sessionStorage.removeItem('pendingBillingRedirect')
        navigate(`/settings/billing?${pendingRedirect}`, { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useSignup() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (input: { email: string; password: string; name: string }) => {
      const { data, error } = await supabase.auth.signUp({
        ...input,
        options: { data: { name: input.name } },
      })
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      if (data.session) {
        queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
        const pendingRedirect = sessionStorage.getItem('pendingBillingRedirect')
        if (pendingRedirect) {
          sessionStorage.removeItem('pendingBillingRedirect')
          navigate(`/settings/billing?${pendingRedirect}`, { replace: true })
        } else {
          navigate('/login', { replace: true })
        }
      } else {
        navigate('/login', { replace: true })
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'session'], null)
      queryClient.clear()
      navigate('/login', { replace: true })
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (input: { email: string }) => {
      const { error } = await supabase.auth.resetPasswordForEmail(input.email)
      if (error) throw error
    },
    onError: (error) => {
      toast.error(getErrorMessage(error))
    },
  })
}

export interface Identity {
  id: string
  provider: string
  email: string | null
  createdAt: string
}

export function useIdentities() {
  return useQuery<Identity[]>({
    queryKey: ['auth', 'identities'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user?.identities) return []

      return user.identities.map((identity) => ({
        id: identity.id,
        provider: identity.provider,
        email: identity.identity_data?.email ?? null,
        createdAt: identity.created_at,
      }))
    },
    staleTime: 5 * 60 * 1000,
  })
}

export { getErrorMessage }
