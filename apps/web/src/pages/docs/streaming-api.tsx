import { Radio, Zap, AlertTriangle, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function StreamingApiPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Streaming API' },
        ]}
        title="Streaming API"
        description="Get real-time, token-by-token AI responses using Server-Sent Events. Build responsive UIs that show text as it's generated."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The Streaming API delivers AI-generated responses in real time using Server-Sent Events (SSE). Instead of waiting for the complete response, you receive tokens as they're generated — typically starting within 200ms and delivering tokens every 20-50ms.
      </p>

      <h2 id="how-it-works">How It Works</h2>
      <p>
        Pass <code>"stream": true</code> in any message request. The API switches from a standard JSON response to an SSE stream:
      </p>
      <pre><code>{`POST /v1/conversations/cv_abc123/messages
{
  "role": "user",
  "content": "Explain quantum computing",
  "stream": true
}`}</code></pre>

      <h2 id="event-format">Event Format</h2>
      <p>Each SSE event follows this structure:</p>
      <pre><code>{`event: message
data: {"type":"token","content":"Quantum","conversation_id":"cv_abc123"}

event: message
data: {"type":"token","content":" computing","conversation_id":"cv_abc123"}

event: message
data: {"type":"done","conversation_id":"cv_abc123","tokens":{"prompt":120,"completion":856,"total":976}}

event: done
data: [DONE]`}</code></pre>

      <h3 id="event-types">Event Types</h3>
      <ul>
        <li><code>token</code> — A single content token. Accumulate these to build the full response.</li>
        <li><code>done</code> — The stream is complete. Includes final token counts.</li>
        <li><code>error</code> — An error occurred mid-stream. Includes error details.</li>
      </ul>

      <h2 id="handling-sse">Handling the Event Stream</h2>
      <p>JavaScript example using the Fetch API:</p>
      <pre><code>{`const response = await fetch('https://api.convio.com/v1/conversations/cv_abc123/messages', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer conv_your_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    role: 'user',
    content: 'Tell me about your product',
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();
let fullContent = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') break;

      const event = JSON.parse(data);
      if (event.type === 'token') {
        fullContent += event.content;
        // Update UI with fullContent
      }
    }
  }
}`}</code></pre>

      <DocCallout variant="warning" icon={AlertTriangle} title="Handle stream errors">
        The connection may drop mid-stream due to network issues or server timeouts. Always implement reconnection logic and handle the <code>error</code> event type. If the stream ends without a <code>done</code> event, retry the request.
      </DocCallout>

      <h2 id="error-handling">Error Handling</h2>
      <p>If an error occurs during streaming, an error event is sent and the stream closes:</p>
      <pre><code>{`event: error
data: {"code":"rate_limit_exceeded","message":"Rate limit exceeded. Retry after 60s."}`}</code></pre>
      <p>Handle these by displaying the error to the user and optionally retrying the request.</p>

      <h2 id="concurrency">Concurrency Limits</h2>
      <p>
        Each API key allows up to 50 concurrent streams. Attempting to open additional streams beyond this limit returns a <code>429</code> response. Use connection pooling to manage concurrent streams efficiently.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Radio}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Webhook Events Reference"
          href="/docs/api-webhooks"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Rate Limiting"
          href="/docs/api-rate-limiting"
        />
      </DocCardGrid>
    </DocContent>
  )
}
