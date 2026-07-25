import { Webhook, Zap, Shield, RefreshCw, ArrowDown } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WebhooksPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'What are Webhooks?' },
        ]}
        title="What Are Webhooks?"
        description="Event-driven integrations that push real-time data from Convio to your systems. No polling, no delays."
      />

      <h2 id="what-is-a-webhook">What Is a Webhook?</h2>
      <p>
        A webhook is an HTTP callback — when something happens in Convio (a message arrives, a conversation starts, an agent goes offline), Convio sends an HTTP POST request to a URL you specify. Your server receives the event data and processes it however you need.
      </p>
      <p>
        Think of it as a notification system. Instead of asking Convio "has anything happened?" every few seconds (polling), Convio tells you the moment it happens.
      </p>

      <h2 id="push-vs-pull">Push vs Pull Model</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={ArrowDown}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Push (Webhooks)"
          description="Convio sends events to your URL as they happen. Real-time, efficient, no wasted requests. The standard for event-driven integrations."
          href="#push"
        />
        <DocFeatureCard
          icon={RefreshCw}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Pull (Polling)"
          description="Your system repeatedly queries Convio's API for new data. Wasteful, introduces delays, and scales poorly. Avoid if webhooks are available."
          href="#pull"
        />
      </DocCardGrid>

      <h3 id="push">Push Model</h3>
      <p>
        Convio maintains a list of webhook endpoints. When a subscribed event fires, Convio constructs an HTTP POST request with the event payload and sends it to each matching endpoint. Your server processes the payload and responds with a 2xx status code to confirm receipt.
      </p>

      <h3 id="pull">Pull Model</h3>
      <p>
        Polling requires your system to periodically call Convio's API and check for new data. This wastes resources when nothing has changed and introduces latency proportional to your polling interval. Use webhooks instead.
      </p>

      <h2 id="webhook-lifecycle">Webhook Lifecycle</h2>
      <ol>
        <li><strong>Event occurs:</strong> A conversation is created, a message is sent, an agent changes status</li>
        <li><strong>Convio matches events:</strong> Checks which webhook endpoints are subscribed to this event type</li>
        <li><strong>Payload construction:</strong> Convio builds a JSON payload with event data and metadata</li>
        <li><strong>HTTP POST:</strong> Convio sends the payload to your endpoint with authentication headers</li>
        <li><strong>Your server processes:</strong> Validate the signature, parse the payload, take action</li>
        <li><strong>Response:</strong> Return 2xx to confirm receipt; Convio marks the delivery as successful</li>
      </ol>

      <DocCallout variant="info" icon={Webhook} title="Event format">
        All webhook payloads are JSON. Every payload includes <code>event</code> (the event type), <code>timestamp</code>, <code>organization_id</code>, and a <code>data</code> object with event-specific fields.
      </DocCallout>

      <h2 id="use-cases">Use Cases</h2>
      <ul>
        <li><strong>CRM integration:</strong> Push new conversations to HubSpot or Salesforce as contacts</li>
        <li><strong>Ticketing:</strong> Create Zendesk or Jira tickets when agents escalate</li>
        <li><strong>Analytics:</strong> Stream message events to your data warehouse</li>
        <li><strong>Notifications:</strong> Alert your team in Slack when high-priority conversations start</li>
        <li><strong>Workflows:</strong> Trigger Zapier, Make, or n8n automations from Convio events</li>
        <li><strong>Custom logic:</strong> Run your own business logic on conversation lifecycle events</li>
      </ul>

      <DocCallout variant="tip" icon={Shield} title="Secure by default">
        Every webhook delivery includes an HMAC signature header. Always verify it to ensure the payload came from Convio and wasn't tampered with.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Webhook}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Available Webhook Events"
          href="/docs/webhook-events"
        />
        <DocNextStepCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Creating a Webhook"
          href="/docs/creating-webhook"
        />
      </DocCardGrid>
    </DocContent>
  )
}
