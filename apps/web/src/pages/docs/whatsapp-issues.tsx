import { AlertTriangle, Shield, Settings, RefreshCw, Phone, CheckCircle, XCircle } from 'lucide-react'
import { WhatsAppIcon } from '@/components/docs/brand-icons'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WhatsAppIssuesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Troubleshooting', href: '/docs' },
          { label: 'WhatsApp Integration Issues' },
        ]}
        title="WhatsApp Integration Issues"
        description="Resolve WhatsApp integration problems — template rejections, delivery failures, provider issues, and number verification."
      />

      <h2 id="overview">Overview</h2>
      <p>
        WhatsApp integrations involve Meta's API, template approvals, and business verification. Most issues fall into template management, message delivery, provider connectivity, or number verification categories.
      </p>

      <h2 id="debug-steps">Debug Steps</h2>
      <ol>
        <li>Check <strong>Deployments → WhatsApp → Status</strong> for the connection state</li>
        <li>Review the message log for delivery status (sent, delivered, read, failed)</li>
        <li>Check for template rejection notifications in the dashboard</li>
        <li>Verify the WhatsApp Business phone number is active and verified</li>
        <li>Test the provider connection with a manual API call</li>
      </ol>

      <h2 id="template-rejection">Template Rejection</h2>
      <p>
        Meta reviews all WhatsApp message templates before they can be used. Rejected templates can't send messages to new users.
      </p>

      <h3 id="common-rejection-reasons">Common Rejection Reasons</h3>
      <ul>
        <li><strong>Missing opt-out language:</strong> Templates must include a way for users to opt out (e.g., "Reply STOP to unsubscribe")</li>
        <li><strong>Violating content policies:</strong> Promotional, misleading, or restricted content is rejected</li>
        <li><strong>Incorrect variable syntax:</strong> Template variables must use <code>{'{{1}}'}</code> format with proper placeholders</li>
        <li><strong>Category mismatch:</strong> Using a MARKETING template for UTILITY messages or vice versa</li>
      </ul>

      <DocCallout variant="info" icon={CheckCircle} title="Fix rejected templates">
        Edit the template in the WhatsApp Templates section, address the rejection reason, and resubmit for review. Review typically takes 24-48 hours.
      </DocCallout>

      <h3 id="template-best-practices">Template Best Practices</h3>
      <ol>
        <li>Use clear, descriptive template names matching the content</li>
        <li>Include the opt-out line at the end of every marketing template</li>
        <li>Keep variables simple — avoid nested JSON or complex data</li>
        <li>Test templates with the preview feature before submission</li>
      </ol>

      <h2 id="delivery-failures">Message Delivery Failures</h2>
      <p>
        Messages sent but not delivered to the recipient's device.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={XCircle}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="User Opted Out"
          description="The recipient has blocked the business number or opted out of messages. The number is added to your blocked list."
          href="/docs/whatsapp-integration"
        />
        <DocFeatureCard
          icon={XCircle}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="Invalid Number"
          description="The phone number format is incorrect. WhatsApp requires the full international format with country code."
          href="/docs/whatsapp-integration"
        />
        <DocFeatureCard
          icon={XCircle}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="Rate Limited"
          description="Meta limits how many unique users you can message per day. New business numbers have lower initial limits."
          href="/docs/rate-limits"
        />
        <DocFeatureCard
          icon={XCircle}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="Template Expired"
          description="Marketing templates can only be sent within 24 hours of a user's last message. Wait for the user to initiate."
          href="/docs/whatsapp-templates"
        />
      </DocCardGrid>

      <h2 id="provider-problems">Provider Problems</h2>
      <p>
        Convio connects to WhatsApp through a provider (Twilio, MessageBird, or direct Meta API). Provider issues affect message delivery.
      </p>
      <ul>
        <li>Check the provider's status page for reported outages</li>
        <li>Verify the provider account has sufficient balance or credits</li>
        <li>Confirm the provider's WhatsApp Business account is active</li>
        <li>Review API rate limits specific to the provider</li>
      </ul>

      <DocCallout variant="warning" icon={Settings} title="Provider switching">
        If your provider is experiencing issues, you can switch to a different provider in <strong>Deployments → WhatsApp → Provider Settings</strong>. Existing templates and conversations are preserved.
      </DocCallout>

      <h2 id="number-verification">Number Verification Issues</h2>
      <p>
        The WhatsApp Business phone number must be verified before sending messages.
      </p>

      <h3 id="verification-steps">Verification Steps</h3>
      <ol>
        <li>Ensure the phone number is not already registered on WhatsApp consumer</li>
        <li>Request the verification code via SMS or call</li>
        <li>Enter the 6-digit code within the time limit</li>
        <li>If SMS fails, request a voice call verification</li>
        <li>Complete the two-step verification setup for security</li>
      </ol>

      <DocCallout variant="destructive" icon={Phone} title="Number porting">
        If you've recently ported a phone number to WhatsApp Business, wait 24 hours before testing. Porting can cause temporary delivery issues while Meta propagates the change.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={WhatsAppIcon}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="WhatsApp Templates"
          href="/docs/whatsapp-templates"
        />
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="WhatsApp Integration Setup"
          href="/docs/whatsapp-integration"
        />
      </DocCardGrid>
    </DocContent>
  )
}
