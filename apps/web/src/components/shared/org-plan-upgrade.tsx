import { Building2, ArrowUpRight, Crown, Zap, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface OrgPlanUpgradeProps {
  currentOrgs: number
  currentPlan: string
  limit: number
}

const PLANS = [
  { key: 'pro', name: 'Pro', orgs: 3, price: '$39/mo', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { key: 'business', name: 'Business', orgs: 5, price: '$99/mo', icon: Crown, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { key: 'enterprise', name: 'Enterprise', orgs: 'Unlimited', price: 'Custom', icon: Shield, color: 'text-violet-500', bg: 'bg-violet-500/10' },
]

export function OrgPlanUpgrade({ currentOrgs, currentPlan, limit }: OrgPlanUpgradeProps) {
  const navigate = useNavigate()

  return (
    <div className="space-y-4">
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <span className="flex size-7 items-center justify-center rounded-full bg-destructive/10">
              <Building2 className="size-3.5 text-destructive" />
            </span>
            Organization limit reached
          </CardTitle>
          <CardDescription className="text-xs">
            Your {currentPlan === 'free' ? 'Free' : currentPlan === 'pro' ? 'Pro' : 'Business'} plan allows {limit} organization{limit === 1 ? '' : 's'}. You currently have {currentOrgs}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-xs text-muted-foreground">
            <Building2 className="size-3.5 shrink-0" />
            <span>
              <strong className="text-foreground">{currentOrgs}</strong> / {limit === Infinity ? '∞' : limit} organizations used
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground px-0.5">Upgrade to unlock more organizations</p>
        <div className="grid gap-2">
          {PLANS.map((plan) => {
            const Icon = plan.icon
            const isCurrent = plan.key === currentPlan
            return (
              <button
                key={plan.key}
                type="button"
                onClick={() => navigate(`/settings/billing?plan=${plan.key}`)}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-colors hover:bg-accent disabled:opacity-50"
                disabled={isCurrent}
              >
                <div className={cn('flex size-8 items-center justify-center rounded-lg', plan.bg)}>
                  <Icon className={cn('size-4', plan.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{plan.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] text-muted-foreground">(Current)</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {typeof plan.orgs === 'number' ? `Up to ${plan.orgs} organizations` : `${plan.orgs} organizations`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">{plan.price}</p>
                </div>
                {!isCurrent && (
                  <ArrowUpRight className="size-3.5 text-muted-foreground shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <Button
        variant="default"
        size="sm"
        className="w-full gap-1.5"
        onClick={() => navigate('/settings/billing')}
      >
        <ArrowUpRight className="size-3.5" />
        View billing details
      </Button>
    </div>
  )
}
