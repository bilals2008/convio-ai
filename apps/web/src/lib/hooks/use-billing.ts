import { useQuery, useMutation } from '@tanstack/react-query'
import { billing } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { toast } from 'sonner'

interface UsageData {
  month: number
  year: number
  conversations: number
  messages: number
  limit: number
  messagesPercent: number
}

interface PlanData {
  name: 'free' | 'pro' | 'enterprise'
  label: string
  price: string
  priceMonthly: number
}

export function useUsage() {
  const { orgId } = useOrg()

  return useQuery({
    queryKey: ['billing', 'usage', orgId],
    queryFn: () => billing.usage(orgId!).then((r) => r.data.data as UsageData),
    enabled: !!orgId,
    staleTime: 60_000,
    refetchInterval: 120_000,
  })
}

export function usePlan() {
  const { orgId } = useOrg()

  return useQuery({
    queryKey: ['billing', 'plan', orgId],
    queryFn: () => billing.plan(orgId!).then((r) => r.data.data as PlanData),
    enabled: !!orgId,
    staleTime: 300_000,
  })
}

export function useCheckout() {
  const { orgId } = useOrg()

  return useMutation({
    mutationFn: ({ planKey, billingPeriod }: { planKey: string; billingPeriod?: string }) =>
      billing.checkout(orgId!, planKey, billingPeriod),
    onSuccess: (res) => {
      const url = res?.data?.data?.checkoutUrl as string | undefined
      if (url) window.location.href = url
    },
    onError: () => {
      toast.error('Failed to start checkout. Please try again.')
    },
  })
}

export function usePortal() {
  const { orgId } = useOrg()

  return useMutation({
    mutationFn: () => billing.portal(orgId!),
    onSuccess: (res) => {
      const url = res?.data?.data?.url as string | undefined
      if (url) window.location.href = url
    },
  })
}
