import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from './scroll-reveal'
import { GlowCard } from './glow-card'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: '$0',
    period: 'forever',
    features: [
      '1 AI Agent',
      '1 Chatbot',
      '1,000 messages/month',
      'Web channel only',
      'Basic analytics',
      'Community support',
    ],
    cta: 'Get Started',
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
      '10 AI Agents',
      '25 Chatbots',
      'Unlimited messages',
      'All channels',
      'Advanced analytics',
      'Custom branding',
      'Priority support',
      'Knowledge base',
    ],
    cta: 'Start Free Trial',
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
      'Unlimited chatbots',
      'Unlimited messages',
      'All channels + API',
      'Custom AI models',
      'SSO & SAML',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    variant: 'outline' as const,
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="max-w-[1160px] mx-auto px-5 md:px-10 py-16">
      <ScrollReveal>
        <div className="text-center mb-14">
          <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-primary mb-2">Pricing</div>
          <h2 className="font-heading text-[clamp(26px,3.6vw,46px)] text-foreground leading-[1.15] tracking-[-0.02em] mb-3">
            Simple, transparent pricing
          </h2>
          <p className="text-[15px] text-muted-foreground leading-[1.65] max-w-[490px] mx-auto">
            Start free, upgrade when you need more. No hidden fees.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px] items-stretch">
        {plans.map((plan, i) => (
          <ScrollReveal key={plan.name} delay={i * 0.06} className="h-full">
            <GlowCard
              decorations={plan.highlighted}
              className={plan.highlighted ? 'border-primary shadow-lg glow-primary-sm relative' : ''}
            >
              {plan.badge && (
                <Badge className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3">
                  {plan.badge}
                </Badge>
              )}
              <div className="p-8 flex flex-col h-full">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/signup">
                  <Button variant={plan.variant} className="w-full py-3 text-base h-auto">
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </GlowCard>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
