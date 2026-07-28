import { Send, MessageSquare, Zap, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ApiMessagesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Messages API' },
        ]}
        title="Messages API"
        description="Send messages, stream AI responses, retrieve message history, and track token usage per conversation."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Messages are individual turns within a conversation. Each message has a role (<code>user</code>, <code>assistant</code>, <code>system</code>), content, and optional metadata. The Messages API handles message creation, AI response generation, and conversation history retrieval.
      </p>

      <h2 id="endpoints">Endpoints</h2>
      <pre><code>{`GET    /v1/conversations/:id/messages   # List messages
POST   /v1/conversations/:id/messages   # Send a message (triggers AI response)
GET    /v1/messages/:id                 # Get a specific message`}</code></pre>

      <h2 id="send-message">Sending a Message</h2>
      <p>Send a user message to a conversation. The API triggers the agent's AI model and returns the assistant's response:</p>
      <pre><code>{`POST /v1/conversations/cv_abc123/messages
{
  "role": "user",
  "content": "What plans do you offer?"
}`}</code></pre>
      <p>Response:</p>
      <pre><code>{`{
  "data": {
    "id": "msg_def456",
    "conversation_id": "cv_abc123",
    "role": "assistant",
    "content": "We offer three plans: Starter, Pro, and Enterprise. Each includes...",
    "model": "gpt-4o",
    "tokens": {
      "prompt": 245,
      "completion": 189,
      "total": 434
    },
    "created_at": "2026-07-26T10:01:00Z"
  }
}`}</code></pre>

      <h2 id="streaming">Streaming AI Responses</h2>
      <p>
        For real-time token-by-token responses, use the streaming endpoint. Pass <code>stream: true</code> to receive Server-Sent Events:
      </p>
      <pre><code>{`POST /v1/conversations/cv_abc123/messages
{
  "role": "user",
  "content": "Tell me about your pricing",
  "stream": true
}`}</code></pre>
      <p>
        The response is a stream of SSE events with incremental content chunks. See <a href="/docs/api-streaming">Streaming API</a> for the full event format and handling.
      </p>

      <DocCallout variant="tip" icon={Zap} title="Streaming latency">
        Streaming starts within 200ms of receiving the request. The first token typically arrives in 300-800ms depending on the model and system prompt length.
      </DocCallout>

      <h2 id="message-history">Message History</h2>
      <p>Retrieve the full conversation history with pagination:</p>
      <pre><code>GET /v1/conversations/cv_abc123/messages?limit=50&order=asc
GET /v1/conversations/cv_abc123/messages?role=assistant&limit=20</code></pre>

      <h2 id="token-usage">Token Usage</h2>
      <p>
        Every assistant message includes a <code>tokens</code> object with prompt, completion, and total token counts. Use these for cost tracking, rate limit management, and usage analytics.
      </p>
      <pre><code>{`"tokens": {
  "prompt": 245,      // Tokens in the system prompt + conversation context
  "completion": 189,  // Tokens in the assistant's response
  "total": 434        // Sum of prompt + completion
}`}</code></pre>

      <h2 id="response-schema">Response Schema</h2>
      <pre><code>{`{
  "id": string,
  "conversation_id": string,
  "role": "user" | "assistant" | "system",
  "content": string,
  "model": string,           // Only on assistant messages
  "tokens": {                // Only on assistant messages
    "prompt": number,
    "completion": number,
    "total": number
  },
  "metadata": Record<string, any>,
  "created_at": string
}`}</code></pre>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Send}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Streaming API"
          href="/docs/api-streaming"
        />
        <DocNextStepCard
          icon={MessageSquare}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Knowledge Bases API"
          href="/docs/api-knowledge-bases"
        />
      </DocCardGrid>
    </DocContent>
  )
}
