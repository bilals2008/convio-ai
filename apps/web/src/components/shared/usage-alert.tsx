import { AlertTriangle, ArrowUpRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUsage, usePlan, useCheckout } from '@/lib/hooks/use-billing'

interface UsageAlertMock {
  planName: 'free' | 'pro' | 'enterprise'
  messages: number
  limit: number
  messagesPercent: number
}

interface UsageAlertProps {
  variant?: 'banner' | 'inline'
  showWhenHealthy?: boolean
  className?: string
  mock?: UsageAlertMock
}

function getThreshold(percent: number) {
  if (percent >= 100) return 'exceeded'
  if (percent >= 90) return 'critical'
  if (percent >= 75) return 'warning'
  return 'ok'
}

function getThresholdColor(threshold: string) {
  switch (threshold) {
    case 'exceeded': return 'destructive'
    case 'critical': return 'destructive'
    case 'warning': return 'warning'
    default: return 'success'
  }
}

export function UsageAlert({
  variant = 'banner',
  showWhenHealthy = false,
  className,
  mock,
}: UsageAlertProps) {
  const { data: usage, isLoading: usageLoading } = useUsage()
  const { data: plan, isLoading: planLoading } = usePlan()
  const checkout = useCheckout()

  const isLoading = mock ? false : usageLoading || planLoading
  const resolvedUsage = mock
    ? { messages: mock.messages, limit: mock.limit, messagesPercent: mock.messagesPercent }
    : usage
  const resolvedPlan = mock ? { name: mock.planName } : plan

  if (isLoading) {
    return variant === 'banner' ? (
      <div className={cn('flex items-center gap-3 rounded-lg border bg-card p-3', className)}>
        <Skeleton className="size-4 shrink-0 rounded" />
        <Skeleton className="h-3 flex-1" />
        <Skeleton className="h-7 w-20 shrink-0 rounded-md" />
      </div>
    ) : null
  }

  if (!resolvedUsage || !resolvedPlan) return null

  const isUnlimited = resolvedUsage.limit === Infinity
  const percent = resolvedUsage.messagesPercent
  const threshold = getThreshold(percent)
  const isOk = threshold === 'ok'

  if (!showWhenHealthy && isOk && resolvedPlan.name !== 'free') return null
  if (isUnlimited) return null

  const used = resolvedUsage.messages.toLocaleString()
  const total = resolvedUsage.limit.toLocaleString()
  const remaining = Math.max(0, resolvedUsage.limit - resolvedUsage.messages).toLocaleString()

  const getMessage = () => {
    switch (threshold) {
      case 'exceeded':
        return 'Message limit reached. Upgrade your plan to continue sending messages.'
      case 'critical':
        return `You've used ${percent}% of your ${total} monthly messages (${remaining} left). Upgrade to avoid interruption.`
      case 'warning':
        return `You've used ${percent}% of your monthly messages (${remaining} remaining).`
      default:
        if (resolvedPlan.name === 'free')
          return `${used} / ${total} messages used this month. Upgrade for more.`
        return `${used} / ${total} messages used this period.`
    }
  }

  const showUpgrade = resolvedPlan.name === 'free' || resolvedPlan.name === 'pro'
  const isUrgent = threshold === 'exceeded' || threshold === 'critical'
  const color = getThresholdColor(threshold)

  const iconMap = {
    exceeded: AlertTriangle,
    critical: AlertTriangle,
    warning: AlertTriangle,
    ok: Zap,
  }
  const Icon = iconMap[threshold]

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-start gap-2.5 rounded-lg border p-3 text-xs',
          isUrgent && 'border-destructive/20 bg-destructive/5',
          !isUrgent && threshold === 'warning' && 'border-warning/20 bg-warning/5',
          !isUrgent && threshold === 'ok' && 'border-border bg-card',
          className,
        )}
      >
        <Icon className={cn(
          'mt-0.5 size-3.5 shrink-0',
          isUrgent && 'text-destructive',
          threshold === 'warning' && 'text-warning',
          threshold === 'ok' && 'text-muted-foreground',
        )} />
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-muted-foreground leading-relaxed',
            isUrgent && 'text-destructive font-medium',
          )}>
            {getMessage()}
          </p>
          {showUpgrade && (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden max-w-40">
                <div
                  className={cn('h-full rounded-full transition-all', color === 'destructive' && 'bg-destructive', color === 'warning' && 'bg-warning', color === 'success' && 'bg-success')}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
              <Button
                size="sm"
                variant={isUrgent ? 'default' : 'outline'}
                className="h-6 text-[10px] gap-1 shrink-0"
                onClick={() => { if (!mock) checkout.mutate('pro') }}
                disabled={mock ? false : checkout.isPending}
              >
                <ArrowUpRight className="size-2.5" />
                {resolvedPlan.name === 'free' ? 'Upgrade' : isUrgent ? 'Upgrade now' : 'Upgrade plan'}
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-2.5',
        isUrgent && 'border-destructive/20 bg-destructive/5',
        !isUrgent && threshold === 'warning' && 'border-warning/20 bg-warning/5',
        !isUrgent && threshold === 'ok' && 'border-border bg-card',
        className,
      )}
    >
      <Icon className={cn(
        'size-4 shrink-0',
        isUrgent && 'text-destructive',
        threshold === 'warning' && 'text-warning',
        threshold === 'ok' && 'text-muted-foreground',
      )} />
      <p className={cn(
        'flex-1 text-xs leading-relaxed min-w-0',
        isUrgent && 'text-destructive font-medium',
      )}>
        {getMessage()}
      </p>
      <div className="flex items-center gap-2 shrink-0">
        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden hidden sm:block">
          <div
            className={cn('h-full rounded-full transition-all', color === 'destructive' && 'bg-destructive', color === 'warning' && 'bg-warning', color === 'success' && 'bg-success')}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        {showUpgrade && (
          <Button
            size="sm"
            variant={isUrgent ? 'default' : 'outline'}
            className="h-7 text-xs gap-1 shrink-0"
            onClick={() => { if (!mock) checkout.mutate('pro') }}
            disabled={mock ? false : checkout.isPending}
          >
            <ArrowUpRight className="size-3" />
            {resolvedPlan.name === 'free' ? 'Upgrade' : isUrgent ? 'Upgrade now' : 'Upgrade plan'}
          </Button>
        )}
      </div>
    </div>
  )
}
