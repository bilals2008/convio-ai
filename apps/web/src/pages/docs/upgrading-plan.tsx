import { CreditCard, ArrowRight, Shield, Zap } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function UpgradingPlanPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Upgrading Your Plan' },
        ]}
        title="Upgrading Your Plan"
        description="Start a subscription, complete checkout, and understand how plan changes take effect."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Upgrading your plan unlocks more agents, higher message quotas, additional team seats, and advanced features. The upgrade process is straightforward — choose a plan, enter payment details, and start using your new limits immediately.
      </p>

      <h2 id="starting-subscription">Starting a Subscription</h2>
      <ol>
        <li>Go to <strong>Settings → Billing</strong>.</li>
        <li>Click <strong>Upgrade Plan</strong>.</li>
        <li>Select your desired plan (Pro, Business, or Enterprise).</li>
        <li>Review the features and pricing for the selected plan.</li>
        <li>Click <strong>Continue to Checkout</strong>.</li>
      </ol>

      <h2 id="checkout-flow">Checkout Flow</h2>
      <p>
        The checkout page collects your payment information and confirms the upgrade:
      </p>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={CreditCard}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="1. Select Plan"
          description="Choose the plan that fits your needs. You can change this before completing checkout."
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="2. Enter Payment"
          description="Add your credit card or select an existing payment method. All transactions are encrypted."
        />
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-success/10"
          iconColor="text-success"
          title="3. Confirm"
          description="Review your order summary and click Start Subscription. Your new limits activate immediately."
        />
      </DocCardGrid>

      <h2 id="payment-methods">Payment Methods</h2>
      <p>
        Convio accepts major credit and debit cards:
      </p>
      <ul>
        <li>Visa, Mastercard, American Express</li>
        <li>Discover, JCB, Diners Club</li>
      </ul>
      <p>
        All payments are processed securely through Stripe. Card details are never stored on Convio's servers.
      </p>

      <DocCallout variant="tip" icon={Shield} title="Security">
        Convio uses Stripe for payment processing. Your card information is encrypted and handled entirely by Stripe — Convio never sees or stores your full card number.
      </DocCallout>

      <h2 id="immediate-vs-next-billing">Immediate vs. Next Billing</h2>
      <p>
        When you upgrade mid-cycle, two options are available:
      </p>
      <ul>
        <li><strong>Immediate upgrade:</strong> Your new limits activate right away. You're charged a prorated amount for the remainder of the current billing cycle, and the full amount starts at the next renewal.</li>
        <li><strong>Upgrade at next renewal:</strong> The upgrade takes effect when your current cycle ends. You keep your current limits until then, and the new plan starts on the renewal date with no prorated charge.</li>
      </ul>

      <DocCallout variant="info" icon={CreditCard} title="Prorated charges">
        Prorated charges are calculated based on the number of days remaining in your current cycle. You only pay the difference between your current plan and the new plan for the unused portion.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={CreditCard}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="View Invoices"
          href="/docs/viewing-invoices"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Manage Subscriptions"
          href="/docs/managing-subscriptions"
        />
      </DocCardGrid>
    </DocContent>
  )
}
