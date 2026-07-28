import { Link } from 'react-router-dom'
import { Zap, Radio, AlertTriangle, Activity } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function MessageStreamingPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Message Streaming' },
        ]}
        title="Message Streaming"
        description="Learn how Convio streams AI responses in real time using Server-Sent Events, and what to expect in terms of latency and reliability."
      />

      <h2 id="how-streaming-works">How SSE Streaming Works</h2>
      <p>
        Convio uses Server-Sent Events (SSE) to stream AI responses token-by-token as they're generated. Instead of waiting for the full response, users see text appear progressively — the same experience as ChatGPT or Claude.
      </p>

      <h3 id="streaming-flow">The Streaming Flow</h3>
      <ol>
        <li>User sends a message</li>
        <li>Convio sends the message to the configured AI provider</li>
        <li>The AI provider begins generating a response</li>
        <li>Each generated token is sent to the client via an SSE connection</li>
        <li>The client appends each token to the message bubble in real time</li>
        <li>When generation completes, a final event signals the end of the stream</li>
      </ol>

      <DocCallout variant="info" icon={Radio} title="SSE vs WebSocket">
        SSE is used instead of WebSockets because AI responses are unidirectional (server → client). SSE is simpler, requires no additional infrastructure, and automatically reconnects on network interruptions.
      </DocCallout>

      <h2 id="real-time-responses">Real-Time AI Responses</h2>
      <p>
        From the user's perspective, responses appear to be generated in real time. This provides several benefits:
      </p>
      <ul>
        <li><strong>Perceived speed:</strong> Users see the first word within 1-2 seconds, even if the full response takes 10+ seconds</li>
        <li><strong>Engagement:</strong> Progressive text keeps users watching rather than staring at a loading spinner</li>
        <li><strong>Early exit:</strong> Users can stop reading once they have the answer, without waiting for the full response</li>
      </ul>

      <h3 id="what-streams">What Gets Streamed</h3>
      <ul>
        <li><strong>Text tokens:</strong> The actual response content — streamed word by word</li>
        <li><strong>Tool calls:</strong> When the agent invokes a tool, a tool call event is streamed (the tool executes, then text streaming resumes)</li>
        <li><strong>Metadata:</strong> Token counts and model info are sent as a final event after streaming completes</li>
      </ul>

      <h2 id="latency">Latency Expectations</h2>
      <p>
        Streaming latency depends on the AI provider and model:
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Provider / Model</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Time to First Token</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Tokens per Second</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">OpenAI GPT-4o</td>
              <td className="py-2 pr-4">~0.5–1.5s</td>
              <td className="py-2">~80–120 tokens/s</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">OpenAI GPT-4o-mini</td>
              <td className="py-2 pr-4">~0.3–1.0s</td>
              <td className="py-2">~100–150 tokens/s</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Claude 3.5 Sonnet</td>
              <td className="py-2 pr-4">~0.5–2.0s</td>
              <td className="py-2">~70–100 tokens/s</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Claude 3 Haiku</td>
              <td className="py-2 pr-4">~0.2–0.8s</td>
              <td className="py-2">~100–150 tokens/s</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Gemini 1.5 Pro</td>
              <td className="py-2 pr-4">~0.5–1.5s</td>
              <td className="py-2">~90–130 tokens/s</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCallout variant="tip" icon={Zap} title="First token latency matters most">
        Users judge responsiveness by how quickly the first word appears, not how fast the full response streams. Time to First Token (TTFT) is the most critical metric for perceived performance.
      </DocCallout>

      <h2 id="handling-interruptions">Handling Stream Interruptions</h2>
      <p>
        Network issues can interrupt a stream mid-response. Convio handles this gracefully:
      </p>
      <ul>
        <li><strong>Auto-reconnect:</strong> SSE connections automatically reconnect and resume from where they left off (up to 30 seconds of interruption)</li>
        <li><strong>Partial recovery:</strong> If reconnection succeeds, any tokens generated during the interruption are delivered retroactively</li>
        <li><strong>Fallback:</strong> If reconnection fails after 30 seconds, the partial response is saved and a "Response interrupted" indicator is shown</li>
        <li><strong>Retry:</strong> Users can resend their message to trigger a new response generation</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="Tool calls don't resume">
        If a stream is interrupted during a tool call (e.g., the agent was searching the knowledge base), the tool call is not retried automatically. The agent will retry the tool on the next message.
      </DocCallout>

      <h2 id="dashboard-streaming">Dashboard Streaming Behavior</h2>
      <p>
        The dashboard mirrors the user's streaming experience. When viewing a conversation with an active AI response:
      </p>
      <ul>
        <li>You see tokens appear in real time as the AI generates them</li>
        <li>A typing indicator shows while the response is streaming</li>
        <li>The stop button is available to interrupt generation</li>
        <li>Once complete, token usage metadata appears alongside the message</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Activity}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Conversation Metadata"
          href="/docs/conversation-metadata"
        />
        <DocNextStepCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Sending Messages"
          href="/docs/sending-messages"
        />
      </DocCardGrid>
    </DocContent>
  )
}
