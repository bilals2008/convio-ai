import {
  CreditCard,
  Calendar,
  MessageSquare,
  Hash,
  Crown,
  Copy,
  ArrowUpRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { useProfile } from '@/lib/hooks/use-profile'
import { usePlan, useUsage, usePortal } from '@/lib/hooks/use-billing'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function InfoRow({
  icon,
  label,
  value,
  action,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50">
          {icon}
        </div>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value}
        {action}
      </div>
    </div>
  )
}

export function AccountOverviewCard() {
  const { data: profile } = useProfile()
  const { data: plan } = usePlan()
  const { data: usage } = useUsage()
  const portal = usePortal()

  const joinedDate = profile?.createdAt ? formatDate(profile.createdAt) : '18 May 2025'
  const accountId = profile?.id ? `${profile.id.slice(0, 8)}…${profile.id.slice(-4)}` : 'usr_—'
  const planLabel = plan?.label || 'Free'
  const planVariant = (plan?.name === 'pro' ? 'pro' : plan?.name === 'enterprise' ? 'enterprise' : 'free') as
    | 'free'
    | 'pro'
    | 'enterprise'

  const messagesUsed = usage ? `${usage.messages.toLocaleString()} / ${usage.limit.toLocaleString()}` : '0 / 0'
  const messagesPercent = usage ? Math.min(usage.messagesPercent, 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Overview</CardTitle>
        <CardDescription>Your account details and usage summary.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border/60">
          <div className="space-y-1">
            <InfoRow
              icon={<Calendar className="size-4 text-muted-foreground" />}
              label="Joined"
              value={<span className="text-sm font-medium">{joinedDate}</span>}
            />
            <InfoRow
              icon={<Hash className="size-4 text-muted-foreground" />}
              label="Account ID"
              value={<span className="font-mono text-sm text-muted-foreground">{accountId}</span>}
              action={
                <button
                  type="button"
                  className="rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-muted-foreground"
                  title="Copy account ID"
                >
                  <Copy className="size-3.5" />
                </button>
              }
            />
          </div>

          <div className="space-y-1 pt-2">
            <InfoRow
              icon={<Crown className="size-4 text-muted-foreground" />}
              label="Current Plan"
              value={
                <Badge variant={planVariant} className="capitalize">
                  {planLabel}
                </Badge>
              }
            />
          </div>

          <div className="pt-3">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50">
                  <MessageSquare className="size-4 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium">Messages Used</span>
              </div>
              <span className="text-sm font-semibold tabular-nums">{messagesUsed}</span>
            </div>
            <Progress value={messagesPercent}>
              <ProgressLabel className="sr-only">Message usage</ProgressLabel>
              <ProgressValue className="text-xs" />
            </Progress>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => portal.mutate()}
              className="flex w-full items-center justify-between rounded-lg border border-border/60 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50">
                  <CreditCard className="size-4 text-muted-foreground" />
                </div>
                Manage Billing
              </div>
              <ArrowUpRight className="size-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
