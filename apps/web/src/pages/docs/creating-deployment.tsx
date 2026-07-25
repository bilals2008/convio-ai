import { Link } from 'react-router-dom'
import { Rocket, Settings, TestTube, Code, AlertCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'
import { WhatsAppIcon, TelegramIcon, DiscordIcon, SlackIcon } from '@/components/docs/brand-icons'

export default function CreatingDeploymentPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Creating a Deployment' },
        ]}
        title="Creating a Deployment"
        description="Deploy an agent to a channel in a few steps. Select your agent, configure the channel, test it, and go live."
      />

      <h2 id="overview">Overview</h2>
      <p>
        A deployment connects an agent to a channel. One agent can have multiple deployments across different channels simultaneously. Each deployment manages its own connection, status, and channel-specific configuration.
      </p>

      <h2 id="step-1-select">Step 1 — Select Agent and Channel</h2>
      <p>
        From the dashboard, navigate to <strong>Deployments</strong> and click <strong>New Deployment</strong>.
      </p>
      <ol>
        <li><strong>Choose an agent:</strong> Select the agent you want to deploy from the dropdown. Only agents with a saved configuration appear here.</li>
        <li><strong>Choose a channel:</strong> Select the platform — WhatsApp, Telegram, Discord, Slack, or Web Widget.</li>
      </ol>

      <DocCallout variant="info" icon={AlertCircle} title="One agent, multiple deployments">
        The same agent can be deployed to multiple channels. Each deployment is independent — you can pause one without affecting others.
      </DocCallout>

      <h2 id="step-2-configure">Step 2 — Channel Configuration</h2>
      <p>
        Each channel requires specific credentials and configuration. The setup form adapts based on your channel selection.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={WhatsAppIcon}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="WhatsApp"
          description="Requires Kapso Platform or Twilio credentials, phone number verification, and webhook URL."
          href="/docs/whatsapp-integration"
        />
        <DocFeatureCard
          icon={TelegramIcon}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Telegram"
          description="Requires a bot token from BotFather and webhook URL configuration."
          href="/docs/telegram-integration"
        />
        <DocFeatureCard
          icon={DiscordIcon}
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-500"
          title="Discord"
          description="OAuth2 setup generates bot token and adds the bot to your server automatically."
          href="/docs/discord-integration"
        />
        <DocFeatureCard
          icon={SlackIcon}
          iconBg="bg-purple-500/10"
          iconColor="text-purple-500"
          title="Slack"
          description="Paste your app manifest or configure event subscriptions and bot tokens manually."
          href="/docs/slack-integration"
        />
      </DocCardGrid>

      <h2 id="step-3-test">Step 3 — Test Before Going Live</h2>
      <p>
        Every deployment has a <strong>Test</strong> mode. Use it to verify the connection, check message delivery, and confirm the agent responds correctly on the target channel before activating it.
      </p>
      <ul>
        <li>Send a test message through the channel's interface</li>
        <li>Verify the agent responds with the expected behavior</li>
        <li>Check that media and formatting render correctly</li>
        <li>Confirm connection status shows <strong>Connected</strong></li>
      </ul>

      <DocCallout variant="tip" icon={TestTube} title="Test thoroughly">
        Test on a private channel or with a limited audience before deploying to production. Channel-specific formatting differences are easier to catch early.
      </DocCallout>

      <h2 id="step-4-go-live">Step 4 — Activate</h2>
      <p>
        Once testing passes, toggle the deployment to <strong>Active</strong>. The deployment status changes to green and your agent starts receiving real messages.
      </p>

      <h2 id="configuration-basics">Configuration Basics</h2>
      <p>
        Beyond channel credentials, every deployment shares these settings:
      </p>
      <ul>
        <li><strong>Deployment name:</strong> A descriptive label for internal reference</li>
        <li><strong>Agent:</strong> The agent this deployment serves</li>
        <li><strong>Status:</strong> Active, paused, or configuring</li>
        <li><strong>Webhook URL:</strong> Generated automatically for channel callbacks</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Deployment Statuses"
          href="/docs/deployment-statuses"
        />
        <DocNextStepCard
          icon={TestTube}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing Deployments"
          href="/docs/testing-deployments"
        />
      </DocCardGrid>
    </DocContent>
  )
}
