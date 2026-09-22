import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { SectionIntro } from './section-intro'
import { Reveal } from './motion'
import { Check, Zap, Shield, Star, Crown } from 'lucide-react'
import { pricingConfig } from '@/lib/pricing/config'
import type { PlanConfig } from '@/lib/pricing/config'
import { usePricingPlans } from '@/lib/pricing/use-pricing-config'
import { cn } from '@/lib/utils'
import { useSession } from '@/lib/hooks/useAuth'

const { section } = pricingConfig

const PLAN_ICONS: Record<string, React.ReactNode> = {
  zap: <Zap className="size-5" />,
  shield: <Shield className="size-5" />,
  star: <Star className="size-5" />,
  crown: <Crown className="size-5" />,
}

function PlanCard({ plan, isYearly, onAction }: { plan: PlanConfig; isYearly: boolean; onAction?: (plan: PlanConfig) => void }) {
  const icon = plan.icon ? PLAN_ICONS[plan.icon] : null
  const monthlyPrice = isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price
  const period = isYearly && plan.yearlyPrice ? '/month' : plan.period
  const yearlyTotal = isYearly && plan.yearlyPrice ? parseInt(plan.yearlyPrice.replace('$', '')) * 12 : null

  const cardContent = (
    <div
      className={cn(
        'group relative h-full rounded-2xl border bg-card overflow-hidden flex flex-col transition-all duration-300',
        plan.highlighted
          ? 'border-primary/60 ring-1 ring-primary/20'
          : 'border-border hover:border-primary/30',
        plan.comingSoon && 'opacity-70',
      )}
    >
      <div className="relative flex flex-col h-full p-5 md:p-7">
        <div className="flex flex-col items-center text-center mb-5">
          {icon && (
            <div className={cn(
              'flex size-10 items-center justify-center rounded-xl bg-primary/10 mb-3',
              plan.iconColor,
            )}>
              {icon}
            </div>
          )}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
            {plan.comingSoon ? (
              <Badge className="bg-muted text-muted-foreground border border-border hover:bg-muted shrink-0 text-[10px] px-1.5 py-0 h-4">
                Coming Soon
              </Badge>
            ) : plan.badge && (
              <Badge className="bg-primary/15 text-primary border border-primary/20 hover:bg-primary/15 shrink-0 text-[10px] px-1.5 py-0 h-4">
                {plan.badge}
              </Badge>
            )}
          </div>
          <p className="text-[13px] text-muted-foreground">{plan.description}</p>
        </div>

        <div className="flex flex-col items-center mb-5">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {monthlyPrice}
            </span>
            {period && (
              <span className="text-[13px] text-muted-foreground">{period}</span>
            )}
          </div>
          {isYearly && yearlyTotal !== null && (
            <span className="text-[11px] text-muted-foreground mt-1">
              billed ${yearlyTotal}/year
            </span>
          )}
        </div>

        <div className="h-px bg-border mb-5" />

        <ul className="space-y-2.5 mb-6">
          {plan.features.map((feature) => (
            <li key={feature.text} className="flex items-start gap-2 text-[12px] md:text-[13px]">
              <span className="mt-0.5 size-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Check className="size-2.5 text-primary" />
              </span>
              <span className="text-muted-foreground leading-snug">{feature.text}</span>
            </li>
          ))}
        </ul>

        <Button
          variant={plan.variant}
          className="w-full mt-auto py-2.5 md:py-3 text-[13px] md:text-[14px] h-auto transition-transform duration-200 group-hover:scale-[1.02]"
          onClick={() => onAction?.(plan)}
          disabled={plan.comingSoon}
        >
          {plan.comingSoon ? 'Coming Soon' : plan.cta}
        </Button>
      </div>
    </div>
  )

  return <div className="h-full">{cardContent}</div>
}

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false)
  const navigate = useNavigate()
  const { data: session } = useSession()
  const { data: remotePlans } = usePricingPlans()
  const plans = remotePlans ?? pricingConfig.plans

  const handlePlanAction = useCallback((plan: PlanConfig) => {
    if (plan.key === 'enterprise') {
      window.location.href = plan.href
      return
    }
    if (session?.user) {
      navigate(`/settings/billing?plan=${plan.key}&billing=${isYearly ? 'yearly' : 'monthly'}`)
    } else {
      navigate(`/signup?plan=${plan.key}&billing=${isYearly ? 'yearly' : 'monthly'}`)
    }
  }, [session, isYearly, navigate])

  return (
    <section id="pricing" className="relative overflow-hidden border-b border-border bg-background">
      <div className="max-w-[1320px] mx-auto px-5 md:px-10 py-20 md:py-28">
        <SectionIntro
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
        />

        {/* Monthly / Yearly Toggle */}
        <Reveal>
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={cn('text-sm transition-colors', !isYearly ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              aria-label="Toggle yearly billing"
            />
            <span className={cn('text-sm transition-colors', isYearly ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              Yearly
            </span>
            <Badge className="bg-success/15 text-success border border-success/30 text-[10px] px-1.5 py-0 h-4 font-medium">
              Save 20%
            </Badge>
          </div>
        </Reveal>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-stretch mt-10">
          {plans.map((plan, i) => (
                <Reveal key={plan.name} delay={i * 0.06} className="h-full">
                  <PlanCard plan={plan} isYearly={isYearly} onAction={handlePlanAction} />
                </Reveal>
          ))}
        </div>

        {/* View All Plans CTA */}
        <Reveal>
          <div className="flex justify-center mt-10">
            <Link to="/pricing">
              <Button variant="outline" className="gap-2">
                Compare all plans & FAQ
                <span className="text-muted-foreground">→</span>
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
