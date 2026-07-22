import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  Download,
  Check,
  Star,
  DollarSign,
  Clock,
  Receipt,
  Calendar,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Loader2,
  Search,
  X,
} from 'lucide-react'
import { InvoiceTable, type Invoice } from '@/components/settings/invoice-table'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/lib/toast'
import { cn, formatDate } from '@/lib/utils'
import { useOrg } from '@/lib/org-context'
import {
  usePlan,
  useUsage,
  useSubscription,
  useInvoices,
  useCheckout,
  usePortal,
} from '@/lib/hooks/use-billing'

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

type SubStatus = 'active' | 'on_trial' | 'past_due' | 'cancelled' | 'expired' | 'paused'

const subStatusBadge: Record<SubStatus, 'active' | 'trialing' | 'past_due' | 'canceled' | 'archived' | 'inactive'> = {
  active: 'active',
  on_trial: 'trialing',
  past_due: 'past_due',
  cancelled: 'canceled',
  expired: 'archived',
  paused: 'inactive',
}

const subStatusLabel: Record<SubStatus, string> = {
  active: 'Active',
  on_trial: 'On Trial',
  past_due: 'Past Due',
  cancelled: 'Cancelled',
  expired: 'Expired',
  paused: 'Paused',
}

function formatCurrency(total: number, currency: string): string {
  const code = (currency || 'USD').toUpperCase()
  const dollars = total / 100
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(dollars)
  } catch {
    return `$${dollars.toFixed(2)}`
  }
}

function downloadInvoicesCSV(invoices: InvoiceData[]) {
  if (!invoices.length) {
    toast.info('No invoices to download.')
    return
  }
  const header = 'Invoice #,Date,Amount,Currency,Status,Reason\n'
  const rows = invoices.map((inv) => {
    const date = inv.paidAt || inv.createdAt
    const d = new Date(date)
    const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return `"${inv.invoiceNumber || inv.providerInvoiceId}",${formatted},${(inv.total / 100).toFixed(2)},${inv.currency},"${inv.status}","${inv.billingReason || ''}"`
  }).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success(`Downloaded ${invoices.length} invoice(s) as CSV.`)
}

function parseSubStatus(status: string | undefined): SubStatus | null {
  if (!status) return null
  if (status in subStatusBadge) return status as SubStatus
  return null
}

