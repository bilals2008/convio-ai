import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from './scroll-reveal'
import { SectionHeading } from './section-heading'
import { FloatingOrbs } from './floating-orbs'
import { Check, Zap, Shield, Crown } from 'lucide-react'
import { pricingConfig } from '@/lib/pricing/config'
import type { PlanConfig } from '@/lib/pricing/config'
import { cn } from '@/lib/utils'

const { plans, section } = pricingConfig

const PLAN_ICONS: Record<string, React.ReactNode> = {
  zap: <Zap className="size-5" />,
  shield: <Shield className="size-5" />,
  star: <Zap className="size-5" />,
  crown: <Crown className="size-5" />,
}

function PlanCard({ plan, isYearly }: { plan: PlanConfig; isYearly: boolean }) {
  const icon = plan.icon ? PLAN_ICONS[plan.icon] : null
  const isLink = plan.href.startsWith('/')
  const price = isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price
  const period = isYearly && plan.yearlyPrice ? '/month' : plan.period

  const cardContent = (
    <div
      className={cn(
        'group relative h-full rounded-2xl border bg-card overflow-hidden flex flex-col transition-all duration-300',
        plan.highlighted
          ? 'border-primary/60 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/15 ring-1 ring-primary/20'
          : 'border-border hover:border-primary/30 hover:shadow-md',
      )}
    >
      {plan.highlighted && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/80 via-primary to-primary/80" />
      )}

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
            {plan.badge && (
              <Badge className="bg-primary/15 text-primary border border-primary/20 hover:bg-primary/15 shrink-0 text-[10px] px-1.5 py-0 h-4">
                {plan.badge}
              </Badge>
            )}
          </div>
          <p className="text-[13px] text-muted-foreground">{plan.description}</p>
        </div>

        <div className="flex items-baseline justify-center gap-1.5 mb-5">
          <span className="font-mono text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {price}
          </span>
          {period && (
            <span className="text-[13px] text-muted-foreground">{period}</span>
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
        >
          {plan.cta}
        </Button>
      </div>
    </div>
  )

  if (isLink) {
    return <Link to={plan.href} className="h-full">{cardContent}</Link>
  }

  return <a href={plan.href} className="h-full">{cardContent}</a>
}

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="relative overflow-hidden">
      <FloatingOrbs />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-glow-green opacity-20"
      />

      <div className="max-w-[1320px] mx-auto px-5 md:px-10 py-20 md:py-28">
        <ScrollReveal>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            description={section.description}
          />
        </ScrollReveal>

        {/* Monthly / Yearly Toggle */}
        <ScrollReveal>
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={cn('text-sm transition-colors', !isYearly ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                isYearly ? 'bg-primary' : 'bg-muted',
              )}
            >
              <span
                className={cn(
                  'inline-block size-4 rounded-full bg-white transition-transform',
                  isYearly ? 'translate-x-6' : 'translate-x-1',
                )}
              />
            </button>
            <span className={cn('text-sm transition-colors', isYearly ? 'text-foreground font-medium' : 'text-muted-foreground')}>
              Yearly
            </span>
            <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/20 text-[10px] px-1.5 py-0 h-4">
              Save 20%
            </Badge>
          </div>
        </ScrollReveal>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 items-stretch mt-10">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.06} className="h-full">
              <PlanCard plan={plan} isYearly={isYearly} />
            </ScrollReveal>
          ))}
        </div>

        {/* View All Plans CTA */}
        <ScrollReveal>
          <div className="flex justify-center mt-10">
            <Link to="/pricing">
              <Button variant="outline" className="gap-2">
                Compare all plans & FAQ
                <span className="text-muted-foreground">→</span>
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
