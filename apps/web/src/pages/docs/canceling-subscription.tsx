import { XCircle, ArrowRight, AlertTriangle, RotateCcw } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function CancelingSubscriptionPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Canceling Subscription' },
        ]}
        title="Canceling Your Subscription"
        description="How to cancel your plan, what happens to your data, and how to resubscribe later."
      />

      <h2 id="overview">Overview</h2>
      <p>
        You can cancel your subscription at any time from the billing page. Cancellation takes effect at the end of your current billing cycle — you keep your full limits until then.
      </p>

      <h2 id="how-to-cancel">How to Cancel</h2>
      <ol>
        <li>Go to <strong>Settings → Billing</strong>.</li>
        <li>Click <strong>Cancel Subscription</strong>.</li>
        <li>Confirm the cancellation when prompted.</li>
        <li>You'll receive a confirmation email with the effective date.</li>
      </ol>

      <DocCallout variant="warning" icon={AlertTriangle} title="Before you cancel">
        Consider pausing your subscription instead of canceling. Pausing preserves your setup and lets you resume easily when you're ready to continue.
      </DocCallout>

      <h2 id="what-happens">What Happens on Cancellation</h2>
      <p>
        When you cancel:
      </p>
      <ul>
        <li><strong>Immediate:</strong> Your subscription is marked as canceled. No further charges will be made.</li>
        <li><strong>Until cycle end:</strong> You retain full access to your current plan's features and limits.</li>
        <li><strong>After cycle end:</strong> Your account moves to the free tier. Agents using premium features are deactivated.</li>
      </ul>

      <h2 id="data-retention">Data Retention</h2>
      <p>
        Your data is preserved after cancellation:
      </p>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={XCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agents"
          description="Deactivated but preserved. Reactivate them anytime by resubscribing to a paid plan."
        />
        <DocFeatureCard
          icon={XCircle}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Knowledge bases"
          description="Retained in full. Documents and embeddings are preserved for 90 days after cancellation."
        />
        <DocFeatureCard
          icon={XCircle}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Conversations"
          description="Conversation history is retained for 30 days. Export your data before the retention period ends."
        />
      </DocCardGrid>

      <DocCallout variant="info" icon={AlertTriangle} title="Data deletion">
        After the retention period, data is permanently deleted. If you need data exported before deletion, contact support immediately after canceling.
      </DocCallout>

      <h2 id="resubscribing">Re-subscribing</h2>
      <p>
        You can resubscribe at any time:
      </p>
      <ol>
        <li>Go to <strong>Settings → Billing</strong>.</li>
        <li>Click <strong>Resubscribe</strong> or <strong>Choose a Plan</strong>.</li>
        <li>Select your plan and complete checkout.</li>
        <li>Your agents and knowledge bases are restored immediately.</li>
      </ol>

      <DocCallout variant="tip" icon={RotateCcw} title="Easy resubscription">
        All your configuration is preserved. When you resubscribe, your agents, knowledge bases, and channel integrations are restored exactly as you left them.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={RotateCcw}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Manage Subscriptions"
          href="/docs/managing-subscriptions"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Contact Support"
          href="/docs/customer-portal"
        />
      </DocCardGrid>
    </DocContent>
  )
}