export default function BillingPage() {
  const { orgId, isLoading: orgLoading } = useOrg()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()

  const usage = useUsage()
  const plan = usePlan()
  const subscription = useSubscription()
  const invoices = useInvoices()
  const checkout = useCheckout()
  const portal = usePortal()

  const pendingPlan = searchParams.get('plan')
  const pendingPeriod = searchParams.get('billing')
  const checkoutSuccess = searchParams.get('checkout') === 'success'
  const checkoutTriggered = useRef(false)

  // Show success toast when returning from checkout
  useEffect(() => {
    if (checkoutSuccess) {
      toast.success('Subscription activated! Your plan is now active.')
      queryClient.invalidateQueries({ queryKey: ['billing'] })
      setSearchParams({}, { replace: true })
    }
  }, [checkoutSuccess, queryClient, setSearchParams])

  // Auto-trigger checkout when arriving with ?plan=X&billing=Y
  useEffect(() => {
    if (pendingPlan && orgId && !checkoutTriggered.current && !checkout.isPending) {
      checkoutTriggered.current = true
      const paidPlans = ['pro', 'business', 'enterprise']
      if (paidPlans.includes(pendingPlan)) {
        toast.info('Paid plans are coming soon!')
        setSearchParams({}, { replace: true })
        checkoutTriggered.current = false
        return
      }
      toast.info('Redirecting to secure checkout...')
      checkout.mutate(
        { planKey: pendingPlan, billingPeriod: pendingPeriod || 'monthly' },
        {
          onError: () => {
            setSearchParams({}, { replace: true })
            checkoutTriggered.current = false
          },
        },
      )
    }
  }, [pendingPlan, pendingPeriod, orgId, checkout, setSearchParams])

  const handlePortal = () => {
    if (!subscription.data) {
      toast.error('No active subscription found. Upgrade to a paid plan first.')
      return
    }
    portal.mutate()
  }

  const handleUpgrade = () => {
    if (!plan.data) return
    if (plan.data.name === 'enterprise') {
      window.open('https://convio.ai/contact', '_blank', 'noopener,noreferrer')
      return
    }
    toast.info('Paid plans are coming soon! Stay tuned.')
  }

  const pageLoading = orgLoading
  const isCheckoutRedirecting = checkout.isPending

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Invoices"
        description="Manage your payments, invoices and subscription."
        action={
          <Button
            variant="outline"
            onClick={() => {
              if (!invoices.data?.length) {
                toast.info('No invoices available yet.')
                return
              }
              downloadInvoicesCSV(invoices.data)
            }}
            disabled={pageLoading || invoices.isLoading}
          >
            <Download className="size-3.5" />
            Download
          </Button>
        }
      />

      {isCheckoutRedirecting && pendingPlan && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <Loader2 className="size-4 animate-spin text-primary" />
          <div className="min-w-0">
            <p className="text-sm font-medium">Preparing checkout...</p>
            <p className="text-xs text-muted-foreground">You'll be redirected to our secure payment provider.</p>
          </div>
        </div>
      )}

      <KPISection
        orgLoading={pageLoading}
        invoices={invoices.data}
        subscription={subscription.data}
        usageError={usage.isError}
        invoicesError={invoices.isError}
        subscriptionError={subscription.isError}
        onRetry={() => {
          usage.refetch()
          invoices.refetch()
          subscription.refetch()
        }}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PlanCard
          plan={plan.data}
          subscription={subscription.data}
          isLoading={pageLoading || plan.isLoading}
          isError={plan.isError}
          onRetry={() => plan.refetch()}
          onUpgrade={handleUpgrade}
          onPortal={handlePortal}
          checkoutPending={checkout.isPending}
          portalPending={portal.isPending}
        />
        <BillingHistoryCard
          plan={plan.data}
          subscription={subscription.data}
          invoices={invoices.data}
        />
      </div>

      <InvoicesSection
        invoices={invoices.data}
        isLoading={pageLoading || invoices.isLoading}
        isError={invoices.isError}
        onRetry={() => invoices.refetch()}
      />
    </div>
  )
}

// ── KPI Section ─────────────────────────────────────────────────────────────
function KPISection({
  orgLoading,
  invoices,
  subscription,
  usageError,
  invoicesError,
  subscriptionError,
  onRetry,
}: {
  orgLoading: boolean
  invoices: InvoiceData[] | undefined
  subscription: SubscriptionData | null | undefined
  usageError: boolean
  invoicesError: boolean
  subscriptionError: boolean
  onRetry: () => void
}) {
  if (orgLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[68px] rounded-lg" />
        ))}
      </div>
    )
  }

  if (usageError || invoicesError || subscriptionError) {
    return (
      <ErrorBanner
        title="Failed to load billing summary"
        description="We couldn't load your billing stats. Please try again."
        onRetry={onRetry}
      />
    )
  }

  const paidInvoices = invoices?.filter((i) => i.status === 'paid') ?? []
  const totalSpend = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0)
  const outstanding =
    invoices
      ?.filter((i) => i.status !== 'paid' && i.status !== 'void' && i.status !== 'refunded')
      .reduce((sum, i) => sum + (i.total || 0), 0) ?? 0
  const nextBilling = subscription?.renewsAt
    ? formatDate(subscription.renewsAt)
    : subscription?.endsAt
      ? `Ends ${formatDate(subscription.endsAt)}`
      : '—'

  const kpis = [
    {
      icon: DollarSign,
      label: 'Total Spend',
      value: formatCurrency(totalSpend, 'USD'),
      iconBg: 'bg-emerald-500/10 text-emerald-500',
    },
    {
      icon: Clock,
      label: 'Outstanding',
      value: formatCurrency(outstanding, 'USD'),
      iconBg: 'bg-amber-500/10 text-amber-500',
    },
    {
      icon: Receipt,
      label: 'Paid Invoices',
      value: paidInvoices.length,
      iconBg: 'bg-blue-500/10 text-blue-500',
    },
    {
      icon: Calendar,
      label: 'Next Billing',
      value: nextBilling,
      iconBg: 'bg-violet-500/10 text-violet-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KPI key={kpi.label} {...kpi} />
      ))}
    </div>
  )
}

