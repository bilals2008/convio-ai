import { Webhook, Settings, Terminal, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'
import { TelegramIcon } from '@/components/docs/brand-icons'

export default function TelegramIntegrationPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Telegram Integration' },
        ]}
        title="Telegram Integration"
        description="Set up a Telegram bot via BotFather. Configure the bot token, set up webhooks, and define bot commands."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Telegram bots are first-class citizens in the Telegram ecosystem. They require no app review, support rich media, and can be set up in minutes. Convio handles the Telegram Bot API integration automatically.
      </p>

      <h2 id="create-bot">Creating a Bot via BotFather</h2>
      <p>
        Telegram bots are created through <strong>@BotFather</strong>, Telegram's official bot management tool.
      </p>
      <ol>
        <li>Open Telegram and search for <strong>@BotFather</strong></li>
        <li>Send <code>/newbot</code> to create a new bot</li>
        <li>Enter a display name for your bot (e.g., "My Support Agent")</li>
        <li>Enter a username for your bot (must end in <code>bot</code>, e.g., <code>mycompany_supportbot</code>)</li>
        <li>BotFather sends you a bot token — copy it immediately</li>
      </ol>

      <DocCallout variant="warning" icon={TelegramIcon} title="Keep your token secure">
        The bot token provides full control over your bot. Never share it publicly or commit it to version control. If compromised, revoke it via BotFather with <code>/revoke</code>.
      </DocCallout>

      <h2 id="bot-token">Bot Token Setup</h2>
      <p>
        Paste the bot token into the Convio deployment form:
      </p>
      <ol>
        <li>Navigate to <strong>Deployments → New Deployment → Telegram</strong></li>
        <li>Paste the bot token from BotFather</li>
        <li>Convio validates the token and confirms the connection</li>
        <li>The deployment status changes to <strong>Active</strong></li>
      </ol>

      <h2 id="webhook-config">Webhook Configuration</h2>
      <p>
        Convio automatically registers the webhook URL with Telegram when the deployment activates. No manual webhook setup is needed.
      </p>
      <p>
        The webhook receives these update types:
      </p>
      <ul>
        <li><strong>message:</strong> Text, media, stickers, and other message types</li>
        <li><strong>callback_query:</strong> Inline keyboard button presses</li>
        <li><strong>my_chat_member:</strong> Bot added to or removed from groups</li>
      </ul>

      <h3 id="webhook-troubleshooting">Troubleshooting</h3>
      <p>
        If messages are not being received:
      </p>
      <ul>
        <li>Verify the webhook is set by calling <code>getWebhookInfo</code> via the Telegram Bot API</li>
        <li>Check that the webhook URL is accessible from Telegram's servers</li>
        <li>Ensure SSL is properly configured (Telegram requires valid HTTPS)</li>
        <li>Review the Convio logs for webhook delivery errors</li>
      </ul>

      <h2 id="bot-commands">Bot Commands</h2>
      <p>
        Define bot commands to provide quick navigation for users. Commands appear as suggestions when users type <code>/</code> in the chat.
      </p>
      <p>
        Configure commands via BotFather:
      </p>
      <ol>
        <li>Send <code>/setcommands</code> to BotFather</li>
        <li>Select your bot</li>
        <li>Send the command list in this format:</li>
      </ol>

      <pre><code>{`start - Start a conversation
help - Get help information
menu - Open the main menu
support - Contact human support`}</code></pre>

      <DocCallout variant="tip" icon={Terminal} title="Command handlers">
        Convio automatically handles registered commands. Define responses for each command in your agent's system prompt or as predefined flows.
      </DocCallout>

      <h2 id="group-support">Group Support</h2>
      <p>
        Telegram bots can operate in groups and channels:
      </p>
      <ul>
        <li><strong>Groups:</strong> The bot responds when mentioned (<code>@yourbot</code>) or in reply to its messages</li>
        <li><strong>Channels:</strong> The bot can post announcements and respond to comments</li>
        <li><strong>Privacy mode:</strong> By default, bots only see messages that mention them or are replies to them</li>
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
          icon={Webhook}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Deployment Statuses"
          href="/docs/deployment-statuses"
        />
      </DocCardGrid>
    </DocContent>
  )
}
