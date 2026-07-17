import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useOrg } from '@/lib/org-context'
import { billing } from '@/lib/api'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/loading'
import { UsageMeter } from '@/components/settings/billing/usage-meter'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  CreditCard,
  ArrowUpRight,
  Check,
  ExternalLink,
  Receipt,
  Shield,
  Zap,
  Star,
  AlertCircle,
  MessageSquare,
  Bot,
  Infinity as InfinityIcon,
} from 'lucide-react'

const upgradePlans = [
  {
    key: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/mo',
    description: 'For growing teams and businesses',
    features: [
      'Unlimited agents',
      '50,000 messages/mo',
      'Multi-channel deployment',
      'Advanced analytics',
      'Custom branding',
    ],
    icon: Zap,
    highlight: true,
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations with custom needs',
    features: [
      'Everything in Pro',
      'Unlimited messages',
      'SSO / SAML',
      'Dedicated support',
      'Custom SLA',
    ],
    icon: Shield,
    highlight: false,
  },
]

function formatCurrency(total: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(total / 100)
}

function getBadgeVariant(status?: string) {
  if (!status || status === 'active') return 'active' as const
  if (status === 'trialing') return 'trialing' as const
  if (status === 'canceled') return 'canceled' as const
  if (status === 'past_due') return 'past_due' as const
  return 'secondary' as const
}