function KPI({ icon: Icon, label, value, iconBg }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  iconBg?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-3">
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', iconBg)}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-semibold leading-none tracking-tight text-foreground">{value}</p>
      </div>
    </div>
  )
}

// ── Plan Card ───���───────────────────────────────────────────────────────────
function PlanCard({
  plan,
  subscription,
  isLoading,
  isError,
  onRetry,
  onUpgrade,
  onPortal,
  checkoutPending,
  portalPending,
}: {
  plan: PlanData | undefined
  subscription: SubscriptionData | null | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
  onUpgrade: () => void
  onPortal: () => void
  checkoutPending: boolean
  portalPending: boolean
}) {
  if (isLoading) {
    return <Skeleton className="rounded-xl p-6 h-[340px]" />
  }

  if (isError || !plan) {
    return (
      <div className="rounded-xl border border-border/60 bg-card p-6">
        <ErrorBanner
          title="Failed to load plan"
          description="We couldn't load your subscription plan."
          onRetry={onRetry}
        />
      </div>
    )
  }

  const subStatus = parseSubStatus(subscription?.status)
  const isFreePlan = plan.name === 'free'
  const isEnterprise = plan.name === 'enterprise'
  const hasSubscription = !!subscription

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Current Plan</h3>
        {subStatus ? (
          <Badge variant={subStatusBadge[subStatus]} className="capitalize">
            {subStatusLabel[subStatus]}
          </Badge>
        ) : (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
            {isFreePlan ? 'Free' : 'Active'}
          </span>
        )}
      </div>

      <div className="flex items-start gap-5">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
          <svg className="size-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 20h10" />
            <path d="M10 20c5.5-2.5.8-6.4 3-10" />
            <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
            <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-lg font-semibold text-foreground">{plan.label}</h4>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-2xl font-semibold text-foreground">{plan.price}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {plan.features.map((f) => (
          <div key={f} className="flex items-center gap-2.5">
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
              <Check className="size-3 text-emerald-600" />
            </div>
            <span className="text-sm text-muted-foreground">{f}</span>
          </div>
        ))}
      </div>

      {isEnterprise ? (
        <Button className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700" onClick={onUpgrade}>
          <Star className="size-4" />
          Contact Sales
        </Button>
      ) : isFreePlan ? (
        <Button
          className="mt-6 w-full"
          variant="outline"
          onClick={onUpgrade}
          disabled
        >
          <Star className="size-4" />
          Coming Soon
        </Button>
      ) : (
        <Button
          variant="outline"
          className="mt-6 w-full"
          onClick={onPortal}
          disabled={portalPending || !hasSubscription}
        >
          {portalPending ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
          {portalPending ? 'Opening portal...' : 'Manage Subscription'}
        </Button>
      )}
    </div>
  )
}

