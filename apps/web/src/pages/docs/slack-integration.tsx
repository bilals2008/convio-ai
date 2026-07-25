import { Link } from 'react-router-dom'
import { Send, Settings, AtSign, FileText, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function SlackIntegrationPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Slack Integration' },
        ]}
        title="Slack Integration"
        description="Integrate your agent into Slack workspaces. Configure event subscriptions, bot tokens, and app manifest settings."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Slack integration uses Slack's App framework. Convio supports both the App Manifest method (recommended) and manual configuration via event subscriptions and bot tokens.
      </p>

      <h2 id="app-manifest">App Manifest Configuration</h2>
      <p>
        The fastest way to set up a Slack app is using an app manifest. This JSON file defines your app's configuration in one place.
      </p>
      <ol>
        <li>Navigate to <strong>Deployments → New Deployment → Slack</strong></li>
        <li>Copy the app manifest provided by Convio</li>
        <li>Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">api.slack.com/apps</a> and click <strong>Create New App → From an app manifest</strong></li>
        <li>Select your workspace and paste the manifest</li>
        <li>Review the permissions and click <strong>Create</strong></li>
        <li>Install the app to your workspace</li>
      </ol>

      <DocCallout variant="tip" icon={FileText} title="Manifest benefits">
        The app manifest pre-configures event subscriptions, OAuth scopes, bot user settings, and slash commands. This eliminates manual configuration errors and ensures all required permissions are included.
      </DocCallout>

      <h2 id="event-subscriptions">Event Subscriptions</h2>
      <p>
        Slack sends events to your app via HTTP webhooks. Convio configures the event subscription URL automatically when you create the deployment.
      </p>

      <h3 id="subscribed-events">Subscribed Events</h3>
      <ul>
        <li><code>message.im</code> — Direct messages to the bot</li>
        <li><code>message.channels</code> — Messages in channels where the bot is mentioned</li>
        <li><code>message.groups</code> — Messages in private channels where the bot is a member</li>
        <li><code>app_mention</code> — When the bot is mentioned in a channel</li>
        <li><code>reaction_added</code> — Reactions added to bot messages (for feedback tracking)</li>
      </ul>

      <h3 id="verification">Request Verification</h3>
      <p>
        Convio verifies all incoming Slack requests using the signing secret. This prevents replay attacks and ensures events originate from Slack.
      </p>

      <h2 id="bot-tokens">Bot Tokens</h2>
      <p>
        Slack uses different token types for different purposes:
      </p>
      <ul>
        <li><strong>Bot User OAuth Token (<code>xoxb-</code>):</strong> Used for API calls on behalf of the bot. Required for sending messages and reading channels.</li>
        <li><strong>App-Level Token (<code>xapp-</code>):</strong> Used for WebSocket connections and app-level operations.</li>
      </ul>

      <p>
        Convio requires the <strong>Bot User OAuth Token</strong>. Find it in your app's <strong>OAuth & Permissions</strong> page.
      </p>

      <h2 id="channel-mentions">Channel Mentions</h2>
      <p>
        In channels, the bot responds when:
      </p>
      <ul>
        <li><strong>Directly mentioned:</strong> <code>@YourBot</code> in a message</li>
        <li><strong>Reply to bot message:</strong> Replying to a previous bot response</li>
        <li><strong>Thread participation:</strong> The bot responds within threads it's already part of</li>
      </ul>

      <DocCallout variant="info" icon={AtSign} title="Mention detection">
        Convio parses Slack's mention format (<code>&lt;@USER_ID&gt;</code>) and strips it from the message before sending to the agent. Your agent receives clean message content without mention syntax.
      </DocCallout>

      <h2 id="permissions">Required OAuth Scopes</h2>
      <p>
        The app manifest includes all required scopes, but for reference:
      </p>
      <ul>
        <li><code>chat:write</code> — Send messages</li>
        <li><code>channels:history</code> — Read channel messages</li>
        <li><code>groups:history</code> — Read private channel messages</li>
        <li><code>im:history</code> — Read direct message history</li>
        <li><code>app_mentions:read</code> — Detect mentions</li>
        <li><code>reactions:read</code> — Track reactions</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing Deployments"
          href="/docs/testing-deployments"
        />
        <DocNextStepCard
          icon={Send}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Deployments"
          href="/docs/managing-deployments"
        />
      </DocCardGrid>
    </DocContent>
  )
}
