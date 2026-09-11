import { ArrowRight, CreditCard, CheckCircle, Zap, Building2, Crown, Star } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocFeatureCard, DocNextStepCard } from '@/components/docs'
import { pricingConfig } from '@/lib/pricing/config'

const ICON_MAP: Record<string, typeof Zap> = { zap: Zap, star: Star, crown: Crown, shield: CreditCard }

const COLOR_MAP: Record<string, { color: string; bg: string }> = {
  'text-muted-foreground': { color: 'text-muted-foreground', bg: 'bg-muted' },
  'text-info': { color: 'text-info', bg: 'bg-info/10' },
  'text-primary': { color: 'text-primary', bg: 'bg-primary/10' },
  'text-chart-4': { color: 'text-warning', bg: 'bg-warning/10' },
}

const docsFeatures: Record<string, string[]> = {
  free: ['1 agent', '500 messages/month', '1 knowledge base', 'Web widget', 'Basic analytics', 'Community support'],
  starter: ['3 agents', '5,000 messages/month', '3 knowledge bases', 'Web + WhatsApp', 'API access', '14-day free trial'],
  pro: ['10 agents', '25,000 messages/month', '10 knowledge bases', 'All channels', 'Advanced analytics', 'API access', 'Priority support', '14-day free trial'],
  enterprise: ['Unlimited agents', 'Unlimited messages', 'Unlimited knowledge bases', 'SSO / SAML', 'Dedicated onboarding', 'SLA guarantee'],
}

const comparisonRows = [
  { label: 'Agents', free: '1', starter: '3', pro: '10', enterprise: 'Unlimited' },
  { label: 'Messages / month', free: '500', starter: '5,000', pro: '25,000', enterprise: 'Unlimited' },
  { label: 'Knowledge bases', free: '1', starter: '3', pro: '10', enterprise: 'Unlimited' },
  { label: 'Channels', free: 'Web', starter: 'Web + WhatsApp', pro: 'All', enterprise: 'All' },
  { label: 'Analytics', free: 'Basic', starter: 'Basic', pro: 'Advanced', enterprise: 'Custom dashboards' },
  { label: 'Support', free: 'Community', starter: 'Community', pro: 'Priority', enterprise: 'Dedicated manager' },
]

const plans = pricingConfig.plans.map((p) => {
  const iconKey = p.icon ?? 'zap'
  const colors = COLOR_MAP[p.iconColor ?? 'text-muted-foreground'] ?? COLOR_MAP['text-muted-foreground']
  return {
    ...p,
    icon: ICON_MAP[iconKey] ?? Zap,
    color: colors.color,
    bg: colors.bg,
    features: docsFeatures[p.key] ?? p.features.map((f) => f.text),
  }
})

export default function PlansPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Pricing Plans' },
        ]}
        title="Pricing Plans"
        description="Convio offers flexible plans for individuals, growing teams, and enterprise organizations."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio's pricing scales with your needs. Start free to explore the platform, then upgrade as your team and message volume grow. All paid plans include a 14-day free trial — no credit card required to start.
      </p>

      <h2 id="plan-overview">Plan Overview</h2>
      <DocCardGrid columns={2}>
        {plans.map((plan) => (
          <DocFeatureCard
            key={plan.name}
            icon={plan.icon}
            iconBg={plan.bg}
            iconColor={plan.color}
            title={`${plan.name} — ${plan.price}${plan.period}`}
            description={plan.description}
            href="#comparison"
          />
        ))}
      </DocCardGrid>

      <h2 id="comparison">Plan Comparison</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[12px] leading-[1.5]">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Feature</th>
              {plans.map((p) => (
                <th key={p.key} className="text-center py-2 px-3 font-heading font-semibold text-foreground">{p.name}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            {comparisonRows.map((row, i) => (
              <tr key={row.label} className="border-b border-border/30">
                <td className="py-2 pr-4 text-foreground">{row.label}</td>
                {plans.map((p) => (
                  <td key={p.key} className="text-center py-2 px-3">{row[p.key as keyof typeof row]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="free-plan">Free Plan</h2>
      <p>
        The free plan is fully functional — you can create one agent, connect one knowledge base, and send up to 500 messages per month. It's great for testing Convio, building a personal assistant, or exploring the platform before committing.
      </p>
      <DocCallout variant="info" icon={Zap} title="No credit card required">
        Sign up and start building immediately. Upgrade to a paid plan anytime when you need more capacity.
      </DocCallout>

      <h2 id="starter-plan">Starter Plan</h2>
      <p>
        The Starter plan is for small businesses getting started with AI. Build up to 3 agents, send 5,000 messages per month, and connect WhatsApp alongside your web widget. Includes API access for custom integrations.
      </p>

      <h2 id="pro-plan">Pro Plan</h2>
      <p>
        The Pro plan unlocks higher limits and priority support. Build up to 10 agents, send 25,000 messages per month, and connect all channels. Includes advanced analytics with conversation trends, satisfaction scores, and resolution metrics.
      </p>

      <h2 id="enterprise-plan">Enterprise Plan</h2>
      <p>
        Enterprise plans are customized for your organization's needs. Unlimited agents, custom message volumes, dedicated support, custom SLAs, and optional on-premise deployment. Contact our sales team to discuss your requirements.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={CheckCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="View Plan Features"
          href="/docs/plan-features"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Upgrade Your Plan"
          href="/docs/upgrading-plan"
        />
      </DocCardGrid>
    </DocContent>
  )
}