export default function BillingPage() {
  const { orgId } = useOrg()
  const queryClient = useQueryClient()
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  const { data: planData, isLoading: planLoading } = useQuery({
    queryKey: ['billing-plan', orgId],
    queryFn: () => billing.plan(orgId!).then(r => r.data.data),
    enabled: !!orgId,
  })

  const { data: usageData, isLoading: usageLoading } = useQuery({
    queryKey: ['billing-usage', orgId],
    queryFn: () => billing.usage(orgId!).then(r => r.data.data),
    enabled: !!orgId,
  })

  const { data: subscriptionData, isLoading: subLoading } = useQuery({
    queryKey: ['billing-subscription', orgId],
    queryFn: () => billing.subscription(orgId!).then(r => r.data.data),
    enabled: !!orgId,
  })

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['billing-invoices', orgId],
    queryFn: () => billing.invoices(orgId!).then(r => r.data.data),
    enabled: !!orgId,
  })

  const checkoutMutation = useMutation({
    mutationFn: (plan: string) => billing.checkout(orgId!, plan),
    onSuccess: (res) => {
      const url = res.data.data?.checkoutUrl
      if (url) window.location.href = url
    },
  })

  const portalMutation = useMutation({
    mutationFn: () => billing.portal(orgId!),
    onSuccess: (res) => {
      const url = res.data.data?.url
      if (url) window.open(url, '_blank')
    },
  })

  if (!orgId) {
    return (
      <div className="space-y-6 max-w-5xl">
        <PageHeader title="Billing" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>
    )
  }

  if (planLoading || usageLoading || subLoading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <PageHeader title="Billing" description="Manage your subscription, view invoices, and monitor usage." />
        <Skeleton className="h-44 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-5">
          <Skeleton className="h-52 w-full rounded-xl md:col-span-2" />
          <Skeleton className="h-52 w-full rounded-xl md:col-span-3" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  const plan = planData
  const usage = usageData
  const subscription = subscriptionData
  const invoices = invoicesData || []

  const currentPlanKey = plan?.name
  const isFree = currentPlanKey === 'free'
  const agentsLimit = plan?.limits?.agents
  const agentsUnlimited = !agentsLimit || agentsLimit === Infinity
  const messagesLimit = usage?.limit
  const messagesUnlimited = !messagesLimit || messagesLimit === Infinity

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="Billing & Plan"
        description="Manage your subscription, view invoices, and monitor usage."
      />

      {/* ── Hero ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl ring-1 ring-foreground/10 bg-card">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-transparent" />
        <div className="relative p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-bold tracking-tight">{plan?.label}</h2>
                <Badge variant={getBadgeVariant(subscription?.status)}>
                  {subscription?.status || 'active'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{plan?.price}</p>
            </div>
            {!isFree && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => portalMutation.mutate()}
                disabled={portalMutation.isPending}
                className="self-start"
              >
                {portalMutation.isPending ? 'Loading...' : 'Manage Billing'}
                <ExternalLink className="ml-1.5 size-3.5" />
              </Button>
            )}
          </div>

          {subscription?.cancelAtPeriodEnd && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-sm text-warning">
              <AlertCircle className="size-4 shrink-0" />
              <span>
                Your subscription will end on{' '}
                {subscription.endsAt
                  ? new Date(subscription.endsAt as string).toLocaleDateString()
                  : 'the end of the billing period'}
                . Reactivate to keep your plan.
              </span>
            </div>
          )}

          {/* Inline usage stats */}
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
              <Bot className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">
                {agentsUnlimited ? (
                  <span className="inline-flex items-center gap-1">Unlimited agents <InfinityIcon className="size-3" /></span>
                ) : (
                  `${usage?.agents ?? 0} / ${agentsLimit} agents`
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
              <MessageSquare className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">
                {messagesUnlimited ? (
                  <span className="inline-flex items-center gap-1">Unlimited messages <InfinityIcon className="size-3" /></span>
                ) : (
                  `${(usage?.messages || 0).toLocaleString()} / ${messagesLimit?.toLocaleString()} messages`
                )}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
              <CreditCard className="size-3.5 text-muted-foreground" />
              <span className="text-xs font-medium capitalize">{currentPlanKey} plan</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two Column: Features + Usage ─────────────────── */}
      <div className="grid gap-4 md:grid-cols-5">
        {/* Left — Plan Features */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Star className="size-4 text-muted-foreground" />
                Plan Features
              </CardTitle>
              <CardDescription>What's included in {plan?.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-0 divide-y divide-foreground/5">
                {plan?.features.map((feature: string) => (
                  <div key={feature} className="flex items-center gap-2.5 py-2.5">
                    <div className="flex size-5 items-center justify-center rounded-full bg-primary/10 shrink-0">
                      <Check className="size-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — Usage */}
        <div className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageSquare className="size-4 text-muted-foreground" />
                Usage This Period
              </CardTitle>
              <CardDescription>Current usage against your plan limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <UsageMeter
                label="Agents"
                used={usage?.messages ? plan?.limits?.agents : 0}
                limit={plan?.limits?.agents || 0}
              />
              <UsageMeter
                label="Messages this month"
                used={usage?.messages || 0}
                limit={usage?.limit || 0}
              />
              <UsageMeter
                label="Conversations this month"
                used={usage?.conversations || 0}
                limit={0}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Upgrade Plans ─────────────────────────────────── */}
      {currentPlanKey !== 'enterprise' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">
              {isFree ? 'Upgrade Your Plan' : 'Explore Higher Tiers'}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isFree
                ? 'Unlock more agents, messages, and features.'
                : 'Get additional capabilities with a higher plan.'}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {upgradePlans
              .filter((p) => {
                if (currentPlanKey === 'enterprise') return false
                if (currentPlanKey === 'pro') return p.key === 'enterprise'
                return true
              })
              .map((p) => {
                const Icon = p.icon
                const isLoading = checkoutLoading === p.key

                return (
                  <div
                    key={p.key}
                    className="relative flex flex-col overflow-hidden rounded-xl ring-1 ring-foreground/10 bg-card transition-shadow hover:ring-foreground/20"
                  >
                    {p.highlight && (
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                    )}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                          <Icon className="size-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.description}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-2xl font-bold tracking-tight">{p.price}</span>
                        {p.period && (
                          <span className="text-sm text-muted-foreground">{p.period}</span>
                        )}
                      </div>

                      <div className="space-y-0 divide-y divide-foreground/5 flex-1">
                        {p.features.map((f) => (
                          <div key={f} className="flex items-center gap-2.5 py-2">
                            <div className="flex size-4 items-center justify-center rounded-full bg-primary/10 shrink-0">
                              <Check className="size-2.5 text-primary" />
                            </div>
                            <span className="text-sm">{f}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        className="w-full mt-5"
                        variant={p.highlight ? 'default' : 'outline'}
                        disabled={isLoading}
                        onClick={() => {
                          setCheckoutLoading(p.key)
                          checkoutMutation.mutate(p.key, {
                            onSettled: () => setCheckoutLoading(null),
                          })
                        }}
                      >
                        {isLoading ? 'Redirecting...' : `Upgrade to ${p.name}`}
                        <ArrowUpRight className="ml-1.5 size-3.5" />
                      </Button>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* ── Invoice History ───────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Receipt className="size-4 text-muted-foreground" />
            Invoice History
          </CardTitle>
          <CardDescription>Past billing invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <Skeleton className="h-32" />
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <div className="flex size-10 items-center justify-center rounded-full bg-muted/50 mb-3">
                <Receipt className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No invoices yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Invoices will appear here after your first payment.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv: Record<string, unknown>) => (
                  <TableRow key={inv.id as string}>
                    <TableCell className="text-sm">
                      {new Date(inv.createdAt as string).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-sm font-medium tabular-nums">
                      {formatCurrency(inv.total as number, inv.currency as string)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === 'paid' ? 'active' :
                          inv.status === 'refunded' ? 'destructive' : 'secondary'
                        }
                      >
                        {inv.status as string}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {inv.invoiceUrl ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(inv.invoiceUrl as string, '_blank')}
                        >
                          View
                          <ExternalLink className="ml-1 size-3" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
