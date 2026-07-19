import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { billing } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { useCheckout } from '@/lib/hooks/use-billing'
import { pricingConfig } from '@/lib/pricing/config'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/shared/page-header'
import { UsageAlert } from '@/components/shared/usage-alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/shared/loading'
import { toast } from 'sonner'
import {
  AlertTriangle,
  Zap,
  Shield,
  Star,
  Check,
  CreditCard,
  Calendar,
  Settings,
  Crown,
  Clock,
  Receipt,
  ArrowUpRight,
  Infinity as InfinityIcon,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const planIcons = { zap: Zap, shield: Shield, star: Star, crown: Crown } as const

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(date: string) {
  const diff = new Date(date).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function getUsageColor(percent: number) {
  if (percent >= 100) return 'text-destructive'
  if (percent >= 85) return 'text-warning'
  if (percent >= 60) return 'text-yellow-500'
  return 'text-success'
}

function getProgressColor(percent: number) {
  if (percent >= 100) return 'bg-destructive'
  if (percent >= 85) return 'bg-warning'
  if (percent >= 60) return 'bg-yellow-500'
  return 'bg-success'
}

const subStatusBadge: Record<string, 'active' | 'past_due' | 'trialing' | 'canceled' | 'default'> = {
  active: 'active',
  past_due: 'past_due',
  on_trial: 'trialing',
  trialing: 'trialing',
  cancelled: 'canceled',
}

export default function BillingPage() {
  const { orgId } = useOrg()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [isYearly, setIsYearly] = useState(false)
  const checkout = useCheckout()
  const triggeredRef = useRef(false)

  useEffect(() => {
    const planParam = searchParams.get('plan')
    const billingParam = searchParams.get('billing')
    const checkoutSuccess = searchParams.get('checkout')

    if (checkoutSuccess === 'success') {
      toast.success('Payment successful! Your plan has been updated.')
      plan.refetch()
      subscription.refetch()
      setSearchParams({}, { replace: true })
      return
    }

    if (planParam && orgId && !triggeredRef.current) {
      triggeredRef.current = true
      checkout.mutate(
        { planKey: planParam, billingPeriod: billingParam || 'monthly' },
        {
          onError: () => {
            triggeredRef.current = false
            toast.error('Failed to start checkout. Please try again.')
          },
        },
      )
      setSearchParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgId, searchParams])

  const plan = useQuery({
    queryKey: ['billing', 'plan', orgId],
    queryFn: () => billing.plan(orgId!).then((r) => r.data.data),
    enabled: !!orgId,
  })

  const usage = useQuery({
    queryKey: ['billing', 'usage', orgId],
    queryFn: () => billing.usage(orgId!).then((r) => r.data.data),
    enabled: !!orgId,
  })

  const subscription = useQuery({
    queryKey: ['billing', 'subscription', orgId],
    queryFn: () => billing.subscription(orgId!).then((r) => r.data.data),
    enabled: !!orgId,
  })

  const invoices = useQuery({
    queryKey: ['billing', 'invoices', orgId],
    queryFn: () => billing.invoices(orgId!).then((r) => r.data.data),
    enabled: !!orgId,
  })

  const portal = useMutation({
    mutationFn: () => billing.portal(orgId!),
    onSuccess: (res) => {
      const url = res?.data?.data?.url
      if (url) window.location.href = url
    },
  })

  const currentPlan = plan.data
  const sub = subscription.data
  const currentPlanConfig = pricingConfig.plans.find((p) => p.key === currentPlan?.name)
  const nextBilling = sub?.renewsAt
  const isTrialing = sub?.status === 'on_trial' || sub?.status === 'trialing'
  const trialEndsAt = sub?.trialEndsAt
  const isCancelled = sub?.cancelAtPeriodEnd
  const usagePercent = usage.data?.messagesPercent ?? 0
  const messageUsage = usage.data?.messages ?? 0
  const messageLimit = usage.data?.limit ?? 0
  const isPaid = currentPlan?.name === 'pro' || currentPlan?.name === 'business' || currentPlan?.name === 'enterprise'

  if (plan.isPending || usage.isPending || !plan.data || !usage.data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your subscription, usage, and payment methods"
      />

      <UsageAlert variant="banner" />

      {/* Main Plan + Usage — single section */}
      <div className="rounded-lg border bg-card p-5 space-y-5">
        {/* Top row: plan info + price + CTA */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              {currentPlanConfig?.icon && (() => {
                const Icon = planIcons[currentPlanConfig.icon]
                return <Icon className="size-5 text-primary" />
              })()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{currentPlan?.label || 'Free'}</span>
                {isPaid && sub && (
                  <Badge variant={subStatusBadge[sub.status] || 'default'} className="h-4 px-1.5 text-[10px]">
                    {sub.status?.replace('_', ' ') ?? 'unknown'}
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl font-bold">{currentPlan?.price || '$0'}</span>
                {currentPlan?.priceMonthly !== undefined && currentPlan.priceMonthly > 0 && (
                  <span className="text-xs text-muted-foreground">/mo</span>
                )}
              </div>
            </div>
          </div>
          {currentPlan?.name === 'free' || currentPlan?.name === 'pro' || currentPlan?.name === 'business' ? (
            <Button size="sm" className="h-8 text-xs gap-1" onClick={() => setShowUpgradeDialog(true)}>
              <ArrowUpRight className="size-3.5" />
              {currentPlan?.name === 'free' ? 'Upgrade' : 'Change plan'}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1"
              onClick={() => portal.mutate()}
              disabled={portal.isPending}
            >
              <Settings className="size-3.5" />
              Manage subscription
            </Button>
          )}
        </div>

        {/* Billing info row */}
        {(isPaid || isTrialing) && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3">
            {nextBilling && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3" />
                {isCancelled ? 'Expires' : 'Renews'} {formatDate(nextBilling)}
              </span>
            )}
            {isTrialing && trialEndsAt && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-3" />
                Trial ends {formatDate(trialEndsAt)} ({daysUntil(trialEndsAt)}d left)
              </span>
            )}
            {isCancelled && (
              <span className="flex items-center gap-1.5 text-warning">
                <AlertTriangle className="size-3" />
                Auto-renewal off
              </span>
            )}
          </div>
        )}

        {/* Usage */}
        <div className="space-y-3 border-t border-border/50 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Messages this period</span>
            <span className="text-[10px] text-muted-foreground">
              Resets {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={cn('font-semibold tabular-nums', getUsageColor(usagePercent))}>
                {messageUsage.toLocaleString()}
                {messageLimit === Infinity ? (
                  <span className="text-muted-foreground font-normal ml-1">used</span>
                ) : (
                  <span className="text-muted-foreground font-normal ml-1">/ {messageLimit.toLocaleString()}</span>
                )}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {messageLimit === Infinity ? (
                  <span className="flex items-center gap-1"><InfinityIcon className="size-3" /> unlimited</span>
                ) : (
                  <span className={cn(getUsageColor(usagePercent))}>{Math.max(0, messageLimit - messageUsage).toLocaleString()} left</span>
                )}
              </span>
            </div>
            {messageLimit !== Infinity && (
              <div className="relative h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', getProgressColor(usagePercent))}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            )}
            {usagePercent >= 85 && usagePercent < 100 && (
              <p className="text-[10px] text-warning flex items-center gap-1">
                <AlertTriangle className="size-2.5" />
                {100 - usagePercent}% remaining — consider upgrading
              </p>
            )}
            {usagePercent >= 100 && (
              <p className="text-[10px] text-destructive flex items-center gap-1">
                <AlertTriangle className="size-2.5" />
                Limit reached — upgrade for more
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Conversations: <span className="font-medium text-foreground tabular-nums">{(usage.data?.conversations ?? 0).toLocaleString()}</span></span>
          </div>
        </div>

        {/* Features */}
        <div className="border-t border-border/50 pt-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Included</p>
          <div className="flex flex-wrap gap-1.5">
            {(currentPlan?.features ?? ['1 agent']).map((feature: string, i: number) => (
              <span key={i} className="inline-flex items-center gap-1 rounded bg-muted/70 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                <Check className="size-2.5 text-success" />
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade Options — flat list, no card */}
      {currentPlan?.name !== 'enterprise' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Available Plans</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">Monthly</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative inline-flex h-4 w-8 items-center rounded-full transition-colors bg-muted"
              >
                <span className={`inline-block size-3 rounded-full bg-white transition-transform ${isYearly ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-[10px] text-muted-foreground">Yearly</span>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pricingConfig.plans
              .filter((p) => {
                if (currentPlan?.name === 'free') return p.key === 'pro' || p.key === 'business' || p.key === 'enterprise'
                if (currentPlan?.name === 'pro') return p.key === 'business' || p.key === 'enterprise'
                if (currentPlan?.name === 'business') return p.key === 'enterprise'
                return false
              })
              .map((plan) => {
                const Icon = plan.icon ? planIcons[plan.icon] : Zap
                const price = isYearly ? (plan.yearlyPrice || plan.price) : plan.price
                return (
                  <div key={plan.key} className="flex flex-col rounded-lg border bg-card p-4 gap-3 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-semibold truncate">{plan.name}</span>
                        {plan.badge && (
                          <Badge variant="secondary" className="h-4 px-1.5 text-[9px] shrink-0">{plan.badge}</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold">{price}</span>
                      {plan.period && <span className="text-xs text-muted-foreground">{plan.period}</span>}
                    </div>
                    <ul className="space-y-1 flex-1">
                      {plan.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Check className="size-3 text-success shrink-0" />
                          <span className="truncate">{f.text}</span>
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-[10px] text-muted-foreground pl-4.5">
                          +{plan.features.length - 4} more
                        </li>
                      )}
                    </ul>
                    <Button
                      size="sm"
                      variant={plan.variant}
                      className="h-8 text-xs gap-1 w-full"
                      onClick={() => checkout.mutate({ planKey: plan.key, billingPeriod: isYearly ? 'yearly' : 'monthly' })}
                      disabled={checkout.isPending}
                    >
                      {plan.cta}
                      <ArrowUpRight className="size-3" />
                    </Button>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Payment + Invoices — flat section */}
      {isPaid && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment & History</h3>
          <div className="rounded-lg border bg-card divide-y divide-border/50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2.5">
                <CreditCard className="size-4 text-muted-foreground" />
                <span className="text-sm">Payment method</span>
                <span className="text-xs text-muted-foreground">Managed via Creem</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => portal.mutate()} disabled={portal.isPending}>
                Update
              </Button>
            </div>
            {invoices.data && invoices.data.length > 0 ? (
              invoices.data.slice(0, 3).map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Receipt className="size-3.5 text-muted-foreground" />
                    <span className="text-xs">{formatDate(invoice.paidAt || invoice.createdAt)}</span>
                    <span className="text-[10px] text-muted-foreground">{invoice.invoiceNumber || 'Invoice'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium tabular-nums">{formatCurrency(invoice.total, invoice.currency)}</span>
                    <Badge
                      variant={invoice.status === 'paid' ? 'active' : invoice.status === 'draft' ? 'secondary' : 'destructive'}
                      className="h-3.5 px-1 text-[9px]"
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-4 text-center">
                <p className="text-xs text-muted-foreground">No invoices yet</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Danger Zone — flat, no card */}
      {isPaid && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-destructive uppercase tracking-wider">Danger Zone</h3>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Cancel subscription</p>
              <p className="text-xs text-muted-foreground">
                {isCancelled
                  ? 'Your subscription ends at the current billing period'
                  : 'Revert to Free plan after the current billing period'}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="h-7 text-xs shrink-0"
              onClick={() => portal.mutate()}
              disabled={portal.isPending || isCancelled}
            >
              {isCancelled ? 'Cancelled' : 'Cancel'}
            </Button>
          </div>
        </div>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="size-4 text-primary" />
                Upgrade Your Plan
              </DialogTitle>
              <DialogDescription>Choose the plan that fits your needs</DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center gap-2 pb-3 border-b border-border/50">
              <span className="text-xs text-muted-foreground">Monthly</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative inline-flex h-4 w-8 items-center rounded-full transition-colors bg-muted"
              >
                <span className={`inline-block size-3 rounded-full bg-white transition-transform ${isYearly ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-xs text-muted-foreground">Yearly</span>
            </div>
            <div className="divide-y divide-border/50">
            {pricingConfig.plans.filter((p) => p.key !== 'free').map((plan) => {
              const Icon = plan.icon ? planIcons[plan.icon] : Zap
              return (
                  <button
                    key={plan.key}
                    className="w-full text-left flex items-center gap-3 py-3 first:pt-0 last:pb-0 transition-colors hover:bg-muted/50"
                    onClick={() => { setShowUpgradeDialog(false); checkout.mutate({ planKey: plan.key, billingPeriod: isYearly ? 'yearly' : 'monthly' }) }}
                    disabled={checkout.isPending}
                  >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{plan.name}</span>
                      {plan.badge && <Badge className="h-3.5 px-1 text-[9px]">{plan.badge}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-semibold">{plan.price}</span>
                    {plan.period && <p className="text-[10px] text-muted-foreground">{plan.period}</p>}
                  </div>
                </button>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
