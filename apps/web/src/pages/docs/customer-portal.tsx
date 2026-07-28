import { CreditCard, Mail, ArrowRight, Shield } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function CustomerPortalPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Customer Portal' },
        ]}
        title="Customer Portal"
        description="Manage your payment methods, billing information, and payment history in one place."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The customer portal is your self-service hub for all billing-related tasks. Access it from <strong>Settings → Billing → Customer Portal</strong> or via the link in your invoice emails. The portal is powered by Stripe and lets you manage payment methods, view history, and update billing details without contacting support.
      </p>

      <h2 id="accessing">Accessing the Portal</h2>
      <ol>
        <li>Go to <strong>Settings → Billing</strong>.</li>
        <li>Click <strong>Manage Billing</strong> or <strong>Open Customer Portal</strong>.</li>
        <li>You'll be redirected to the Stripe-hosted portal.</li>
      </ol>

      <DocCallout variant="info" icon={Shield} title="Secure access">
        The portal is hosted by Stripe and uses your session for authentication. No separate login is required.
      </DocCallout>

      <h2 id="payment-methods">Managing Payment Methods</h2>
      <p>
        From the portal you can add or remove payment methods:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={CreditCard}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Add a payment method"
          description="Add a new credit or debit card. The most recently added card becomes the default for future payments."
        />
        <DocFeatureCard
          icon={CreditCard}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Remove a payment method"
          description="Delete a card you no longer use. You cannot remove the default card if you have an active subscription."
        />
      </DocCardGrid>

      <h2 id="billing-info">Updating Billing Information</h2>
      <p>
        Update your billing details to ensure invoices are accurate:
      </p>
      <ul>
        <li><strong>Billing address:</strong> Required for tax calculation and invoice accuracy.</li>
        <li><strong>Company name:</strong> Added to invoices for business expense tracking.</li>
        <li><strong>Tax ID:</strong> Optional. Included on invoices for VAT/GST reclaim.</li>
      </ul>

      <h2 id="payment-history">Viewing Payment History</h2>
      <p>
        The portal shows a complete history of every payment attempt, including successful, pending, and failed transactions. Each entry links to the corresponding invoice for download.
      </p>

      <h2 id="billing-email">Updating Billing Email</h2>
      <p>
        The billing email receives all invoice notifications and payment receipts. To change it:
      </p>
      <ol>
        <li>Open the customer portal.</li>
        <li>Go to <strong>Account details</strong>.</li>
        <li>Update the email address under <strong>Billing email</strong>.</li>
        <li>Click <strong>Save</strong>.</li>
      </ol>

      <DocCallout variant="tip" icon={Mail} title="Separate billing email">
        You can set a different email for billing notifications than your account login. This is useful when your finance team needs to receive invoices.
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
