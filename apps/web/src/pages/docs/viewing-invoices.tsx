import { FileText, Download, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ViewingInvoicesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Viewing Invoices' },
        ]}
        title="Viewing Invoices"
        description="Access your invoice history, download invoices, and check payment status."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Every payment generates an invoice. You can view, download, and manage all your invoices from the billing page. Invoices include the plan name, amount charged, payment date, and a breakdown of any prorated charges.
      </p>

      <h2 id="invoice-history">Invoice History</h2>
      <p>
        Your complete invoice history is available at <strong>Settings → Billing → Invoice History</strong>. Each entry shows:
      </p>
      <ul>
        <li><strong>Date:</strong> When the payment was processed.</li>
        <li><strong>Amount:</strong> The total charged, including any taxes.</li>
        <li><strong>Status:</strong> Paid, pending, or failed.</li>
        <li><strong>Description:</strong> The plan name and billing period covered.</li>
      </ul>

      <h2 id="downloading">Downloading Invoices</h2>
      <p>
        Click the <strong>Download</strong> button next to any invoice to get a PDF copy. Invoices are useful for accounting, tax filing, and expense reports.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Download}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="PDF format"
          description="Each invoice is available as a downloadable PDF with your organization's billing details."
        />
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Invoice details"
          description="Includes plan name, billing period, amount, tax, and payment method used."
        />
      </DocCardGrid>

      <h2 id="payment-status">Payment Status</h2>
      <p>
        Each invoice has a status that indicates the payment outcome:
      </p>
      <ul>
        <li><strong>Paid:</strong> Payment was successfully processed.</li>
        <li><strong>Pending:</strong> Payment is being processed. Usually resolves within a few hours.</li>
        <li><strong>Failed:</strong> Payment could not be processed. You'll see a reason and instructions to retry.</li>
      </ul>

      <DocCallout variant="warning" title="Failed payments">
        If a payment fails, Convio retries automatically over the next 7 days. Update your payment method in the customer portal to avoid service interruption.
      </DocCallout>

      <h2 id="invoice-format">Invoice Format</h2>
      <p>
        Convio invoices follow a standard format suitable for business accounting:
      </p>
      <ul>
        <li>Your organization name and billing address</li>
        <li>Invoice number (unique, sequential)</li>
        <li>Plan name, billing period, and amount</li>
        <li>Tax amount (if applicable)</li>
        <li>Payment method and last four digits</li>
        <li>Convio's business details for your records</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Customer Portal"
          href="/docs/customer-portal"
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
