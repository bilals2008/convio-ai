import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/lib/api'
import type { PlanConfig } from './config'

export function usePricingPlans() {
  return useQuery<PlanConfig[]>({
    queryKey: ['pricing', 'plans'],
    queryFn: async () => {
      const res = await publicApi.get<{ data: PlanConfig[] }>('/plans')
      return res.data.data
    },
    staleTime: 10 * 60 * 1000,
  })
}
