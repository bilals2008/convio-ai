import { Settings, Calendar, ArrowRight, Pause } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ManagingSubscriptionsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Managing Subscriptions' },
        ]}
        title="Managing Subscriptions"
        description="View subscription details, change plans, and manage renewal settings."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Your subscription settings are in <strong>Settings → Billing</strong>. From there you can view your current plan, change plans, pause a subscription, or cancel. All changes take effect according to your billing cycle.
      </p>

      <h2 id="viewing-details">Viewing Subscription Details</h2>
      <p>
        The billing page shows:
      </p>
      <ul>
        <li><strong>Current plan:</strong> The active plan name and monthly price.</li>
        <li><strong>Status:</strong> Whether your subscription is active, past due, or canceled.</li>
        <li><strong>Billing cycle:</strong> Start date, end date, and days remaining.</li>
        <li><strong>Payment method:</strong> The card on file, with an option to update.</li>
      </ul>

      <h2 id="renewal-dates">Renewal Dates</h2>
      <p>
        Your subscription renews automatically on the date shown in the billing page. You'll receive:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Calendar}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Email reminder"
          description="Sent 3 days before renewal with the amount and plan details."
        />
        <DocFeatureCard
          icon={Calendar}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="In-app notification"
          description="A banner appears on the billing page a week before renewal."
        />
      </DocCardGrid>

      <h2 id="plan-changes">Changing Your Plan</h2>
      <p>
        You can change your plan at any time from the billing page:
      </p>
      <ul>
        <li><strong>Upgrading:</strong> Takes effect immediately or at the next renewal. Prorated charges apply for immediate upgrades.</li>
        <li><strong>Downgrading:</strong> Takes effect at the end of the current billing cycle. You keep your current limits until then.</li>
      </ul>

      <DocCallout variant="warning" title="Downgrade limits">
        Downgrading reduces your available agents, message quota, and team seats. If your current usage exceeds the new plan's limits, you'll need to deactivate agents or remove members before the downgrade takes effect.
      </DocCallout>

      <h2 id="pausing-subscription">Pausing a Subscription</h2>
      <p>
        If you need a temporary break, you can pause your subscription instead of canceling:
      </p>
      <ol>
        <li>Go to <strong>Settings → Billing</strong>.</li>
        <li>Click <strong>Pause Subscription</strong>.</li>
        <li>Choose a pause duration (1 or 2 months).</li>
        <li>Confirm the pause.</li>
      </ol>
      <p>
        While paused, your agents stop responding and your data is preserved. The subscription resumes automatically after the pause period ends.
      </p>

      <DocCallout variant="info" icon={Pause} title="Data preservation">
        Pausing does not delete any data. Your agents, knowledge bases, and conversation history remain intact and resume exactly where you left off.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Cancel Subscription"
          href="/docs/canceling-subscription"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Customer Portal"
          href="/docs/customer-portal"
        />
      </DocCardGrid>
    </DocContent>
  )
}
