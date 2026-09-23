import {
  Crown,
  Shield,
  Star,
  Zap,
  Calendar,
  ChevronDown,
  CreditCard,
  type LucideIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import {
  usePlan,
  useSubscription,
  useUsage,
  usePortal,
} from '@/lib/hooks/use-billing'
import { useOrg } from '@/lib/org-context'

const PLAN_ICONS: Record<string, LucideIcon> = {
  free: Zap,
  pro: Crown,
  business: Star,
  enterprise: Shield,
}

const PLAN_COLORS: Record<string, { bg: string; icon: string }> = {
  free: { bg: 'bg-muted/50', icon: 'text-muted-foreground' },
  pro: { bg: 'bg-primary/10', icon: 'text-primary' },
  business: { bg: 'bg-success/10', icon: 'text-success' },
  enterprise: { bg: 'bg-info/10', icon: 'text-info' },
}

const STATUS_BADGE_VARIANT: Record<string, string> = {
  active: 'active',
  on_trial: 'trialing',
  past_due: 'past_due',
  cancelled: 'canceled',
  expired: 'inactive',
  unpaid: 'destructive',
}

function getPlanVariant(
  planName: string
): 'free' | 'pro' | 'business' | 'enterprise' {
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
  if (percent >= 90) return '[&_[data-slot=progress-indicator]]:bg-destructive'
  if (percent >= 75) return '[&_[data-slot=progress-indicator]]:bg-warning'
  return '[&_[data-slot=progress-indicator]]:bg-success'
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
  const statusBadgeVariant =
    (status && STATUS_BADGE_VARIANT[status]) ?? 'outline'

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
      <DropdownMenuTrigger
        render={
          <Badge
            variant={planVariant}
            aria-label={`${planDisplay} plan and usage`}
          >
            <Icon data-icon="inline-start" />
            <span className="font-medium">{planDisplay}</span>
            <ChevronDown data-icon="inline-end" className="opacity-60" />
          </Badge>
        }
      />
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-72 rounded-xl p-0 shadow-lg"
      >
        <div
          className={cn(
            'flex items-center gap-3 border-b px-3 py-3',
            colors.bg
          )}
        >
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-xl bg-background/80 shadow-sm',
              colors.icon
            )}
          >
            <Icon className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Badge variant={planVariant} className="bg-background/70">
                {planDisplay}
              </Badge>
              {plan.isTrial && (
                <Badge variant="trialing" className="bg-background/70">
                  Trial
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {plan.priceMonthly > 0
                ? `$${plan.priceMonthly}/month`
                : plan.price}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1.5 border-b px-3 py-2.5">
          <span className="text-xs text-muted-foreground">Status</span>
          <div className="justify-self-end">
            <Badge
              variant={
                statusBadgeVariant as
                  | 'active'
                  | 'trialing'
                  | 'past_due'
                  | 'canceled'
                  | 'inactive'
                  | 'outline'
              }
            >
              {statusLabel}
            </Badge>
          </div>

          {renewalDate && (
            <>
              <span className="text-xs text-muted-foreground">
                {renewalLabel}
              </span>
              <span className="flex items-center justify-end gap-1 text-xs font-medium tabular-nums">
                <Calendar className="size-3 text-muted-foreground" />
                {formatDate(renewalDate)}
              </span>
            </>
          )}

          {subscription?.cancelAtPeriodEnd && (
            <p className="col-span-2 rounded-md bg-warning/10 px-2 py-1.5 text-xs text-warning">
              Cancellation takes effect at period end
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 border-b p-3">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="shrink-0 font-medium">Messages</span>
            {isUnlimited ? (
              <span className="shrink-0 text-muted-foreground">Unlimited</span>
            ) : usage ? (
              <span className="shrink-0 font-semibold whitespace-nowrap text-foreground tabular-nums">
                {formatNumber(usage.messages)} / {formatNumber(usage.limit)}
              </span>
            ) : (
              <Skeleton className="h-3 w-20" />
            )}
          </div>

          {usage && !isUnlimited && (
            <Progress
              value={Math.min(percent, 100)}
              aria-label="Monthly message usage"
              className={cn('h-1.5 gap-0', getUsageColorClass(percent))}
            />
          )}

          {isOverLimit && (
            <p className="flex items-center gap-1 text-xs text-destructive">
              <Zap className="size-3" />
              Limit reached — upgrade to continue
            </p>
          )}
        </div>

        <div className="p-2">
          <Button
            size="sm"
            variant={
              planName === 'free' || !subscription ? 'default' : 'outline'
            }
            className="w-full"
            onClick={handleManageBilling}
          >
            <CreditCard data-icon="inline-start" />
            {planName === 'free' || !subscription
              ? 'View plans'
              : 'Manage billing'}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
