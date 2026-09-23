import { Crown, Shield, Star, Zap, Calendar, CreditCard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { usePlan, useSubscription, useUsage, usePortal } from '@/lib/hooks/use-billing'
import { useOrg } from '@/lib/org-context'

const PLAN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  free: Zap,
  pro: Crown,
  business: Star,
  enterprise: Shield,
}

const PLAN_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  free: { bg: 'bg-muted/20', text: 'text-muted-foreground', icon: 'text-muted-foreground' },
  pro: { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: 'text-amber-500' },
  business: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: 'text-emerald-500' },
  enterprise: { bg: 'bg-violet-500/10', text: 'text-violet-500', icon: 'text-violet-500' },
}

const STATUS_BADGE_VARIANT: Record<string, string> = {
  active: 'active',
  on_trial: 'trialing',
  past_due: 'past_due',
  cancelled: 'canceled',
  expired: 'inactive',
  unpaid: 'destructive',
}

function getPlanVariant(planName: string): 'free' | 'pro' | 'business' | 'enterprise' {
  const n = planName.toLowerCase()
  if (n === 'business') return 'business'
  if (n === 'enterprise') return 'enterprise'
  if (n === 'pro') return 'pro'
  return 'free'
}

function getPlanDisplay(planName: string): string {
  return planName.charAt(0).toUpperCase() + planName.slice(1)
}

function getUsageColorClass(percent: number): string {
  if (percent >= 100) return 'bg-destructive'
  if (percent >= 90) return 'bg-destructive'
  if (percent >= 75) return 'bg-warning'
  return 'bg-success'
}

export function PlanBadgeDropdown() {
  const navigate = useNavigate()
  const { orgId } = useOrg()
  const { data: plan, isLoading: planLoading } = usePlan()
  const { data: subscription, isLoading: subLoading } = useSubscription()
  const { data: usage, isLoading: usageLoading } = useUsage()
  const portal = usePortal()

  if (!orgId) return null

  const isLoading = planLoading || subLoading || usageLoading

  if (isLoading || !plan) {
    return <Skeleton className="h-6 w-24 rounded-full" />
  }

  const planName = plan.name as keyof typeof PLAN_ICONS
  const planVariant = getPlanVariant(planName)
  const planDisplay = plan.label || getPlanDisplay(planName)
  const Icon = PLAN_ICONS[planName] ?? Zap
  const colors = PLAN_COLORS[planName] ?? PLAN_COLORS.free

  const status = subscription?.status ?? null
  const statusLabel = status
    ? status.charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)
    : 'No subscription'
  const statusBadgeVariant = (status && STATUS_BADGE_VARIANT[status]) ?? 'outline'

  let renewalLabel = 'Renews'
  let renewalDate: string | null = null
  if (plan.isTrial && plan.trialEndsAt) {
    renewalLabel = 'Trial ends'
    renewalDate = plan.trialEndsAt
  } else if (subscription?.renewsAt) {
    renewalDate = subscription.renewsAt
  }

  const isUnlimited = !usage || usage.limit === Infinity || usage.limit === 0
  const percent = usage?.messagesPercent ?? 0
  const isOverLimit = percent >= 100

  const handleManageBilling = () => {
    if (planName === 'free' || !subscription) {
      navigate('/pricing')
    } else {
      portal.mutate()
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Badge variant={planVariant} className="cursor-pointer">
          <Icon className="size-3" />
          <span className="ml-1 font-medium">{planDisplay}</span>
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', colors.bg)}>
              <Icon className={cn('size-4', colors.icon)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <Badge variant={planVariant} className="text-xs">
                  {planDisplay}
                </Badge>
                {plan.isTrial && (
                  <Badge variant="trialing" className="text-xs">
                    Trial
                  </Badge>
                )}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {plan.priceMonthly > 0
                  ? `$${plan.priceMonthly}/month`
                  : plan.price}
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className="px-4 py-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Status</span>
            <span className="flex items-center gap-1">
              <Badge variant={statusBadgeVariant as 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive' | 'outline'} className="text-xs">
                {statusLabel}
              </Badge>
            </span>
          </div>

          {renewalDate && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{renewalLabel}</span>
              <span className="text-xs text-foreground flex items-center gap-1">
                <Calendar className="size-3" />
                {formatDate(renewalDate)}
              </span>
            </div>
          )}

          {subscription?.cancelAtPeriodEnd && (
            <div className="text-xs text-muted-foreground">
              Cancellation effective at period end
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="px-4 py-3 space-y-2.5">
          <div className="text-xs font-medium text-foreground">Usage this month</div>
          {isUnlimited ? (
            <div className="text-xs text-muted-foreground">Unlimited messages</div>
          ) : usage ? (
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Messages</span>
                <span className="text-foreground">
                  {formatNumber(usage.messages)} / {formatNumber(usage.limit)}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    isOverLimit ? 'bg-destructive' : getUsageColorClass(percent),
                  )}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
              {isOverLimit && (
                <div className="text-xs text-destructive flex items-center gap-1">
                  <Zap className="size-3" />
                  Limit reached — upgrade to continue
                </div>
              )}
            </>
          ) : (
            <Skeleton className="h-2 w-full rounded-full" />
          )}
        </div>

        <DropdownMenuSeparator />

        <div className="p-3">
          <Button
            size="sm"
            variant={planName === 'free' ? 'default' : 'outline'}
            className="w-full gap-1.5"
            onClick={handleManageBilling}
          >
            <CreditCard className="size-3.5" />
            {planName === 'free' || !subscription ? 'View Plans' : 'Manage Billing'}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
