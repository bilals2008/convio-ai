import { Webhook, MessageSquare, Users, Radio, Zap } from 'lucide-react'
import { DocContent, DocPageHeader, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WebhookEventsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Available Webhook Events' },
        ]}
        title="Available Webhook Events"
        description="Full catalog of events you can subscribe to. Each event fires at a specific point in the conversation or system lifecycle."
      />

      <h2 id="overview">Event Overview</h2>
      <p>
        Convio emits events when things happen — conversations start, messages arrive, agents change status, deployments connect. Subscribe to the events you care about and Convio will push them to your endpoint.
      </p>

      <h2 id="conversation-events">Conversation Events</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="conversation.created"
          description="Fires when a new conversation starts. Includes the user's first message, contact metadata, and conversation ID."
          href="#conversation-created"
        />
        <DocFeatureCard
          icon={MessageSquare}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="conversation.updated"
          description="Fires when a conversation's status, assignee, or metadata changes. Includes the changed fields and previous values."
          href="#conversation-updated"
        />
      </DocCardGrid>

      <h3 id="conversation-created">conversation.created</h3>
      <p>Fired when a new conversation is created.</p>
      <pre><code>{`{
  "event": "conversation.created",
  "timestamp": "2026-07-25T14:30:00Z",
  "organization_id": "org_abc123",
  "data": {
    "conversation_id": "conv_xyz789",
    "channel": "whatsapp",
    "user": {
      "id": "user_001",
      "phone": "+1234567890",
      "name": "John Doe"
    },
    "first_message": "Hi, I need help with my order",
    "agent_id": "agent_abc"
  }
}`}</code></pre>

      <h3 id="conversation-updated">conversation.updated</h3>
      <p>Fired when conversation metadata changes.</p>
      <pre><code>{`{
  "event": "conversation.updated",
  "timestamp": "2026-07-25T14:35:00Z",
  "organization_id": "org_abc123",
  "data": {
    "conversation_id": "conv_xyz789",
    "changes": {
      "status": { "from": "active", "to": "resolved" },
      "assigned_to": { "from": null, "to": "agent_abc" }
    }
  }
}`}</code></pre>

      <h2 id="message-events">Message Events</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={MessageSquare}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="message.received"
          description="Fires when a message is received from a user. Includes the message content, sender, and conversation context."
          href="#message-received"
        />
        <DocFeatureCard
          icon={MessageSquare}
          iconBg="bg-success/10"
          iconColor="text-success"
          title="message.sent"
          description="Fires when a message is sent (by AI or human agent). Includes delivery status and message content."
          href="#message-sent"
        />
      </DocCardGrid>

      <h3 id="message-received">message.received</h3>
      <p>Fired when a user sends a message.</p>
      <pre><code>{`{
  "event": "message.received",
  "timestamp": "2026-07-25T14:30:05Z",
  "organization_id": "org_abc123",
  "data": {
    "message_id": "msg_abc123",
    "conversation_id": "conv_xyz789",
    "content": "Hi, I need help with my order",
    "type": "text",
    "user_id": "user_001"
  }
}`}</code></pre>

      <h3 id="message-sent">message.sent</h3>
      <p>Fired when a message is sent to a user.</p>
      <pre><code>{`{
  "event": "message.sent",
  "timestamp": "2026-07-25T14:30:12Z",
  "organization_id": "org_abc123",
  "data": {
    "message_id": "msg_def456",
    "conversation_id": "conv_xyz789",
    "content": "I'd be happy to help with your order...",
    "type": "text",
    "sender_type": "ai_agent",
    "agent_id": "agent_abc"
  }
}`}</code></pre>

      <h2 id="agent-events">Agent Events</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Users}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="agent.status_changed"
          description="Fires when an agent goes online, offline, or changes availability. Includes the previous and new status."
          href="#agent-status"
        />
        <DocFeatureCard
          icon={Users}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="agent.assigned"
          description="Fires when a conversation is assigned to a human agent. Includes the agent ID and conversation context."
          href="#agent-assigned"
        />
      </DocCardGrid>

      <h3 id="agent-status">agent.status_changed</h3>
      <pre><code>{`{
  "event": "agent.status_changed",
  "timestamp": "2026-07-25T14:00:00Z",
  "organization_id": "org_abc123",
  "data": {
    "agent_id": "agent_abc",
    "previous_status": "offline",
    "new_status": "online"
  }
}`}</code></pre>

      <h3 id="agent-assigned">agent.assigned</h3>
      <pre><code>{`{
  "event": "agent.assigned",
  "timestamp": "2026-07-25T14:35:00Z",
  "organization_id": "org_abc123",
  "data": {
    "conversation_id": "conv_xyz789",
    "agent_id": "agent_abc",
    "assigned_by": "handoff_trigger"
  }
}`}</code></pre>

      <h2 id="deployment-events">Deployment Events</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Radio}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="deployment.connected"
          description="Fires when a deployment comes online. Useful for monitoring uptime and alerting when agents go down."
          href="#deployment-connected"
        />
        <DocFeatureCard
          icon={Radio}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          title="deployment.disconnected"
          description="Fires when a deployment goes offline unexpectedly. Trigger alerts or failover logic."
          href="#deployment-disconnected"
        />
      </DocCardGrid>

      <h3 id="deployment-connected">deployment.connected</h3>
      <pre><code>{`{
  "event": "deployment.connected",
  "timestamp": "2026-07-25T14:00:00Z",
  "organization_id": "org_abc123",
  "data": {
    "deployment_id": "dep_xyz",
    "agent_id": "agent_abc",
    "channel": "whatsapp"
  }
}`}</code></pre>

      <h3 id="deployment-disconnected">deployment.disconnected</h3>
      <pre><code>{`{
  "event": "deployment.disconnected",
  "timestamp": "2026-07-25T15:30:00Z",
  "organization_id": "org_abc123",
  "data": {
    "deployment_id": "dep_xyz",
    "agent_id": "agent_abc",
    "reason": "connection_timeout"
  }
}`}</code></pre>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Webhook}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Creating a Webhook"
          href="/docs/creating-webhook"
        />
        <DocNextStepCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Webhook Security"
          href="/docs/webhook-security"
        />
      </DocCardGrid>
    </DocContent>
  )
}
