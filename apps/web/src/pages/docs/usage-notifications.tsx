import { Bell, Mail, AlertTriangle, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function UsageNotificationsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Usage Notifications' },
        ]}
        title="Usage Notifications"
        description="How Convio alerts you when you're approaching or have reached your plan limits."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio proactively notifies you when your usage approaches or reaches plan limits. This gives you time to adjust usage or upgrade before agents are impacted. Notifications come via email and in-app banners.
      </p>

      <h2 id="how-youre-alerted">How You're Alerted</h2>
      <p>
        Convio uses a two-tier notification system to keep you informed:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Bell}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="In-app warnings"
          description="A banner appears on your dashboard and billing page when you reach a notification threshold."
        />
        <DocFeatureCard
          icon={Mail}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Email alerts"
          description="An email is sent to the organization owner and billing contact when thresholds are crossed."
        />
      </DocCardGrid>

      <h2 id="notification-thresholds">Notification Thresholds</h2>
      <p>
        Convio sends notifications at specific usage thresholds:
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[12px] leading-[1.5]">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Threshold</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">In-app</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Email</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/30">
              <td className="py-2 pr-4 text-foreground">80% usage</td>
              <td className="py-2 pr-4">Warning banner</td>
              <td className="py-2 pr-4">No</td>
              <td className="py-2">Review usage, consider upgrading</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-2 pr-4 text-foreground">100% usage</td>
              <td className="py-2 pr-4">Critical banner</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2">Upgrade or wait for cycle reset</td>
            </tr>
            <tr className="border-b border-border/30">
              <td className="py-2 pr-4 text-foreground">Payment failure</td>
              <td className="py-2 pr-4">Critical banner</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2">Update payment method</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-foreground">3 days before renewal</td>
              <td className="py-2 pr-4">Info banner</td>
              <td className="py-2 pr-4">Yes</td>
              <td className="py-2">Review plan, confirm payment method</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="email-alerts">Email Alerts</h2>
      <p>
        Email notifications are sent to:
      </p>
      <ul>
        <li>The <strong>organization owner</strong> (always)</li>
        <li>The <strong>billing email</strong> if set to a different address</li>
      </ul>
      <p>
        Each email includes your current usage, the limit, and a direct link to the billing page to take action.
      </p>

      <h2 id="in-app-warnings">In-App Warnings</h2>
      <p>
        In-app notifications appear as colored banners:
      </p>
      <ul>
        <li><strong>Info (blue):</strong> Upcoming renewal reminder or general billing info.</li>
        <li><strong>Warning (yellow):</strong> Approaching a limit — 80% or higher usage.</li>
        <li><strong>Critical (red):</strong> Limit reached or payment failure requiring immediate attention.</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="Don't ignore critical warnings">
        A critical banner means your agents may stop responding. Take action immediately by upgrading or resolving the payment issue.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Bell}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Check Your Usage"
          href="/docs/usage-limits"
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