// ── Billing History Card ────────────────────────────────────────────────────
function BillingHistoryCard({
  plan,
  subscription,
  invoices,
}: {
  plan: PlanData | undefined
  subscription: SubscriptionData | null | undefined
  invoices: InvoiceData[] | undefined
}) {
  const paidInvoices = invoices?.filter((i) => i.status === 'paid') ?? []
  const totalSpend = paidInvoices.reduce((s, i) => s + (i.total || 0), 0)

  const firstPaidDate = paidInvoices.length > 0
    ? paidInvoices.reduce((earliest, i) => {
        const d = new Date(i.paidAt || i.createdAt)
        return d < earliest ? d : earliest
      }, new Date())
    : null

  // capture once at mount, stable reference
  const [now] = useState(() => Date.now())
  const monthsSinceFirst = firstPaidDate
    ? Math.max(1, Math.floor((now - firstPaidDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : 1
  const avgPerMonth = totalSpend / monthsSinceFirst

  const memberSince = subscription?.createdAt
    ? formatDate(subscription.createdAt)
    : firstPaidDate
      ? formatDate(firstPaidDate)
      : '—'

  const subStatus = parseSubStatus(subscription?.status)

  return (
    <div className="rounded-xl border border-border/60 bg-card p-6">
      <h3 className="mb-5 text-sm font-medium text-muted-foreground">Billing History</h3>

      <div className="space-y-5 sm:space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
              <DollarSign className="size-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Total spend</p>
              <p className="text-[11px] text-muted-foreground">All time</p>
            </div>
          </div>
          <span className="text-sm font-semibold tabular-nums">{formatCurrency(totalSpend, 'USD')}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
              <Receipt className="size-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Avg. per month</p>
              <p className="text-[11px] text-muted-foreground">{monthsSinceFirst} month{monthsSinceFirst > 1 ? 's' : ''}</p>
            </div>
          </div>
          <span className="text-sm font-semibold tabular-nums">{formatCurrency(avgPerMonth, 'USD')}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/10">
              <Star className="size-4 text-violet-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Plan</p>
              <p className="text-[11px] text-muted-foreground">{plan?.label ?? '—'}</p>
            </div>
          </div>
          {subStatus ? (
            <Badge variant={subStatusBadge[subStatus]} className="text-[10px] capitalize shrink-0">
              {subStatusLabel[subStatus]}
            </Badge>
          ) : (
            <Badge variant="free" className="text-[10px]">Free</Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
              <Calendar className="size-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-foreground">Since</p>
              <p className="text-[11px] text-muted-foreground">First payment</p>
            </div>
          </div>
          <span className="text-sm font-semibold tabular-nums">{memberSince}</span>
        </div>

        {subscription?.renewsAt && subStatus !== 'cancelled' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10">
                <Clock className="size-4 text-cyan-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">Next renewal</p>
                <p className="text-[11px] text-muted-foreground">Auto-renew</p>
              </div>
            </div>
            <span className="text-sm font-semibold tabular-nums">{formatDate(subscription.renewsAt)}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Invoices Section ────────────────────────────────────────────────────────
function InvoicesSection({
  invoices,
  isLoading,
  isError,
  onRetry,
}: {
  invoices: InvoiceData[] | undefined
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}) {
  const [search, setSearch] = useState('')

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          Recent Invoices
          {invoices && invoices.length > 0 && (
            <span className="ml-2 text-xs text-muted-foreground font-normal">({invoices.length})</span>
          )}
        </h3>
        {invoices && invoices.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-1.5">
            <Search className="size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {search && (
              <button onClick={() => setSearch('')} className="rounded p-0.5 text-muted-foreground hover:bg-muted">
                <X className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border/60 bg-card">
      {isLoading ? (
        <div className="space-y-2 px-5 pb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="size-8 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="px-5 pb-5">
          <ErrorBanner
            title="Failed to load invoices"
            description="We couldn't load your invoice history."
            onRetry={onRetry}
          />
        </div>
      ) : !invoices || invoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted">
            <Receipt className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No invoices yet</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            Invoices will appear here once you subscribe to a paid plan.
          </p>
        </div>
      ) : (
        <InvoiceTable invoices={invoices as Invoice[]} search={search} />
      )}
      </div>
    </div>
  )
}

// ── Error Banner ────────────────────────────────────────────────────────────
function ErrorBanner({
  title,
  description,
  onRetry,
}: {
  title: string
  description: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-10 text-center">
      <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertCircle className="size-6 text-destructive" />
      </div>
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        <RefreshCw className="size-3.5" />
        Try again
      </Button>
    </div>
  )
}
