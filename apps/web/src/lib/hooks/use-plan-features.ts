import { useMemo } from 'react'
import { usePlan } from '@/lib/hooks/use-billing'
import { getPlanFeatures, type PlanLimits } from '@/lib/pricing/config'

export function usePlanFeatures() {
  const { data: plan } = usePlan()

  const features = useMemo<PlanLimits>(() => {
    if (!plan) return getPlanFeatures('free')
    return getPlanFeatures(plan.name)
  }, [plan])

  return { features, plan }
}
