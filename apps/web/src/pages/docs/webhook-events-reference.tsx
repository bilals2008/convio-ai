import { Webhook, Shield, ArrowRight, Zap } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WebhookEventsReferencePage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Webhook Events Reference' },
        ]}
        title="Webhook Events Reference"
        description="Complete reference for all webhook event types, payload schemas, delivery format, and signature verification."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Webhooks deliver real-time event data from Convio to your servers. Each event represents a specific action — a conversation starting, a message arriving, an agent status change, or a knowledge base document finishing processing.
      </p>

      <h2 id="event-types">Event Types</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Webhook}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Conversation Events"
          description="conversation.created, conversation.updated, conversation.resolved, conversation.archived, conversation.assigned"
          href="#conversation-events"
        />
        <DocFeatureCard
          icon={Webhook}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Message Events"
          description="message.created, message.updated, message.flagged"
          href="#message-events"
        />
      </DocCardGrid>

      <h3 id="conversation-events">Conversation Events</h3>
      <ul>
        <li><code>conversation.created</code> — A new conversation was initiated</li>
        <li><code>conversation.updated</code> — Conversation metadata or status changed</li>
        <li><code>conversation.resolved</code> — Conversation was marked as resolved</li>
        <li><code>conversation.archived</code> — Conversation was archived</li>
        <li><code>conversation.assigned</code> — Conversation was assigned to a human agent</li>
        <li><code>conversation.handoff</code> — AI escalated to a human agent</li>
      </ul>

      <h3 id="message-events">Message Events</h3>
      <ul>
        <li><code>message.created</code> — A new message was sent (user or assistant)</li>
        <li><code>message.updated</code> — A message was edited</li>
        <li><code>message.flagged</code> — A message was flagged for review</li>
      </ul>

      <h3 id="agent-events">Agent Events</h3>
      <ul>
        <li><code>agent.created</code> — A new agent was created</li>
        <li><code>agent.updated</code> — Agent configuration was changed</li>
        <li><code>agent.status_changed</code> — Agent went active/inactive</li>
      </ul>

      <h3 id="kb-events">Knowledge Base Events</h3>
      <ul>
        <li><code>knowledge_base.document.processed</code> — Document finished processing</li>
        <li><code>knowledge_base.document.failed</code> — Document processing failed</li>
      </ul>

      <h2 id="payload-format">Payload Format</h2>
      <p>Every webhook payload includes these top-level fields:</p>
      <pre><code>{`{
  "event": "conversation.created",
  "timestamp": "2026-07-26T10:00:00Z",
  "organization_id": "org_abc123",
  "data": {
    "id": "cv_abc123",
    "agent_id": "agent_xyz789",
    "status": "active",
    "channel": "web_widget",
    "created_at": "2026-07-26T10:00:00Z"
  }
}`}</code></pre>

      <h2 id="delivery-format">Delivery Format</h2>
      <p>Webhooks are delivered as HTTP POST requests with these headers:</p>
      <pre><code>{`POST https://your-server.com/webhooks/convio
Content-Type: application/json
X-Convio-Signature: sha256=abc123...
X-Convio-Event: conversation.created
X-Convio-Delivery: del_xyz789
X-Convio-Timestamp: 1753526400`}</code></pre>

      <h2 id="signature-verification">Signature Verification</h2>
      <p>
        Every delivery includes an HMAC-SHA256 signature in the <code>X-Convio-Signature</code> header. Always verify this signature to ensure the payload came from Convio:
      </p>
      <pre><code>{`const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}`}</code></pre>

      <DocCallout variant="destructive" icon={Shield} title="Always verify signatures">
        Without signature verification, anyone can send fake events to your endpoint. Always validate the <code>X-Convio-Signature</code> header before processing webhook data.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Rate Limiting"
          href="/docs/api-rate-limiting"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Error Codes & Handling"
          href="/docs/api-error-codes"
        />
      </DocCardGrid>
    </DocContent>
  )
}
