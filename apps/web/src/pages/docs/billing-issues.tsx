import { AlertTriangle, CreditCard, Receipt, RefreshCw, Shield, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function BillingIssuesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Troubleshooting', href: '/docs' },
          { label: 'Billing & Payment Issues' },
        ]}
        title="Billing & Payment Issues"
        description="Resolve billing problems — failed payments, subscription activation, invoice issues, and payment method management."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Billing issues prevent plan upgrades, cause subscription suspensions, or create invoice discrepancies. Most problems stem from payment method failures, Stripe processing errors, or subscription state mismatches.
      </p>

      <h2 id="debug-steps">Debug Steps</h2>
      <ol>
        <li>Go to <strong>Settings → Billing</strong> to view your current plan and payment status</li>
        <li>Check for failed payment notifications in your email</li>
        <li>Review the payment history for declined or pending transactions</li>
        <li>Verify the payment method is still valid (not expired)</li>
        <li>Check your Stripe customer portal for detailed billing information</li>
      </ol>

      <h2 id="failed-payments">Failed Payments</h2>
      <p>
        Payment failures occur when the charge is declined by the bank or payment processor.
      </p>

      <h3 id="common-failure-reasons">Common Failure Reasons</h3>
      <ul>
        <li><strong>Insufficient funds:</strong> The card doesn't have enough balance</li>
        <li><strong>Card expired:</strong> The expiration date has passed</li>
        <li><strong>Card declined:</strong> The bank declined the transaction (contact your bank)</li>
        <li><strong>Incorrect details:</strong> Card number, CVV, or ZIP code is wrong</li>
        <li><strong>3D Secure failed:</strong> The authentication step wasn't completed</li>
      </ul>

      <DocCallout variant="info" icon={CreditCard} title="Update payment method">
        Go to <strong>Settings → Billing → Payment Method</strong> to update your card details. Convio uses Stripe for payment processing — your card details are never stored on Convio's servers.
      </DocCallout>

      <h3 id="retry-payment">Retry a Failed Payment</h3>
      <ol>
        <li>Update the payment method with a valid card</li>
        <li>Go to <strong>Settings → Billing → Payment History</strong></li>
        <li>Click <strong>Retry</strong> next to the failed payment</li>
        <li>Confirm the retry — the charge is attempted immediately</li>
      </ol>

      <h2 id="subscription-not-activating">Subscription Not Activating</h2>
      <p>
        After upgrading, the plan features may not activate immediately.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="Processing Delay"
          description="Plan changes can take up to 5 minutes to propagate. Hard refresh the page and check again."
          href="/docs/plans"
        />
        <DocFeatureCard
          icon={CheckCircle}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="Payment Pending"
          description="Some payment methods (bank transfers) take 1-3 business days to process. The plan activates after the payment clears."
          href="/docs/plans"
        />
        <DocFeatureCard
          icon={AlertTriangle}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="Payment Failed"
          description="If the payment failed, the plan reverts to the previous tier. Update the payment method and retry."
          href="/docs/plans"
        />
        <DocFeatureCard
          icon={RefreshCw}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Cache Issue"
          description="The dashboard may show stale plan data. Clear the browser cache or try an incognito window."
          href="/docs/plans"
        />
      </DocCardGrid>

      <h2 id="invoice-problems">Invoice Problems</h2>
      <p>
        Invoice issues include missing invoices, incorrect amounts, or tax calculation errors.
      </p>

      <h3 id="view-invoices">View and Download Invoices</h3>
      <ol>
        <li>Go to <strong>Settings → Billing → Invoices</strong></li>
        <li>Click the download icon next to any invoice</li>
        <li>Invoices are sent to the billing email on file after each successful charge</li>
      </ol>

      <h3 id="invoice-disputes">Common Invoice Issues</h3>
      <ul>
        <li><strong>Wrong amount:</strong> Check if proration was applied for mid-cycle upgrades</li>
        <li><strong>Missing invoice:</strong> Check your spam folder for the email from Stripe</li>
        <li><strong>Tax not included:</strong> Tax is calculated based on your billing address. Update it in the billing settings.</li>
        <li><strong>Duplicate charge:</strong> Contact support with the transaction IDs for investigation</li>
      </ul>

      <h2 id="payment-method-issues">Payment Method Issues</h2>
      <p>
        Managing payment methods — adding, updating, or removing cards.
      </p>

      <DocCallout variant="warning" icon={Shield} title="Security note">
        Convio uses Stripe for payment processing. Card details are tokenized and never stored on Convio's servers. You can safely update your payment method without service interruption.
      </DocCallout>

      <h3 id="add-payment-method">Add a Payment Method</h3>
      <ol>
        <li>Go to <strong>Settings → Billing → Payment Method</strong></li>
        <li>Click <strong>Add Payment Method</strong></li>
        <li>Enter card details in the Stripe-hosted form</li>
        <li>Complete any 3D Secure authentication if required</li>
        <li>Set as default for future payments</li>
      </ol>

      <h3 id="remove-payment-method">Remove a Payment Method</h3>
      <p>
        You can remove a payment method only if another valid method is set as default. The system requires at least one active payment method for paid plans.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={CreditCard}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Viewing Invoices"
          href="/docs/viewing-invoices"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Upgrading Your Plan"
          href="/docs/upgrading-plan"
        />
      </DocCardGrid>
    </DocContent>
  )
}
