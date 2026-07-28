import { CreditCard, BarChart3, Calendar, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ViewingPlanPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Viewing Your Plan' },
        ]}
        title="Viewing Your Current Plan"
        description="See your active plan, usage against limits, billing period, and next renewal date."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The billing page in your dashboard gives you a complete view of your current plan, how much you've used, and when your next renewal is. It's the single place to monitor your subscription status.
      </p>

      <h2 id="where-to-find">Where to Find Plan Info</h2>
      <ol>
        <li>Navigate to <strong>Settings</strong> in the sidebar.</li>
        <li>Click <strong>Billing</strong> under the Organization section.</li>
        <li>The top of the page shows your current plan name, price, and status.</li>
      </ol>

      <h2 id="usage-against-limits">Usage Against Limits</h2>
      <p>
        Below the plan summary, a usage panel displays your consumption for each resource:
      </p>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Messages"
          description="Messages sent this cycle vs. your monthly quota. Shown as a progress bar with exact counts."
        />
        <DocFeatureCard
          icon={CreditCard}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Agents"
          description="Active agents vs. the maximum allowed by your plan."
        />
        <DocFeatureCard
          icon={BarChart3}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Resources"
          description="Team members, knowledge bases, and channels — each with current usage and limits."
        />
      </DocCardGrid>

      <h2 id="billing-period">Current Billing Period</h2>
      <p>
        Your billing period is displayed near the top of the billing page. It shows the start and end dates of the current cycle, along with a countdown to the next renewal. Limits reset automatically at the end of each cycle.
      </p>

      <h2 id="next-renewal">Next Renewal Date</h2>
      <p>
        The renewal date is the day your next payment is processed and your limits reset. If your subscription is active, the renewal date and amount are shown clearly. If payment fails, you'll see a warning with instructions to update your payment method.
      </p>

      <DocCallout variant="info" icon={Calendar} title="Renewal reminders">
        Convio sends an email reminder 3 days before each renewal. You'll also see an in-app notification on the billing page.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Upgrade Your Plan"
          href="/docs/upgrading-plan"
        />
        <DocNextStepCard
          icon={CreditCard}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Manage Subscriptions"
          href="/docs/managing-subscriptions"
        />
      </DocCardGrid>
    </DocContent>
  )
}
