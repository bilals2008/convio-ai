import { MessageSquare, Plus, ArrowRight, Filter, Settings } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ApiConversationsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Conversations API' },
        ]}
        title="Conversations API"
        description="Manage conversations between users and agents. Create sessions, track status, send messages, and retrieve conversation history."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Conversations are the core unit of interaction in Convio. Each conversation belongs to an agent and can be associated with a channel (web widget, WhatsApp, Telegram, etc.). The Conversations API lets you programmatically create conversations, send messages, track status, and retrieve history.
      </p>

      <h2 id="endpoints">Endpoints</h2>
      <pre><code>{`GET    /v1/conversations              # List conversations
POST   /v1/conversations              # Create a conversation
GET    /v1/conversations/:id          # Get a specific conversation
PATCH  /v1/conversations/:id          # Update conversation
DELETE /v1/conversations/:id          # Delete a conversation
POST   /v1/conversations/:id/messages # Send a message in a conversation`}</code></pre>

      <h2 id="create-conversation">Create Conversation</h2>
      <pre><code>{`POST /v1/conversations
{
  "agent_id": "agent_xyz789",
  "channel": "web_widget",
  "metadata": {
    "user_email": "user@example.com",
    "user_name": "Jane Smith"
  }
}`}</code></pre>
      <p>Response:</p>
      <pre><code>{`{
  "data": {
    "id": "cv_abc123",
    "agent_id": "agent_xyz789",
    "status": "active",
    "channel": "web_widget",
    "metadata": {
      "user_email": "user@example.com",
      "user_name": "Jane Smith"
    },
    "message_count": 0,
    "created_at": "2026-07-26T10:00:00Z",
    "updated_at": "2026-07-26T10:00:00Z"
  }
}`}</code></pre>

      <h2 id="status-transitions">Status Transitions</h2>
      <p>Conversations follow a defined state machine:</p>
      <ul>
        <li><code>active</code> — In progress, accepting messages</li>
        <li><code>pending</code> — Awaiting human agent response (handoff)</li>
        <li><code>resolved</code> — Conversation completed successfully</li>
        <li><code>archived</code> — Hidden from default views, data preserved</li>
      </ul>

      <DocCallout variant="tip" icon={MessageSquare} title="Status transitions are validated">
        You cannot move a conversation directly from <code>archived</code> to <code>active</code>. The API returns a <code>400 Bad Request</code> for invalid transitions. See valid transitions in the error response.
      </DocCallout>

      <h2 id="send-message">Sending Messages</h2>
      <p>Send a user message to trigger an agent response:</p>
      <pre><code>{`POST /v1/conversations/cv_abc123/messages
{
  "role": "user",
  "content": "What are your business hours?"
}`}</code></pre>

      <h2 id="filtering">Filtering Conversations</h2>
      <p>Filter the list endpoint by status, agent, channel, or date range:</p>
      <pre><code>GET /v1/conversations?status=active&agent_id=agent_xyz789
GET /v1/conversations?created_after=2026-01-01&channel=whatsapp
GET /v1/conversations?sort=updated_at&order=desc&limit=50</code></pre>

      <h2 id="response-schema">Response Schema</h2>
      <pre><code>{`{
  "id": string,
  "agent_id": string,
  "status": "active" | "pending" | "resolved" | "archived",
  "channel": string,
  "metadata": Record<string, any>,
  "message_count": number,
  "created_at": string,
  "updated_at": string
}`}</code></pre>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Messages API"
          href="/docs/api-messages"
        />
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Streaming API"
          href="/docs/api-streaming"
        />
      </DocCardGrid>
    </DocContent>
  )
}
