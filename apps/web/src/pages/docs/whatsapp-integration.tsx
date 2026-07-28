import { Link } from 'react-router-dom'
import { Phone, Shield, FileText, Webhook, AlertCircle, ArrowRight } from 'lucide-react'
import { WhatsAppIcon } from '@/components/docs/brand-icons'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WhatsAppIntegrationPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'WhatsApp Integration' },
        ]}
        title="WhatsApp Integration"
        description="Set up your agent on WhatsApp using Kapso Platform. Verify your phone number, configure webhooks, and start receiving messages."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio integrates with WhatsApp through the Kapso Platform, which provides the API layer for sending and receiving messages. You can also use Twilio as an alternative provider — see <Link to="/docs/whatsapp-twilio" className="text-primary hover:underline">WhatsApp via Twilio</Link>.
      </p>

      <h2 id="kapso-setup">Setting Up with Kapso Platform</h2>
      <ol>
        <li><strong>Create a Kapso account:</strong> Sign up at the Kapso Platform dashboard and verify your email.</li>
        <li><strong>Connect a phone number:</strong> Add the phone number you want to use for WhatsApp. Kapso supports both existing numbers and new numbers.</li>
        <li><strong>Generate API credentials:</strong> Create an API key in the Kapso dashboard. Copy the key — you will need it for the Convio deployment.</li>
        <li><strong>Register for WhatsApp:</strong> Complete the WhatsApp Business registration through Kapso's guided flow.</li>
      </ol>

      <DocCallout variant="tip" icon={WhatsAppIcon} title="Phone number types">
        WhatsApp Business API supports both business accounts and standard numbers. Business accounts unlock additional features like product catalogs and business verification badges.
      </DocCallout>

      <h2 id="phone-verification">Phone Number Verification</h2>
      <p>
        WhatsApp requires phone number verification before you can send or receive messages. Kapso handles this process automatically:
      </p>
      <ul>
        <li>The number receives a verification SMS or call</li>
        <li>Kapso completes the verification on your behalf</li>
        <li>Once verified, the number is ready for WhatsApp messaging</li>
      </ul>

      <h2 id="business-verification">Business Verification</h2>
      <p>
        For production use, WhatsApp requires business verification. This is a one-time process that unlocks higher message limits and the business verification badge.
      </p>
      <ul>
        <li><strong>Display name:</strong> Your business name shown to recipients</li>
        <li><strong>Business category:</strong> Select from predefined categories</li>
        <li><strong>Business website:</strong> A publicly accessible website for verification</li>
        <li><strong>Business description:</strong> Brief description of your business</li>
      </ul>

      <DocCallout variant="info" icon={Shield} title="Verification timeline">
        Business verification typically takes 1-3 business days. During this period, you can still send messages but with lower daily limits (250 messages per day for unverified accounts).
      </DocCallout>

      <h2 id="webhook-config">Webhook Configuration</h2>
      <p>
        Convio generates a webhook URL for each WhatsApp deployment. Configure this URL in your Kapso dashboard to receive incoming messages.
      </p>
      <ol>
        <li>Copy the webhook URL from the Convio deployment page</li>
        <li>Paste it into the <strong>Webhook URL</strong> field in your Kapso dashboard</li>
        <li>Set the verify token to match the one shown in Convio</li>
        <li>Click <strong>Verify</strong> to confirm the connection</li>
      </ol>

      <h3 id="webhook-events">Events Received</h3>
      <ul>
        <li><strong>messages:</strong> Incoming text, media, and interactive messages from users</li>
        <li><strong>status:</strong> Delivery and read receipts for outgoing messages</li>
        <li><strong>contacts:</strong> Contact information for users who message you</li>
      </ul>

      <h2 id="message-limits">Message Limits</h2>
      <p>
        WhatsApp enforces message limits based on your account status:
      </p>
      <ul>
        <li><strong>Unverified:</strong> 250 messages per 24 hours</li>
        <li><strong>Verified (Tier 1):</strong> 1,000 messages per 24 hours</li>
        <li><strong>Verified (Tier 2):</strong> 10,000 messages per 24 hours</li>
        <li><strong>Verified (Tier 3):</strong> 100,000 messages per 24 hours</li>
      </ul>
      <p>
        Tier upgrades happen automatically based on message quality and volume.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="WhatsApp Templates & Broadcasts"
          href="/docs/whatsapp-templates"
        />
        <DocNextStepCard
          icon={Phone}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="WhatsApp via Twilio"
          href="/docs/whatsapp-twilio"
        />
      </DocCardGrid>
    </DocContent>
  )
}
