import { Link } from 'react-router-dom'
import { Phone, Settings, DollarSign, AlertCircle, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WhatsAppTwilioPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'WhatsApp via Twilio' },
        ]}
        title="WhatsApp via Twilio"
        description="Use Twilio as your WhatsApp Business API provider. Sandbox for testing, production numbers for live traffic."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Twilio provides an alternative to Kapso for WhatsApp integration. Twilio's sandbox is useful for development and testing, while production numbers handle live traffic with Twilio's reliability and global infrastructure.
      </p>

      <h2 id="twilio-setup">Twilio Setup</h2>
      <ol>
        <li><strong>Create a Twilio account:</strong> Sign up at twilio.com and verify your identity.</li>
        <li><strong>Navigate to Console:</strong> Find your Account SID and Auth Token on the Twilio Console dashboard.</li>
        <li><strong>Enable WhatsApp:</strong> In the Twilio Console, navigate to <strong>Messaging → Try WhatsApp</strong> to enable the WhatsApp channel.</li>
        <li><strong>Get credentials:</strong> Copy your Account SID and Auth Token for use in Convio.</li>
      </ol>

      <h2 id="sandbox-vs-production">Sandbox vs Production</h2>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Phone}
          iconBg="bg-yellow-500/10"
          iconColor="text-yellow-500"
          title="Sandbox"
          description="Free testing environment with Twilio's shared WhatsApp number. No verification required. Limited to opted-in test numbers."
          href="#sandbox"
        />
        <DocFeatureCard
          icon={Phone}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="Production"
          description="Your own WhatsApp-enabled phone number. Full message limits, business verification, and production reliability."
          href="#production"
        />
      </DocCardGrid>

      <h3 id="sandbox">Sandbox</h3>
      <p>
        The sandbox uses Twilio's shared WhatsApp number (+1 415 523 8886). To opt in, users send a join code to this number. The sandbox supports all message types but is limited in scale and not suitable for production.
      </p>
      <ul>
        <li>Best for development, demos, and internal testing</li>
        <li>Users must opt in by sending a join code</li>
        <li>Messages are prefixed with a sandbox identifier</li>
        <li>No business verification or display name</li>
      </ul>

      <h3 id="production">Production</h3>
      <p>
        A production setup uses your own phone number registered with WhatsApp Business API. Messages come from your number with your business display name.
      </p>
      <ul>
        <li>Requires a phone number capable of receiving SMS or calls for verification</li>
        <li>Supports business verification and display name</li>
        <li>Higher message limits based on tier</li>
        <li>No sandbox prefixes on messages</li>
      </ul>

      <h2 id="number-configuration">Number Configuration</h2>
      <p>
        Configure your Twilio WhatsApp number in Convio:
      </p>
      <ol>
        <li>Enter your Twilio Account SID and Auth Token in the deployment form</li>
        <li>Enter the WhatsApp-enabled phone number (E.164 format, e.g., +1234567890)</li>
        <li>For sandbox: use the Twilio sandbox number (+1 415 523 8886)</li>
        <li>For production: use your registered Twilio number</li>
      </ol>

      <h2 id="webhook-setup">Webhook Setup</h2>
      <p>
        Convio provides a webhook URL for incoming messages. Configure this in Twilio:
      </p>
      <ol>
        <li>Go to <strong>Twilio Console → Messaging → Settings → WhatsApp Sandbox Settings</strong></li>
        <li>Paste the Convio webhook URL into <strong>When a message comes in</strong></li>
        <li>Set the method to <strong>HTTP POST</strong></li>
        <li>Save the configuration</li>
      </ol>

      <h2 id="pricing">Pricing Considerations</h2>
      <DocCallout variant="info" icon={DollarSign} title="Twilio pricing">
        Twilio charges per message for WhatsApp. Pricing varies by country and message type (session messages vs template messages). Check Twilio's WhatsApp pricing page for current rates.
      </DocCallout>

      <ul>
        <li><strong>Inbound messages:</strong> Free in most countries</li>
        <li><strong>Outbound session messages:</strong> Charged per message, varies by country</li>
        <li><strong>Outbound template messages:</strong> Higher rate, charged per template category</li>
        <li><strong>Sandbox:</strong> Same pricing as production — no free tier</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="WhatsApp Templates & Broadcasts"
          href="/docs/whatsapp-templates"
        />
        <DocNextStepCard
          icon={Phone}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Kapso Integration"
          href="/docs/whatsapp-integration"
        />
      </DocCardGrid>
    </DocContent>
  )
}
