import { useMemo } from 'react'
import { usePlan } from '@/lib/hooks/use-billing'
import { getPlanFeatures, type PlanLimits } from '@/lib/pricing/config'

// The API sends the limits this organization is actually enforced against, and sends
// null for unlimited (Infinity does not survive JSON). Prefer those over the local copy.
function toLimit(value: number | null | undefined): number | 'unlimited' {
  if (value === null || value === undefined) return 'unlimited'
  return value
}

export function usePlanFeatures() {
  const { data: plan } = usePlan()

  const features = useMemo<PlanLimits>(() => {
    const base = getPlanFeatures(plan?.name ?? 'free')
    if (!plan?.limits) return base
    return {
      ...base,
      agents: toLimit(plan.limits.agents),
      messagesPerMonth: toLimit(plan.limits.messagesPerMonth),
      knowledgeBases: toLimit(plan.limits.knowledgeBases),
    }
  }, [plan])

  return { features, plan }
}
