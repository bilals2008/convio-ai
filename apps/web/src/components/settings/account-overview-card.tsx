import { CreditCard, Calendar, HardDrive, Hash } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { useProfile } from '@/lib/hooks/use-profile'
import { useAuth } from '@/lib/auth-context'
import { useOrg } from '@/lib/org-context'
import { usePlan, useUsage } from '@/lib/hooks/use-billing'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function AccountOverviewCard() {
  const { data: profile } = useProfile()
  const { user } = useAuth()
  const { org } = useOrg()
  const { data: plan } = usePlan()
  const { data: usage } = useUsage()

  const userId = user?.id || profile?.id || 'usr_bdr7l2a3e1c'
  const joinedDate = profile?.createdAt ? formatDate(profile.createdAt) : '18 May 2025'
  const planLabel = plan?.label || 'Free'
  const isPro = plan?.name === 'pro' || plan?.name === 'enterprise'

  const storageUsed = usage ? `${usage.messages} / ${usage.limit}` : '0 / 0'
  const storagePercent = usage ? Math.min(usage.messagesPercent, 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Overview</CardTitle>
        <CardDescription>Your account details and usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-0 divide-y divide-foreground/5">
        <div className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Hash className="size-3.5" />
            <span className="text-xs">Account ID</span>
          </div>
          <span className="font-mono text-sm">{userId}</span>
        </div>

        <div className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="size-3.5" />
            <span className="text-xs">Joined</span>
          </div>
          <span className="text-sm font-medium">{joinedDate}</span>
        </div>

        <div className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="size-3.5" />
            <span className="text-xs">Current Plan</span>
          </div>
          <Badge variant={isPro ? 'default' : 'secondary'} className="capitalize">
            {planLabel}
          </Badge>
        </div>

        <div className="space-y-2 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <HardDrive className="size-3.5" />
              <span className="text-xs">Messages Used</span>
            </div>
            <span className="text-sm font-medium">{storageUsed}</span>
          </div>
          <Progress value={storagePercent}>
            <ProgressLabel className="sr-only">Storage usage</ProgressLabel>
            <ProgressValue />
          </Progress>
        </div>

        <div className="pt-3">
          <Button variant="outline" className="w-full" size="sm">
            <CreditCard className="size-3.5" />
            Manage Billing
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
