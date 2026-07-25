import { CheckCircle, X, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocNextStepCard, DocCardGrid } from '@/components/docs'

const features = [
  { name: 'Agents', free: '1', pro: '10', business: '50', enterprise: 'Unlimited' },
  { name: 'Messages / month', free: '100', pro: '10,000', business: '50,000', enterprise: 'Custom' },
  { name: 'Team members', free: '1', pro: '5', business: '20', enterprise: 'Unlimited' },
  { name: 'Knowledge bases', free: '1', pro: '10', business: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Channels', free: '1', pro: '5', business: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Documents / KB', free: '10', pro: '200', business: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Webhooks', free: false, pro: true, business: true, enterprise: true },
  { name: 'Custom tools', free: false, pro: true, business: true, enterprise: true },
  { name: 'Broadcasts', free: false, pro: true, business: true, enterprise: true },
  { name: 'Analytics dashboard', free: 'Basic', pro: 'Advanced', business: 'Advanced + Export', enterprise: 'Custom' },
  { name: 'Conversation history', free: '7 days', pro: '90 days', business: '1 year', enterprise: 'Unlimited' },
  { name: 'API access', free: false, pro: true, business: true, enterprise: true },
  { name: 'SSO / SAML', free: false, pro: false, business: true, enterprise: true },
  { name: 'Custom SLA', free: false, pro: false, business: false, enterprise: true },
  { name: 'Dedicated support', free: false, pro: false, business: false, enterprise: true },
  { name: 'On-premise option', free: false, pro: false, business: false, enterprise: true },
]

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) return <CheckCircle className="size-4 text-success mx-auto" />
  if (value === false) return <X className="size-4 text-muted-foreground/40 mx-auto" />
  return <span>{value}</span>
}

export default function PlanFeaturesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Plan Features' },
        ]}
        title="Plan Features Comparison"
        description="A detailed comparison of every feature available across Convio's pricing plans."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Each plan unlocks additional features and higher limits. The table below shows exactly what's included in each tier so you can choose the right plan for your needs.
      </p>

      <h2 id="features-table">Feature Comparison</h2>
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
            {features.map((row) => (
              <tr key={row.name} className="border-b border-border/30">
                <td className="py-2 pr-4 text-foreground">{row.name}</td>
                <td className="text-center py-2 px-3"><CellValue value={row.free} /></td>
                <td className="text-center py-2 px-3"><CellValue value={row.pro} /></td>
                <td className="text-center py-2 px-3"><CellValue value={row.business} /></td>
                <td className="text-center py-2 px-3"><CellValue value={row.enterprise} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="limits-explained">Limits Explained</h2>
      <p>
        Limits reset at the start of each billing cycle. If you hit your message limit, the agent stops responding until the next cycle or until you upgrade.
      </p>

      <DocCallout variant="warning" title="Message counting">
        Messages are counted per conversation turn — one user message plus one agent response equals two messages. Internal system messages and tool calls do not count toward your quota.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={CheckCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="View All Plans"
          href="/docs/plans"
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
