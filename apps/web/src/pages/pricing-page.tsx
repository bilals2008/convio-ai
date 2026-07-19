import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar, Footer } from '@/components/landing'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { SectionHeading } from '@/components/landing/section-heading'
import { FloatingOrbs } from '@/components/landing/floating-orbs'
import { Check, Zap, Shield, Crown, Plus, Minus, ShieldCheck, CreditCard, Headphones, Clock } from 'lucide-react'
import { pricingConfig } from '@/lib/pricing/config'
import type { PlanConfig } from '@/lib/pricing/config'
import { cn } from '@/lib/utils'

const { plans, section, footer } = pricingConfig

const PLAN_ICONS: Record<string, React.ReactNode> = {
  zap: <Zap className="size-5" />,
  shield: <Shield className="size-5" />,
  star: <Zap className="size-5" />,
  crown: <Crown className="size-5" />,
}

const COMPARISON_FEATURES = [
  { name: 'AI Agents', free: '1', pro: '5', business: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Messages/mo', free: '500', pro: '25,000', business: '150,000', enterprise: 'Unlimited' },
  { name: 'Knowledge Bases', free: '1', pro: '10', business: '50', enterprise: 'Unlimited' },
  { name: 'Channels', free: 'Web', pro: 'All', business: 'All', enterprise: 'All' },
  { name: 'RAG', free: true, pro: true, business: true, enterprise: true },
  { name: 'API Access', free: false, pro: true, business: true, enterprise: true },
  { name: 'Custom Branding', free: false, pro: false, business: true, enterprise: true },
  { name: 'Priority Support', free: false, pro: false, business: true, enterprise: true },
  { name: 'SSO / SAML', free: false, pro: false, business: false, enterprise: true },
  { name: 'Dedicated Onboarding', free: false, pro: false, business: false, enterprise: true },
  { name: 'SLA Guarantee', free: false, pro: false, business: false, enterprise: true },
]

const FAQS = [
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, you can cancel your subscription at any time. Your plan will remain active until the end of the current billing period.',
  },
  {
    q: 'What happens if I exceed my message limit?',
    a: 'Once you reach your monthly message limit, your AI agents will stop responding to new messages. You can upgrade your plan at any time to continue.',
  },
  {
    q: 'Do unused messages roll over?',
    a: 'No, message counts reset at the beginning of each calendar month. Unused messages do not roll over to the next month.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'We offer refunds within the first 14 days of a new subscription. Contact our support team for assistance.',
  },
  {
    q: 'Which AI providers are supported?',
    a: 'We support OpenAI (GPT-4o, GPT-4o-mini), Anthropic (Claude 3.5 Sonnet, Claude 3 Haiku), Google (Gemini 1.5 Pro/Flash), and Groq (Llama 3.1 70B). You can also bring your own API keys.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we prorate the difference.',
  },
]

function PlanCard({ plan, isYearly }: { plan: PlanConfig; isYearly: boolean }) {
  const icon = plan.icon ? PLAN_ICONS[plan.icon] : null
  const isLink = plan.href.startsWith('/')
  const monthlyPrice = isYearly && plan.yearlyPrice ? plan.yearlyPrice : plan.price
  const period = isYearly && plan.yearlyPrice ? '/month' : plan.period
  const yearlyTotal = isYearly && plan.yearlyPrice ? parseInt(plan.yearlyPrice.replace('$', '')) * 12 : null

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

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-left cursor-pointer"
      >
        <span className="text-sm font-medium text-foreground pr-4">{q}</span>
        <span className="size-5 shrink-0 flex items-center justify-center rounded-full bg-muted text-muted-foreground">
          {open ? <Minus className="size-3" /> : <Plus className="size-3" />}
        </span>
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="overflow-hidden">
          <p className="pb-4 text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
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
                <Badge className="bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[10px] px-1.5 py-0 h-4 font-medium">
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

            {/* Trust Section */}
            <ScrollReveal>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-10 text-[12px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-emerald-500" /> Cancel anytime</span>
                <span className="flex items-center gap-1.5"><CreditCard className="size-3.5 text-emerald-500" /> Secure billing</span>
                <span className="flex items-center gap-1.5"><Check className="size-3.5 text-emerald-500" /> No hidden fees</span>
                <span className="flex items-center gap-1.5"><Headphones className="size-3.5 text-emerald-500" /> Community support</span>
                <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-emerald-500" /> 99.9% uptime</span>
              </div>
            </ScrollReveal>

            {/* Feature Comparison Table */}
            <ScrollReveal>
              <div className="mt-20">
                <h3 className="text-xl font-semibold text-center mb-8">Compare plans</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 pr-4 font-medium text-muted-foreground">Feature</th>
                        {plans.map((p) => (
                          <th key={p.key} className={cn(
                            'text-center py-3 px-3 font-medium',
                            p.highlighted ? 'text-primary' : 'text-foreground',
                          )}>
                            {p.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISON_FEATURES.map((f, i) => (
                        <tr key={f.name} className={cn('border-b border-border/50 transition-colors hover:bg-muted/50', i % 2 === 0 && 'bg-muted/30')}>
                          <td className="py-3 pr-4 text-muted-foreground">{f.name}</td>
                          {(['free', 'pro', 'business', 'enterprise'] as const).map((plan) => (
                            <td key={plan} className="text-center py-3 px-3">
                              {typeof f[plan] === 'boolean' ? (
                                f[plan] ? (
                                  <Check className="size-4 text-emerald-500 mx-auto" />
                                ) : (
                                  <span className="text-muted-foreground/40">—</span>
                                )
                              ) : (
                                <span className="text-foreground">{f[plan]}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollReveal>

            {/* FAQ Section */}
            <ScrollReveal>
              <div className="mt-20 max-w-2xl mx-auto">
                <h3 className="text-xl font-semibold text-center mb-8">Frequently asked questions</h3>
                <div className="rounded-xl border bg-card px-5">
                  {FAQS.map((faq) => (
                    <FAQ key={faq.q} q={faq.q} a={faq.a} />
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <p className="mt-8 text-center text-[12px] text-muted-foreground">
              {footer}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
