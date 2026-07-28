import { Link } from 'react-router-dom'
import { TestTube, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'
import { WhatsAppIcon, TelegramIcon, DiscordIcon, SlackIcon } from '@/components/docs/brand-icons'

export default function TestingDeploymentsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Testing Deployments' },
        ]}
        title="Testing Deployments"
        description="Verify your agent works correctly on each channel before going live. End-to-end testing, connection diagnostics, and delivery verification."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Every deployment should be tested before activation. Convio provides tools for end-to-end testing, connection diagnostics, and message delivery verification across all channels.
      </p>

      <h2 id="end-to-end">End-to-End Testing</h2>
      <p>
        End-to-end testing sends a real message through the channel and verifies the agent responds correctly. This catches formatting issues, connection problems, and agent behavior differences.
      </p>

      <h3 id="test-flow">Test Flow</h3>
      <ol>
        <li>Navigate to the deployment's <strong>Test</strong> tab</li>
        <li>Click <strong>Send Test Message</strong></li>
        <li>A predefined test message is sent through the channel</li>
        <li>Convio monitors for the agent's response</li>
        <li>Results show delivery status, response time, and content</li>
      </ol>

      <h3 id="test-per-channel">Per-Channel Testing</h3>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={WhatsAppIcon}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="WhatsApp"
          description="Send a test message to your WhatsApp number. Verify the agent responds and formatting renders correctly."
          href="#whatsapp-test"
        />
        <DocFeatureCard
          icon={TelegramIcon}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Telegram"
          description="Message your Telegram bot directly. Check that the response appears in the chat without delays."
          href="#telegram-test"
        />
        <DocFeatureCard
          icon={DiscordIcon}
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-500"
          title="Discord"
          description="Mention the bot in a test channel. Verify slash commands and message formatting in Discord's Markdown."
          href="#discord-test"
        />
        <DocFeatureCard
          icon={SlackIcon}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
          title="Slack"
          description="DM the bot or mention it in a channel. Confirm the response uses Slack's Block Kit formatting."
          href="#slack-test"
        />
      </DocCardGrid>

      <h2 id="connection-diagnostics">Connection Diagnostics</h2>
      <p>
        The diagnostics panel provides real-time connection health information:
      </p>
      <ul>
        <li><strong>Webhook status:</strong> Whether the webhook is reachable and responding with 200 status</li>
        <li><strong>SSL certificate:</strong> Certificate validity and expiration date</li>
        <li><strong>Latency:</strong> Round-trip time for webhook delivery</li>
        <li><strong>Last event:</strong> Timestamp of the most recent event received</li>
        <li><strong>Error log:</strong> Recent errors with timestamps and details</li>
      </ul>

      <DocCallout variant="tip" icon={CheckCircle2} title="Health check endpoint">
        Convio exposes a health check endpoint at <code>/health</code> on your webhook URL. Use this to verify the endpoint is reachable from external services.
      </DocCallout>

      <h2 id="delivery-verification">Message Delivery Verification</h2>
      <p>
        Verify that messages are actually reaching users:
      </p>
      <ul>
        <li><strong>Delivery receipts:</strong> Check that messages show as delivered in the channel</li>
        <li><strong>Read receipts:</strong> For channels that support it, confirm messages are being read</li>
        <li><strong>Response time:</strong> Measure the time between user message and agent response</li>
        <li><strong>Content accuracy:</strong> Verify the response matches what the agent generated</li>
      </ul>

      <h2 id="common-scenarios">Common Test Scenarios</h2>
      <DocCallout variant="info" icon={AlertTriangle} title="Test these before going live">
        These scenarios cover the most common issues found in production deployments.
      </DocCallout>

      <h3 id="scenario-greeting">Basic Greeting</h3>
      <p>
        Send "hello" or "hi" and verify the agent responds with its welcome message or greeting. Confirms the basic message pipeline is working.
      </p>

      <h3 id="scenario-knowledge">Knowledge Base Query</h3>
      <p>
        Ask a question that should be answered from the knowledge base. Verifies that the tool pipeline and knowledge retrieval are functioning.
      </p>

      <h3 id="scenario-long-message">Long Message Handling</h3>
      <p>
        Send a message that approaches or exceeds the channel's character limit. Verify the agent handles truncation or splitting correctly.
      </p>

      <h3 id="scenario-media">Media Handling</h3>
      <p>
        Send an image or document (where supported). Verify the agent processes the media and responds appropriately.
      </p>

      <h3 id="scenario-overflow">Overflow to Human</h3>
      <p>
        Send a message the agent cannot answer. Verify it offers to connect with a human agent or provides an appropriate fallback.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={CheckCircle2}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Deployments"
          href="/docs/managing-deployments"
        />
        <DocNextStepCard
          icon={MessageCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Channel-Specific Behavior"
          href="/docs/channel-behavior"
        />
      </DocCardGrid>
    </DocContent>
  )
}
