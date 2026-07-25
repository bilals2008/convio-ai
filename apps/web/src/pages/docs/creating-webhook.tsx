import { Key, Globe, Shield, Zap, CheckCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function CreatingWebhookPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Creating a Webhook Endpoint' },
        ]}
        title="Creating a Webhook Endpoint"
        description="Configure a URL to receive webhook events. Choose events, set a secret token, and test your endpoint."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Creating a webhook in Convio takes two minutes. You provide a URL, select which events to subscribe to, and Convio starts pushing events to your endpoint. A secret token is generated for payload verification.
      </p>

      <h2 id="step-1-url">Step 1: Configure Your URL</h2>
      <p>
        Enter the HTTPS endpoint that will receive webhook payloads. Convio sends a verification request to confirm the URL is reachable before saving.
      </p>
      <ul>
        <li>Must be a valid HTTPS URL (HTTP is rejected in production)</li>
        <li>Must respond with 200-299 to the verification ping</li>
        <li>Avoid localhost — use a publicly accessible URL</li>
        <li>Use a dedicated path (e.g., <code>/webhooks/convio</code>) to avoid conflicts</li>
      </ul>

      <DocCallout variant="info" icon={Globe} title="HTTPS required">
        Convio requires HTTPS for all webhook endpoints. This protects payload data in transit. Use Let's Encrypt for free certificates if you don't have one.
      </DocCallout>

      <h2 id="step-2-events">Step 2: Select Events</h2>
      <p>
        Choose which events trigger deliveries to this endpoint. You can subscribe to all events or filter to specific ones:
      </p>
      <ul>
        <li><strong>All events:</strong> Receive every event type — useful for logging or analytics pipelines</li>
        <li><strong>Conversation events:</strong> conversation.created, conversation.updated</li>
        <li><strong>Message events:</strong> message.received, message.sent</li>
        <li><strong>Agent events:</strong> agent.status_changed, agent.assigned</li>
        <li><strong>Deployment events:</strong> deployment.connected, deployment.disconnected</li>
      </ul>

      <h2 id="step-3-secret">Step 3: Generate a Secret Token</h2>
      <p>
        Convio generates a unique secret token for each webhook. This token signs every payload with an HMAC-SHA256 signature that you verify on receipt.
      </p>
      <ul>
        <li>The secret is shown once at creation — copy it immediately</li>
        <li>Store it in your environment variables, not in code</li>
        <li>You can rotate the secret at any time from the dashboard</li>
      </ul>

      <DocCallout variant="warning" icon={Key} title="Save your secret immediately">
        The webhook secret is only displayed once. If you lose it, you must rotate to a new one. Never commit secrets to version control.
      </DocCallout>

      <h2 id="step-4-test">Step 4: Test the Endpoint</h2>
      <p>
        Convio sends a test event after creation. Verify:
      </p>
      <ol>
        <li>Your endpoint receives the test payload</li>
        <li>You successfully verify the HMAC signature</li>
        <li>Your endpoint returns 200 within 30 seconds</li>
        <li>The webhook status changes to "Active" in the dashboard</li>
      </ol>

      <DocCallout variant="tip" icon={CheckCircle} title="Test before subscribing events">
        Create the webhook with no events first, verify the endpoint works, then add event subscriptions. This avoids flooding a broken endpoint with events.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Verifying Webhook Signatures"
          href="/docs/webhook-security"
        />
        <DocNextStepCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing Webhooks"
          href="/docs/testing-webhooks"
        />
      </DocCardGrid>
    </DocContent>
  )
}
