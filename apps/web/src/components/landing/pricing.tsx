import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from './scroll-reveal'
import { SectionHeading } from './section-heading'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: '$0',
    period: 'forever',
    features: [
      '1 AI agent',
      '1 knowledge base',
      '1,000 messages/mo',
      'Web widget',
      'Basic analytics',
    ],
    cta: 'Get Started',
    href: '/signup',
    variant: 'outline' as const,
    highlighted: false,
  },
  {
    name: 'Pro',
    description: 'For growing businesses',
    price: '$29',
    period: '/month',
    badge: 'Most Popular',
    features: [
      'Unlimited agents',
      '10 knowledge bases',
      '50,000 messages/mo',
      'Multi-channel',
      'Advanced analytics',
      'Custom branding',
    ],
    cta: 'Start Free Trial',
    href: '/signup',
    variant: 'default' as const,
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: 'Custom',
    period: '',
    features: [
      'Unlimited agents',
      'Unlimited knowledge bases',
      'Unlimited messages',
      'SSO / SAML',
      'Dedicated support',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    href: 'mailto:sales@convio.ai',
    variant: 'outline' as const,
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="relative border-t border-border/60">
      <div className="max-w-[1160px] mx-auto px-5 md:px-10 py-20 md:py-28">
        <ScrollReveal>
          <SectionHeading
            eyebrow="Pricing"
            title="Simple, transparent pricing"
            description="Start free and upgrade as you grow. Every plan includes access to RAG and community support."
          />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px] items-stretch mt-14">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.06} className="h-full">
              <div
                className={`relative h-full rounded-2xl border bg-card overflow-hidden flex flex-col transition-colors duration-200 ${
                  plan.highlighted
                    ? 'border-primary shadow-lg glow-primary-sm'
                    : 'border-border hover:border-border/70'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
                )}

                <div className="relative flex flex-col h-full p-7">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                    {plan.badge && (
                      <Badge className="bg-primary/15 text-primary border border-primary/20 hover:bg-primary/15">
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[13px] text-muted-foreground mb-5">{plan.description}</p>

                  <div className="flex items-baseline gap-1.5 mb-6">
                    <span className="font-mono text-4xl font-bold tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-[13px] text-muted-foreground">{plan.period}</span>
                    )}
                  </div>

                  <div className="h-px bg-border mb-6" />

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-[13px] text-muted-foreground">
                        <span className="mt-0.5 size-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Check className="size-3 text-primary" />
                        </span>
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.href.startsWith('/') ? (
                    <Link to={plan.href} className="mt-auto">
                      <Button variant={plan.variant} className="w-full py-3 text-[14px] h-auto">
                        {plan.cta}
                      </Button>
                    </Link>
                  ) : (
                    <a href={plan.href} className="mt-auto">
                      <Button variant={plan.variant} className="w-full py-3 text-[14px] h-auto">
                        {plan.cta}
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <p className="mt-8 text-center text-[12px] text-muted-foreground">
          All plans include RAG and community access. Prices in USD.
        </p>
      </div>
    </section>
  )
}
