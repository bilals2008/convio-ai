import { Code, Key, MessageCircle, Send } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WidgetPublicApiPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Widget Public API' },
        ]}
        title="Widget Public API"
        description="Interact with the widget programmatically using HTTP endpoints. Create conversations and send messages without the embed script."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The Widget Public API lets you interact with the widget using HTTP requests. Use it to embed the widget in non-browser environments (mobile apps, desktop clients) or build custom interfaces on top of Convio.
      </p>

      <h2 id="authentication">Authentication</h2>
      <p>
        All API requests require your widget's public key. Pass it as a query parameter or in the request header.
      </p>

      <h3 id="query-param">Query Parameter</h3>
      <pre><code>{`GET /api/widget/conversations?publicKey=pk_live_xyz`}</code></pre>

      <h3 id="header">Request Header</h3>
      <pre><code>{`Authorization: Bearer pk_live_xyz`}</code></pre>

      <DocCallout variant="warning" title="Public key scope">
        The public key can only access its own widget's conversations and messages. It cannot read other widgets or access organization-level data. Keep it out of version control.
      </DocCallout>

      <h2 id="base-url">Base URL</h2>
      <p>
        All endpoints use the base URL from your Convio instance:
      </p>
      <pre><code>{`https://your-instance.convio.app/api/widget`}</code></pre>

      <h2 id="create-conversation">Create a Conversation</h2>
      <p>
        Start a new conversation session.
      </p>

      <h3 id="create-conv-request">Request</h3>
      <pre><code>{`POST /api/widget/conversations
Content-Type: application/json

{
  "publicKey": "pk_live_xyz",
  "visitor": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "metadata": {
    "page": "/pricing",
    "referrer": "google.com"
  }
}`}</code></pre>

      <h3 id="create-conv-response">Response</h3>
      <pre><code>{`{
  "id": "conv_abc123",
  "status": "active",
  "createdAt": "2025-01-15T10:30:00Z"
}`}</code></pre>

      <h2 id="send-message">Send a Message</h2>
      <p>
        Send a message in an existing conversation.
      </p>

      <h3 id="send-msg-request">Request</h3>
      <pre><code>{`POST /api/widget/conversations/:id/messages
Content-Type: application/json

{
  "publicKey": "pk_live_xyz",
  "content": "What are your pricing plans?"
}`}</code></pre>

      <h3 id="send-msg-response">Response</h3>
      <pre><code>{`{
  "id": "msg_xyz789",
  "role": "user",
  "content": "What are your pricing plans?",
  "createdAt": "2025-01-15T10:31:00Z"
}`}</code></pre>

      <h2 id="get-messages">Get Conversation Messages</h2>
      <p>
        Retrieve all messages in a conversation.
      </p>
      <pre><code>{`GET /api/widget/conversations/:id/messages?publicKey=pk_live_xyz`}</code></pre>

      <h3 id="get-msg-response">Response</h3>
      <pre><code>{`{
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "content": "What are your pricing plans?",
      "createdAt": "2025-01-15T10:31:00Z"
    },
    {
      "id": "msg_002",
      "role": "assistant",
      "content": "We offer three plans...",
      "createdAt": "2025-01-15T10:31:05Z"
    }
  ],
  "hasMore": false
}`}</code></pre>

      <h2 id="rate-limits">Rate Limits</h2>
      <ul>
        <li><strong>Messages:</strong> 30 per conversation per minute</li>
        <li><strong>Conversations:</strong> 10 per public key per minute</li>
        <li><strong>Read requests:</strong> 60 per public key per minute</li>
      </ul>

      <DocCallout variant="info" icon={Code} title="Streaming responses">
        The public API returns complete messages. For streaming responses (like the widget provides), use the WebSocket endpoint at <code>wss://your-instance.convio.app/api/widget/stream</code>.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Key}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Embedding with Script Tag"
          href="/docs/embedding-script"
        />
        <DocNextStepCard
          icon={Send}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="JavaScript API"
          href="/docs/embedding-javascript"
        />
      </DocCardGrid>
    </DocContent>
  )
}
