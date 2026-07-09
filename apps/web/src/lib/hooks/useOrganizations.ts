import { useQuery } from '@tanstack/react-query'
import { organizations as orgsApi } from '@/lib/api'

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  plan?: string
  role?: string
}

export function useOrganizations() {
  return useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const res = await orgsApi.list()
      return (res.data.data || []) as Organization[]
    },
    retry: false,
  })
}
