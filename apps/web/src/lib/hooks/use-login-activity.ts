import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export interface LoginActivityItem {
  id: string
  device: string
  browser: string | null
  os: string | null
  location: string | null
  ipAddress: string
  status: string
  createdAt: string
}

export function useLoginActivity() {
  return useQuery<LoginActivityItem[]>({
    queryKey: ['login-activity'],
    queryFn: async () => {
      const res = await api.get('/auth/login-activity')
      return res.data.data
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  })
}
