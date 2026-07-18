import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from './scroll-reveal'
import { SectionHeading } from './section-heading'
import { Check, Zap, Shield } from 'lucide-react'
import { pricingConfig } from '@/lib/pricing/config'
import type { PlanConfig } from '@/lib/pricing/config'

const { plans, section, footer } = pricingConfig

const PLAN_ICONS: Record<string, React.ReactNode> = {
  zap: <Zap className="size-5 text-primary" />,
  shield: <Shield className="size-5 text-muted-foreground" />,
  star: <Check className="size-5 text-muted-foreground" />,
}

function PlanCard({ plan }: { plan: PlanConfig }) {
  const icon = plan.icon ? PLAN_ICONS[plan.icon] : null
  const isLink = plan.href.startsWith('/')

  const cardContent = (
    <div
      className={`group relative h-full rounded-2xl border bg-card overflow-hidden flex flex-col transition-all duration-300 ${
        plan.highlighted
          ? 'border-primary shadow-lg glow-primary-sm hover:shadow-xl'
          : 'border-border hover:border-primary/30 hover:shadow-md'
      }`}
    >
      {plan.highlighted && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/80 via-primary to-primary/80" />
      )}

      <div className="relative flex flex-col h-full p-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <p className="text-[13px] text-muted-foreground mt-0.5">{plan.description}</p>
            </div>
          </div>
          {plan.badge && (
            <Badge className="bg-primary/15 text-primary border border-primary/20 hover:bg-primary/15 shrink-0">
              {plan.badge}
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-6">
          <span className="font-mono text-4xl font-bold tracking-tight text-foreground">
            {plan.price}
          </span>
          {plan.period && (
            <span className="text-[13px] text-muted-foreground">{plan.period}</span>
          )}
        </div>

        <div className="h-px bg-border mb-6" />

        {/* Features */}
        <ul className="space-y-3 mb-8 flex-1">
          {plan.features.map((feature) => (
            <li key={feature.text} className="flex items-start gap-2.5 text-[13px]">
              <span className="mt-0.5 size-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Check className="size-3 text-primary" />
              </span>
              <span className="text-muted-foreground leading-snug">{feature.text}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          variant={plan.variant}
          className="w-full py-3 text-[14px] h-auto transition-transform duration-200 group-hover:scale-[1.02]"
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
  return (
    <section id="pricing" className="relative">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-glow-green opacity-20"
      />

      <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-20 md:py-28">
        <ScrollReveal>
          <SectionHeading
            eyebrow={section.eyebrow}
            title={section.title}
            description={section.description}
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px] items-stretch mt-14">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.06} className="h-full">
              <PlanCard plan={plan} />
            </ScrollReveal>
          ))}
        </div>

        <p className="mt-8 text-center text-[12px] text-muted-foreground">
          {footer}
        </p>
      </div>
    </section>
  )
}
