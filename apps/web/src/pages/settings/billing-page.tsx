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
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
  MessageSquare,
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

interface Invoice {
  id: string
  invoiceNumber?: string
  total: number
  currency: string
  status: string
  paidAt?: string
  createdAt?: string
}

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
  const conversations = usage.data?.conversations ?? 0

  const planIconName = currentPlanConfig?.icon ?? 'zap'
  const PlanIcon = planIcons[planIconName] ?? Zap
  const resetDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
    .toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const upcomingPlans = pricingConfig.plans.filter((p) => {
    if (currentPlan?.name === 'free') return p.key === 'pro' || p.key === 'business' || p.key === 'enterprise'
    if (currentPlan?.name === 'pro') return p.key === 'business' || p.key === 'enterprise'
    if (currentPlan?.name === 'business') return p.key === 'enterprise'
    return false
  })

  if (plan.isPending || usage.isPending || !plan.data || !usage.data) {
    return (
      <div className="space-y-6 max-w-5xl">
        <PageHeader title="Billing" description="Manage your subscription, usage, and payment methods" />
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-5">
          <Skeleton className="h-56 w-full rounded-xl md:col-span-3" />
          <Skeleton className="h-56 w-full rounded-xl md:col-span-2" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Billing"
        description="Manage your subscription, usage, and payment methods"
        action={
          <div className="flex items-center gap-2">
            {isPaid && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => portal.mutate()}
                disabled={portal.isPending}
              >
                <Settings className="size-3.5" />
                Manage
              </Button>
            )}
            {(currentPlan?.name === 'free' || currentPlan?.name === 'pro' || currentPlan?.name === 'business') && (
              <Button size="sm" onClick={() => setShowUpgradeDialog(true)}>
                <ArrowUpRight className="size-3.5" />
                {currentPlan?.name === 'free' ? 'Upgrade' : 'Change plan'}
              </Button>
            )}
          </div>
        }
      />

      <UsageAlert variant="banner" />

      {/* ── Plan Hero ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl ring-1 ring-foreground/10 bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-transparent" />
        <div className="relative p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <PlanIcon className="size-6 text-primary" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-bold tracking-tight">
                  {currentPlan?.label || 'Free'}
                </h2>
                {isPaid && sub && (
                  <Badge variant={subStatusBadge[sub.status] || 'default'} className="text-[11px] capitalize">
                    {sub.status?.replace('_', ' ') ?? 'unknown'}
                  </Badge>
                )}
                {currentPlanConfig?.badge && (
                  <Badge variant="secondary" className="text-[11px]">
                    {currentPlanConfig.badge}
                  </Badge>
                )}
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold tabular-nums">{currentPlan?.price || '$0'}</span>
                {currentPlan?.priceMonthly !== undefined && currentPlan.priceMonthly > 0 && (
                  <span className="text-xs text-muted-foreground">/month</span>
                )}
              </div>

              {(isPaid || isTrialing) && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground pt-1">
                  {nextBilling && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      {isCancelled ? 'Expires' : 'Renews'} {formatDate(nextBilling)}
                    </span>
                  )}
                  {isTrialing && trialEndsAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      Trial ends {formatDate(trialEndsAt)} ({daysUntil(trialEndsAt)}d left)
                    </span>
                  )}
                  {isCancelled && (
                    <span className="inline-flex items-center gap-1.5 text-warning">
                      <AlertTriangle className="size-3.5" />
                      Auto-renewal off
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Usage + Features Grid ──────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* Left — Usage */}
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageSquare className="size-4 text-muted-foreground" />
                Usage this period
              </CardTitle>
              <CardDescription>Resets on {resetDate}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-end justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className={cn('text-2xl font-bold tabular-nums', getUsageColor(usagePercent))}>
                      {messageUsage.toLocaleString()}
                    </span>
                    {messageLimit === Infinity ? (
                      <span className="text-xs text-muted-foreground">used</span>
                    ) : (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        / {messageLimit.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {messageLimit === Infinity ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <InfinityIcon className="size-3.5" />
                      Unlimited
                    </span>
                  ) : (
                    <span className={cn('text-xs tabular-nums', getUsageColor(usagePercent))}>
                      {Math.max(0, messageLimit - messageUsage).toLocaleString()} left
                    </span>
                  )}
                </div>
                {messageLimit !== Infinity && (
                  <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all duration-500', getProgressColor(usagePercent))}
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                )}
                {usagePercent >= 85 && usagePercent < 100 && (
                  <p className="text-[11px] text-warning inline-flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    {100 - usagePercent}% remaining — consider upgrading
                  </p>
                )}
                {usagePercent >= 100 && (
                  <p className="text-[11px] text-destructive inline-flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    Limit reached — upgrade for more
                  </p>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/40 px-3 py-2.5">
                  <p className="text-[11px] text-muted-foreground">Conversations</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums">
                    {conversations.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg bg-muted/40 px-3 py-2.5">
                  <p className="text-[11px] text-muted-foreground">Plan</p>
                  <p className="mt-0.5 text-sm font-semibold capitalize">{currentPlan?.label || 'Free'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — Included Features */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Star className="size-4 text-muted-foreground" />
                Included
              </CardTitle>
              <CardDescription>Features in your current plan</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {(currentPlan?.features ?? ['1 agent']).map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-success/10">
                      <Check className="size-3 text-success" />
                    </span>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Available Plans ───────────────────────────────── */}
      {currentPlan?.name !== 'enterprise' && upcomingPlans.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                  Available plans
                </CardTitle>
                <CardDescription className="mt-0.5">
                  Switch or upgrade your subscription
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-xs', !isYearly ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                  Monthly
                </span>
                <Switch checked={isYearly} onCheckedChange={setIsYearly} />
                <span className={cn('text-xs', isYearly ? 'font-medium text-foreground' : 'text-muted-foreground')}>
                  Yearly
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingPlans.map((planItem) => {
                const Icon = planItem.icon ? planIcons[planItem.icon] : Zap
                const price = isYearly ? (planItem.yearlyPrice || planItem.price) : planItem.price
                return (
                  <div
                    key={planItem.key}
                    className="flex flex-col rounded-xl border border-border/60 bg-card p-4 gap-3 transition-colors hover:border-primary/40 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-sm font-semibold truncate">{planItem.name}</span>
                        {planItem.badge && (
                          <Badge variant="secondary" className="h-4 px-1.5 text-[9px] shrink-0">
                            {planItem.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold tabular-nums">{price}</span>
                      {planItem.period && (
                        <span className="text-xs text-muted-foreground">{planItem.period}</span>
                      )}
                    </div>
                    <ul className="space-y-1.5 flex-1">
                      {planItem.features.slice(0, 4).map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <Check className="size-3 text-success shrink-0" />
                          <span className="truncate">{f.text}</span>
                        </li>
                      ))}
                      {planItem.features.length > 4 && (
                        <li className="text-[10px] text-muted-foreground pl-4.5">
                          +{planItem.features.length - 4} more
                        </li>
                      )}
                    </ul>
                    <Button
                      size="sm"
                      variant={planItem.variant}
                      className="w-full"
                      onClick={() =>
                        checkout.mutate({
                          planKey: planItem.key,
                          billingPeriod: isYearly ? 'yearly' : 'monthly',
                        })
                      }
                      disabled={checkout.isPending}
                    >
                      {planItem.cta}
                      <ArrowUpRight className="size-3.5" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Payment & Invoices ────────────────────────────── */}
      {isPaid && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CreditCard className="size-4 text-muted-foreground" />
                  Payment &amp; history
                </CardTitle>
                <CardDescription className="mt-0.5">
                  Managed via Creem · view past invoices
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => portal.mutate()}
                disabled={portal.isPending}
              >
                Update
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-0 divide-y divide-foreground/5">
            {invoices.data && invoices.data.length > 0 ? (
              invoices.data.slice(0, 5).map((invoice: Invoice) => (
                <div key={invoice.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Receipt className="size-3.5 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {invoice.invoiceNumber || 'Invoice'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(invoice.paidAt || invoice.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium tabular-nums">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </span>
                    <Badge
                      variant={
                        invoice.status === 'paid'
                          ? 'active'
                          : invoice.status === 'draft'
                            ? 'secondary'
                            : 'destructive'
                      }
                      className="capitalize text-[10px]"
                    >
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                icon={Receipt}
                title="No invoices yet"
                description="Invoices will appear here once you make your first payment."
                className="py-8"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Danger Zone ───────────────────────────────────── */}
      {isPaid && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2 text-sm">
              <AlertTriangle className="size-4" />
              Cancel subscription
            </CardTitle>
            <CardDescription>
              {isCancelled
                ? 'Your subscription will end at the current billing period.'
                : 'Revert to the Free plan after the current billing period.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => portal.mutate()}
              disabled={portal.isPending || isCancelled}
            >
              {isCancelled ? 'Already cancelled' : 'Cancel subscription'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Upgrade Dialog ────────────────────────────────── */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="size-4 text-primary" />
              Upgrade your plan
            </DialogTitle>
            <DialogDescription>Choose the plan that fits your needs</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-2 pb-3 border-b border-border/50">
            <span className={cn('text-xs', !isYearly ? 'font-medium text-foreground' : 'text-muted-foreground')}>
              Monthly
            </span>
            <Switch checked={isYearly} onCheckedChange={setIsYearly} />
            <span className={cn('text-xs', isYearly ? 'font-medium text-foreground' : 'text-muted-foreground')}>
              Yearly
            </span>
          </div>
          <div className="divide-y divide-border/50">
            {pricingConfig.plans
              .filter((p) => p.key !== 'free')
              .map((planItem) => {
                const Icon = planItem.icon ? planIcons[planItem.icon] : Zap
                return (
                  <button
                    key={planItem.key}
                    className="w-full text-left flex items-center gap-3 py-3 first:pt-0 last:pb-0 transition-colors hover:bg-muted/50 rounded-md px-1.5 -mx-1.5 disabled:opacity-50"
                    onClick={() => {
                      setShowUpgradeDialog(false)
                      checkout.mutate({
                        planKey: planItem.key,
                        billingPeriod: isYearly ? 'yearly' : 'monthly',
                      })
                    }}
                    disabled={checkout.isPending}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{planItem.name}</span>
                        {planItem.badge && (
                          <Badge className="h-3.5 px-1 text-[9px]">{planItem.badge}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{planItem.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-semibold tabular-nums">
                        {isYearly ? planItem.yearlyPrice || planItem.price : planItem.price}
                      </span>
                      {planItem.period && (
                        <p className="text-[10px] text-muted-foreground">{planItem.period}</p>
                      )}
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
