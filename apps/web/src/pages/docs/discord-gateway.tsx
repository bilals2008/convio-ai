import { Link } from 'react-router-dom'
import { Network, Zap, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function DiscordGatewayPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Discord Gateway & Interactions' },
        ]}
        title="Discord Gateway & Interactions"
        description="Understand how the Discord gateway works, how interactions are processed, and how Convio handles reconnection."
      />

      <h2 id="overview">How the Discord Gateway Works</h2>
      <p>
        Discord uses a WebSocket-based gateway for real-time communication. Unlike webhooks (which receive events via HTTP), the gateway maintains a persistent connection to Discord's servers, receiving events as they happen.
      </p>
      <ul>
        <li><strong>WebSocket connection:</strong> A persistent bidirectional connection to Discord's gateway servers</li>
        <li><strong>Heartbeat:</strong> Regular pings to confirm the connection is alive (every 41.25 seconds)</li>
        <li><strong>Event stream:</strong> All server events (messages, reactions, member updates) flow through the gateway</li>
        <li><strong>Sharding:</strong> Large bots split across multiple gateway connections for scalability</li>
      </ul>

      <h2 id="interaction-types">Handling Interactions</h2>
      <p>
        Discord interactions come in several forms. Convio processes each type appropriately:
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Message Create"
          description="Standard messages sent to the bot. Processed through the agent pipeline and responded to in the same channel."
          href="#message-create"
        />
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="Slash Commands"
          description="Structured commands with arguments. Parsed and routed to specific handlers based on the command name."
          href="#slash-commands"
        />
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
          title="Component Interactions"
          description="Button clicks and select menu choices. Handled as follow-up interactions within an existing conversation."
          href="#component-interactions"
        />
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-orange-500/10"
          iconColor="text-orange-500"
          title="Modal Submissions"
          description="Form submissions from modal dialogs. Parsed and processed as structured input to the agent."
          href="#modal-submissions"
        />
      </DocCardGrid>

      <h3 id="message-create">Message Create Events</h3>
      <p>
        When a user sends a message to the bot (via mention or DM), the gateway fires a <code>MESSAGE_CREATE</code> event. Convio:
      </p>
      <ol>
        <li>Receives the event via the WebSocket connection</li>
        <li>Normalizes the message content and metadata</li>
        <li>Routes it to the configured agent</li>
        <li>Sends the agent's response back through the Discord API</li>
      </ol>

      <h3 id="slash-commands">Slash Command Interactions</h3>
      <p>
        Slash command interactions are HTTP-based (not gateway events). Discord sends an interaction payload to the configured endpoint. Convio responds within 3 seconds for simple commands, or uses deferred responses for longer operations.
      </p>

      <h2 id="event-processing">Event Processing</h2>
      <p>
        Convio processes gateway events in order:
      </p>
      <ul>
        <li><strong>Event buffering:</strong> Events are queued and processed sequentially to maintain ordering</li>
        <li><strong>Deduplication:</strong> Duplicate events (from gateway reconnects) are detected and dropped</li>
        <li><strong>Rate limiting:</strong> Outgoing API calls respect Discord's rate limits (50 requests per second per bucket)</li>
      </ul>

      <h2 id="reconnection">Reconnection Handling</h2>
      <p>
        Discord's gateway can disconnect for various reasons — network issues, Discord maintenance, or heartbeat timeouts. Convio handles reconnection automatically:
      </p>

      <h3 id="reconnect-sequence">Reconnection Sequence</h3>
      <ol>
        <li><strong>Detect disconnection:</strong> WebSocket close event or heartbeat failure</li>
        <li><strong>Wait with backoff:</strong> Exponential backoff starting at 1 second, capped at 60 seconds</li>
        <li><strong>Reconnect:</strong> Re-establish the WebSocket connection with the last sequence number</li>
        <li><strong>Resume:</strong> Request missed events from the point of disconnection</li>
        <li><strong>Verify:</strong> Confirm the connection is stable before resuming event processing</li>
      </ol>

      <DocCallout variant="tip" icon={RefreshCw} title="Automatic recovery">
        Convio maintains the gateway connection 24/7. Brief disconnections (under 30 seconds) are transparent to users — messages arriving during the gap are buffered and processed once the connection resumes.
      </DocCallout>

      <h3 id="reconnect-failures">Handling Persistent Failures</h3>
      <p>
        If reconnection fails after multiple attempts:
      </p>
      <ul>
        <li>The deployment status changes to <strong>Error</strong></li>
        <li>An alert is sent with the failure reason</li>
        <li>Retries continue with increasing intervals (up to 15 minutes)</li>
        <li>Once the gateway becomes available, the connection recovers automatically</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Network}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Discord Integration"
          href="/docs/discord-integration"
        />
        <DocNextStepCard
          icon={AlertTriangle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Deployment Statuses"
          href="/docs/deployment-statuses"
        />
      </DocCardGrid>
    </DocContent>
  )
}
