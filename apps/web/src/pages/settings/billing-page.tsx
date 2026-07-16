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
} from 'lucide-react'

const upgradePlans = [
  {
    key: 'pro',
    name: 'Pro',
    price: '$29/mo',
    description: 'For growing teams and businesses',
    features: [
      'Unlimited agents',
      '50,000 messages/mo',
      'Multi-channel deployment',
      'Advanced analytics',
      'Custom branding',
    ],
    icon: Zap,
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with custom needs',
    features: [
      'Everything in Pro',
      'Unlimited messages',
      'SSO / SAML',
      'Dedicated support',
      'Custom SLA',
    ],
    icon: Shield,
  },
]

function formatCurrency(total: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(total / 100)
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
      <div className="space-y-5">
        <PageHeader title="Billing" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (planLoading || usageLoading || subLoading) {
    return (
      <div className="space-y-5">
        <PageHeader title="Billing" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  const plan = planData
  const usage = usageData
  const subscription = subscriptionData
  const invoices = invoicesData || []

  const currentPlanKey = plan?.name
  const isFree = currentPlanKey === 'free'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Plan"
        description="Manage your subscription, view invoices, and monitor usage."
      />

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="size-5" />
            Current Plan
          </CardTitle>
          <CardDescription>Your active subscription and usage summary</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold">{plan?.label}</h3>
                <Badge variant={
                  isFree ? 'secondary' :
                  subscription?.status === 'trialing' ? 'trialing' :
                  subscription?.status === 'canceled' ? 'canceled' :
                  subscription?.status === 'past_due' ? 'past_due' :
                  'active'
                }>
                  {subscription?.status || 'active'}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">{plan?.price}</p>
              {subscription?.cancelAtPeriodEnd && (
                <div className="mt-3 flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
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
            </div>
            <div className="flex gap-2">
              {!isFree && (
                <Button
                  variant="outline"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                >
                  {portalMutation.isPending ? 'Loading...' : 'Manage Billing'}
                  <ExternalLink className="ml-2 size-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {plan?.features.map((feature: string) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <Check className="size-4 text-primary shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-2">
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
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Plans */}
      {currentPlanKey !== 'enterprise' && (
        <Card>
          <CardHeader>
            <CardTitle>{isFree ? 'Upgrade Your Plan' : 'Compare Plans'}</CardTitle>
            <CardDescription>
              {isFree
                ? 'Unlock more agents, messages, and features.'
                : 'Explore higher tiers for additional capabilities.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    <Card key={p.key} className="relative flex flex-col">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <Icon className="size-5 text-primary" />
                          <CardTitle>{p.name}</CardTitle>
                        </div>
                        <CardDescription>{p.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col gap-4">
                        <p className="text-3xl font-bold">{p.price}</p>
                        <ul className="space-y-2 text-sm">
                          {p.features.map((f) => (
                            <li key={f} className="flex items-center gap-2">
                              <Check className="size-4 text-primary shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-auto pt-4">
                          <Button
                            className="w-full"
                            disabled={isLoading}
                            onClick={() => {
                              setCheckoutLoading(p.key)
                              checkoutMutation.mutate(p.key, {
                                onSettled: () => setCheckoutLoading(null),
                              })
                            }}
                          >
                            {isLoading ? 'Redirecting...' : `Upgrade to ${p.name}`}
                            <ArrowUpRight className="ml-2 size-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="size-5" />
            Invoice History
          </CardTitle>
          <CardDescription>Past billing invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <Skeleton className="h-32" />
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Receipt className="size-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No invoices yet</p>
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
                      {new Date(inv.createdAt as string).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {formatCurrency(inv.total as number, inv.currency as string)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          inv.status === 'paid' ? 'default' :
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
                          View <ExternalLink className="ml-1 size-3" />
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
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
