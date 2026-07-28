import { HelpCircle, CreditCard, ArrowUpDown, AlertTriangle, XCircle, RotateCcw } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocNextStepCard, DocCardGrid } from '@/components/docs'

export default function BillingFAQsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'FAQs', href: '/docs' },
          { label: 'Billing FAQs' },
        ]}
        title="Billing FAQs"
        description="Questions about plans, payments, limits, and subscriptions."
      />

      <h2 id="overview">Overview</h2>
      <p>
        This page covers billing, plan changes, limits, and refunds. For general product questions, see the <a href="/docs/faqs">General FAQs</a>.
      </p>

      <h2 id="payments">Payments</h2>

      <h3 id="payment-methods">What payment methods are accepted?</h3>
      <p>
        Convio accepts all major credit and debit cards (Visa, Mastercard, American Express) via Stripe. For annual Enterprise plans, we also accept wire transfers and invoices. All payments are processed securely through Stripe — Convio never stores your card details.
      </p>

      <h3 id="free-trial">Is there a free trial?</h3>
      <p>
        Yes. All new accounts start on the free tier, which includes enough usage to fully evaluate the platform. No credit card is required to sign up. When you're ready for more, upgrade to a paid plan directly from your dashboard.
      </p>

      <h2 id="plans">Plans & Limits</h2>

      <h3 id="change-plans">Can I change plans anytime?</h3>
      <p>
        Yes. You can upgrade or downgrade your plan at any time from Settings → Subscription. Upgrades take effect immediately, and you'll be charged a prorated amount for the remainder of the current billing cycle. Downgrades take effect at the start of the next billing cycle.
      </p>

      <h3 id="hit-limit">What happens when I hit my limit?</h3>
      <p>
        When you reach your plan's conversation or message limit, your agents will stop responding to new conversations until the limit resets at the start of your next billing cycle or until you upgrade. Existing conversations are not interrupted. You can set up <a href="/docs/usage-notifications">usage notifications</a> to get warned before hitting your limit.
      </p>

      <h2 id="cancellation">Cancellation</h2>

      <h3 id="cancel-subscription">How do I cancel my subscription?</h3>
      <p>
        Go to Settings → Subscription and click "Cancel Plan." Your access continues until the end of the current billing period. After cancellation, your account reverts to the free tier — you won't lose any data, but agent limits and feature access will be reduced.
      </p>

      <h3 id="refunds">Do you offer refunds?</h3>
      <p>
        Refunds are available within 14 days of a new subscription or upgrade if you haven't exceeded reasonable usage. Contact <a href="mailto:billing@convio.ai">billing@convio.ai</a> with your account details and reason for the refund request. Annual plan refunds are handled on a case-by-case basis.
      </p>

      <DocCallout variant="warning" icon={AlertTriangle} title="Downgrade impact">
        Downgrading your plan may reduce your agent count, conversation limits, and feature access. Review the <a href="/docs/plans">Plans</a> page to compare tiers before making changes.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={CreditCard}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="View Plans & Pricing"
          href="/docs/plans"
        />
        <DocNextStepCard
          icon={ArrowUpDown}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Upgrading Your Plan"
          href="/docs/upgrading-plan"
        />
      </DocCardGrid>
    </DocContent>
  )
}
