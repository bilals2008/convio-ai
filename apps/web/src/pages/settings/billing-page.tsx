import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { billing } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { useCheckout } from '@/lib/hooks/use-billing'
import { pricingConfig } from '@/lib/pricing/config'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Zap,
  Shield,
  Star,
  Crown,
  CreditCard,
  Calendar,
  Settings,
  Receipt,
  Download,
  RotateCw,
  MoreHorizontal,
  MessageSquare,
  HardDrive,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Clock,
  AlertTriangle,
  FileText,
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

interface Invoice {
  id: string
  invoiceNumber?: string
  total: number
  currency: string
  status: string
  paidAt?: string
  createdAt?: string
  invoiceUrl?: string
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

function getProgressColor(percent: number) {
  if (percent >= 100) return 'bg-destructive'
  if (percent >= 85) return 'bg-warning'
  return 'bg-success'
}

const subStatusBadge: Record<string, 'active' | 'past_due' | 'trialing' | 'canceled' | 'default'> = {
  active: 'active',
  past_due: 'past_due',
  on_trial: 'trialing',
  trialing: 'trialing',
  cancelled: 'canceled',
}

const INVOICES_PER_PAGE = 5

export default function BillingPage() {
  const { orgId } = useOrg()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [isYearly, setIsYearly] = useState(false)
  const [invoicePage, setInvoicePage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
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
    onError: () => {
      toast.error('No active subscription found. Upgrade to a paid plan first.')
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
  const hasSubscription = !!sub

  const planIconName = currentPlanConfig?.icon ?? 'zap'
  const PlanIcon = planIcons[planIconName] ?? Zap
  const resetDate = nextBilling ? formatDate(nextBilling) : '—'

  const planDescription = currentPlanConfig?.description || 'Best for growing teams and advanced chatbot experiences.'

  const upcomingPlans = pricingConfig.plans.filter((p) => {
    if (currentPlan?.name === 'free') return p.key === 'pro' || p.key === 'business' || p.key === 'enterprise'
    if (currentPlan?.name === 'pro') return p.key === 'business' || p.key === 'enterprise'
    if (currentPlan?.name === 'business') return p.key === 'enterprise'
    return false
  })

  // Invoice filtering & pagination
  const allInvoices: Invoice[] = invoices.data ?? []
  const filteredInvoices = statusFilter === 'all'
    ? allInvoices
    : allInvoices.filter((inv) => inv.status === statusFilter)
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / INVOICES_PER_PAGE))
  const paginatedInvoices = filteredInvoices.slice(
    (invoicePage - 1) * INVOICES_PER_PAGE,
    invoicePage * INVOICES_PER_PAGE,
  )

  if (plan.isPending || usage.isPending || !plan.data || !usage.data) {
    return (
      <div className="space-y-6 max-w-6xl">
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing & Invoices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your subscription, payment methods, and view your invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => portal.mutate()} disabled={portal.isPending}>
            <Receipt className="size-3.5" />
            Billing history
          </Button>
          <Button variant="outline" size="sm" onClick={() => portal.mutate()} disabled={portal.isPending}>
            <Settings className="size-3.5" />
            Payment settings
          </Button>
        </div>
      </div>

      {/* ── Top Grid: Plan + Usage ──────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left: Plan Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <PlanIcon className="size-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-lg font-bold tracking-tight">{currentPlan?.label || 'Free'} Plan</h2>
                  {isPaid && sub && (
                    <Badge variant={subStatusBadge[sub.status] || 'default'} className="text-[11px] capitalize">
                      {sub.status?.replace('_', ' ') ?? 'unknown'}
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex items-baseline gap-1.5 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{currentPlan?.price || '$0'}</span>
                  {currentPlan?.priceMonthly !== undefined && currentPlan.priceMonthly > 0 && (
                    <span>/ month</span>
                  )}
                  {nextBilling && (
                    <>
                      <span className="mx-1">•</span>
                      <span>Renews {formatDate(nextBilling)}</span>
                    </>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{planDescription}</p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <CreditCard className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Payment method</p>
                  <p className="text-sm font-medium">•••• 4242</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Calendar className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Billing cycle</p>
                  <p className="text-sm font-medium">Monthly</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Clock className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Next payment</p>
                  <p className="text-sm font-medium">{nextBilling ? formatDate(nextBilling) : '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                  <Receipt className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Amount</p>
                  <p className="text-sm font-medium">{currentPlan?.price || '$0'}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-3">
              {(currentPlan?.name === 'free' || currentPlan?.name === 'pro' || currentPlan?.name === 'business') && (
                <Button variant="outline" size="sm" onClick={() => setShowUpgradeDialog(true)}>
                  Change plan
                </Button>
              )}
              {isPaid && hasSubscription && (
                <Button size="sm" onClick={() => portal.mutate()} disabled={portal.isPending}>
                  {portal.isPending && <RotateCw className="size-3.5 animate-spin" />}
                  Manage subscription
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Usage & Limits */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Usage & Limits</CardTitle>
              <span className="text-xs text-muted-foreground">Resets on {resetDate}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Messages */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="size-4" />
                  Messages
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium tabular-nums">
                    {messageUsage.toLocaleString()} / {messageLimit === Infinity ? '∞' : messageLimit.toLocaleString()}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">{usagePercent}%</span>
                </div>
              </div>
              <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', getProgressColor(usagePercent))}
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HardDrive className="size-4" />
                  Storage
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium tabular-nums">
                    {conversations > 0 ? `${(conversations / 100).toFixed(1)} GB` : '0 GB'} / 10 GB
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {Math.min(Math.round((conversations / 200) * 100), 100)}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all duration-500 bg-primary')}
                  style={{ width: `${Math.min(Math.round((conversations / 200) * 100), 100)}%` }}
                />
              </div>
            </div>

            {/* AI Requests */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="size-4" />
                  AI Requests
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium tabular-nums">18,200 / 50,000</span>
                  <span className="text-xs text-muted-foreground tabular-nums">36%</span>
                </div>
              </div>
              <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-success"
                  style={{ width: '36%' }}
                />
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  Team Members
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium tabular-nums">3 / 10</span>
                  <span className="text-xs text-muted-foreground tabular-nums">30%</span>
                </div>
              </div>
              <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-primary"
                  style={{ width: '30%' }}
                />
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-fit">
              View all limits
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Invoices ──────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Invoices</h2>
            <p className="mt-1 text-sm text-muted-foreground">Download and manage all your invoices.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setInvoicePage(1) }}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <FileText className="size-3.5" />
              Last 12 months
            </Button>
            <Button variant="outline" size="sm">
              <Download className="size-3.5" />
              Export
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border bg-muted/30">
                <TableHead className="text-muted-foreground font-medium h-11 px-4 text-xs uppercase tracking-wide">
                  Invoice
                </TableHead>
                <TableHead className="text-muted-foreground font-medium h-11 px-4 text-xs uppercase tracking-wide">
                  Date
                </TableHead>
                <TableHead className="text-muted-foreground font-medium h-11 px-4 text-xs uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="text-muted-foreground font-medium h-11 px-4 text-xs uppercase tracking-wide">
                  Amount
                </TableHead>
                <TableHead className="text-muted-foreground font-medium h-11 px-4 text-xs uppercase tracking-wide">
                  Payment method
                </TableHead>
                <TableHead className="text-muted-foreground font-medium h-11 px-4 text-xs uppercase tracking-wide text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-muted shrink-0">
                          <FileText className="size-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{invoice.invoiceNumber || 'Invoice'}</p>
                          <p className="text-xs text-muted-foreground">Pro Plan – Monthly</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(invoice.paidAt || invoice.createdAt)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant={
                          invoice.status === 'paid'
                            ? 'active'
                            : invoice.status === 'draft'
                              ? 'secondary'
                              : invoice.status === 'void'
                                ? 'canceled'
                                : 'destructive'
                        }
                        className="capitalize text-[10px]"
                      >
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-sm font-medium tabular-nums">
                      {formatCurrency(invoice.total, invoice.currency)}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground">VISA</span>
                        <span className="text-sm text-muted-foreground">•••• 4242</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {invoice.status === 'paid' || invoice.invoiceUrl ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => invoice.invoiceUrl && window.open(invoice.invoiceUrl, '_blank')}
                          >
                            <Download className="size-3 mr-1" />
                            Download
                          </Button>
                        ) : invoice.status === 'open' ? (
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => portal.mutate()}>
                            <RotateCw className="size-3 mr-1" />
                            Retry payment
                          </Button>
                        ) : null}
                        <Button variant="ghost" size="icon-sm" className="size-7">
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Receipt className="size-8 text-muted-foreground/50" />
                      <p>No invoices found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredInvoices.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(invoicePage - 1) * INVOICES_PER_PAGE + 1} to{' '}
              {Math.min(invoicePage * INVOICES_PER_PAGE, filteredInvoices.length)} of{' '}
              {filteredInvoices.length} invoices
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                className="size-7"
                disabled={invoicePage <= 1}
                onClick={() => setInvoicePage((p) => p - 1)}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === invoicePage ? 'default' : 'outline'}
                  size="icon-sm"
                  className="size-7"
                  onClick={() => setInvoicePage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon-sm"
                className="size-7"
                disabled={invoicePage >= totalPages}
                onClick={() => setInvoicePage((p) => p + 1)}
              >
                <ChevronRightIcon className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

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
