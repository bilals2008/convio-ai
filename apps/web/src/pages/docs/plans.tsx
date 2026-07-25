import { ArrowRight, CreditCard, CheckCircle, Zap, Building2, Crown } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocFeatureCard, DocNextStepCard } from '@/components/docs'

const plans = [
  {
    icon: Zap,
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Get started with Convio at no cost. Ideal for personal projects and exploration.',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    features: ['1 agent', '100 messages/month', '1 team member', '1 knowledge base', 'Community support'],
  },
  {
    icon: Crown,
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing teams that need more capacity, faster support, and advanced analytics.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    features: ['10 agents', '10,000 messages/month', '5 team members', '10 knowledge bases', 'Priority email support'],
  },
  {
    icon: Building2,
    name: 'Business',
    price: '$99',
    period: '/month',
    description: 'Advanced features for scaling teams with full collaboration and analytics.',
    color: 'text-info',
    bg: 'bg-info/10',
    features: ['50 agents', '50,000 messages/month', '20 team members', 'Unlimited knowledge bases', 'Priority support + Slack'],
  },
  {
    icon: CreditCard,
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Tailored solutions with dedicated support, custom SLAs, and on-premise deployment.',
    color: 'text-warning',
    bg: 'bg-warning/10',
    features: ['Unlimited agents', 'Custom message limits', 'Unlimited team members', 'Unlimited knowledge bases', 'Dedicated account manager'],
  },
]

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
              <th className="text-center py-2 px-3 font-heading font-semibold text-foreground">Free</th>
              <th className="text-center py-2 px-3 font-heading font-semibold text-foreground">Pro</th>
              <th className="text-center py-2 px-3 font-heading font-semibold text-foreground">Business</th>
              <th className="text-center py-2 px-3 font-heading font-semibold text-foreground">Enterprise</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/30">
              <td className="py-2 pr-4 text-foreground">Agents</td>
              <td className="text-center py-2 px-3">1</td>
              <td className="text-center py-2 px-3">10</td>
              <td className="text-center py-2 px-3">50</td>
              <td className="text-center py-2 px-3">Unlimited</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-2 pr-4 text-foreground">Messages / month</td>
              <td className="text-center py-2 px-3">100</td>
              <td className="text-center py-2 px-3">10,000</td>
              <td className="text-center py-2 px-3">50,000</td>
              <td className="text-center py-2 px-3">Custom</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-2 pr-4 text-foreground">Team members</td>
              <td className="text-center py-2 px-3">1</td>
              <td className="text-center py-2 px-3">5</td>
              <td className="text-center py-2 px-3">20</td>
              <td className="text-center py-2 px-3">Unlimited</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-2 pr-4 text-foreground">Knowledge bases</td>
              <td className="text-center py-2 px-3">1</td>
              <td className="text-center py-2 px-3">10</td>
              <td className="text-center py-2 px-3">Unlimited</td>
              <td className="text-center py-2 px-3">Unlimited</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-2 pr-4 text-foreground">Channels</td>
              <td className="text-center py-2 px-3">1</td>
              <td className="text-center py-2 px-3">5</td>
              <td className="text-center py-2 px-3">Unlimited</td>
              <td className="text-center py-2 px-3">Unlimited</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-2 pr-4 text-foreground">Analytics</td>
              <td className="text-center py-2 px-3">Basic</td>
              <td className="text-center py-2 px-3">Advanced</td>
              <td className="text-center py-2 px-3">Advanced + Export</td>
              <td className="text-center py-2 px-3">Custom dashboards</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">Support</td>
              <td className="text-center py-2 px-3">Community</td>
              <td className="text-center py-2 px-3">Priority email</td>
              <td className="text-center py-2 px-3">Priority + Slack</td>
              <td className="text-center py-2 px-3">Dedicated manager</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="free-plan">Free Plan</h2>
      <p>
        The free plan is fully functional — you can create one agent, connect one channel, and send up to 100 messages per month. It's great for testing Convio, building a personal assistant, or exploring the platform before committing.
      </p>
      <DocCallout variant="info" icon={Zap} title="No credit card required">
        Sign up and start building immediately. Upgrade to a paid plan anytime when you need more capacity.
      </DocCallout>

      <h2 id="pro-plan">Pro Plan</h2>
      <p>
        The Pro plan unlocks higher limits and priority support. Build up to 10 agents, send 10,000 messages per month, and invite up to 5 team members. Includes advanced analytics with conversation trends, satisfaction scores, and resolution metrics.
      </p>

      <h2 id="business-plan">Business Plan</h2>
      <p>
        The Business plan is for teams scaling their AI operations. Get 50 agents, 50,000 messages per month, unlimited knowledge bases, and 20 team seats. Includes Slack-based priority support and advanced analytics with CSV export.
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
