import { useQuery } from '@tanstack/react-query'
import { publicApi } from '@/lib/api'
import { mergePlanLimits, type PlanConfig } from './config'

export function usePricingPlans() {
  return useQuery<PlanConfig[]>({
    queryKey: ['pricing', 'plans'],
    queryFn: async () => {
      const res = await publicApi.get<{ data: PlanConfig[] }>('/plans')
      // The API returns the limits billing enforces; the local config only supplies the
      // capability flags it does not send. Merging here keeps every consumer honest.
      return res.data.data.map((plan) => ({
        ...plan,
        limits: mergePlanLimits(plan.limits, plan.key),
      }))
    },
    staleTime: 10 * 60 * 1000,
  })
}
