import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export interface Profile {
  id: string
  email: string
  name: string | null
  avatar: string | null
  createdAt: string
  updatedAt: string
}

export function useProfile() {
  return useQuery<Profile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await api.get('/users/me')
      return res.data.data
    },
    retry: false,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { name?: string; avatar?: string }) => {
      const res = await api.patch('/users/me', data)
      return res.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await api.delete('/users/me')
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'session'], null)
      queryClient.clear()
    },
  })
}
