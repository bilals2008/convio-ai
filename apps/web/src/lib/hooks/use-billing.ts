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
  name: 'free' | 'pro' | 'business' | 'enterprise'
  label: string
  features: string[]
  limits: { agents: number; messagesPerMonth: number; knowledgeBases: number }
  price: string
  priceMonthly: number
}

interface SubscriptionData {
  id: string
  customerId: string
  plan: string
  status: string
  trialEndsAt: string | null
  renewsAt: string | null
  endsAt: string | null
  cancelAtPeriodEnd: boolean
  createdAt: string
}

interface InvoiceData {
  id: string
  subscriptionId: string | null
  providerInvoiceId: string
  invoiceNumber: string | null
  status: string
  total: number
  currency: string
  invoiceUrl: string | null
  paidAt: string | null
  billingReason: string | null
  createdAt: string
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

export function useClaimPro() {
  const { orgId } = useOrg()

  return useMutation({
    mutationFn: () => billing.claimPro(orgId!),
    onSuccess: () => {
      toast.success('Pro plan activated! Welcome to Pro.')
    },
    onError: () => {
      toast.error('Failed to claim Pro plan. Please try again.')
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
    onError: () => {
      toast.error('Failed to open billing portal. Please try again.')
    },
  })
}

export function useSubscription() {
  const { orgId } = useOrg()

  return useQuery({
    queryKey: ['billing', 'subscription', orgId],
    queryFn: () =>
      billing.subscription(orgId!).then((r) => (r.data.data as SubscriptionData | null) ?? null),
    enabled: !!orgId,
    staleTime: 60_000,
  })
}

export function useInvoices() {
  const { orgId } = useOrg()

  return useQuery({
    queryKey: ['billing', 'invoices', orgId],
    queryFn: () =>
      billing.invoices(orgId!).then((r) => (r.data.data as InvoiceData[]) ?? []),
    enabled: !!orgId,
    staleTime: 60_000,
  })
}
