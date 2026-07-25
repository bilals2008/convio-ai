import { AlertTriangle, Globe, Shield, Settings, RefreshCw, Key } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'
import { TelegramIcon } from '@/components/docs/brand-icons'

export default function TelegramIssuesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Troubleshooting', href: '/docs' },
          { label: 'Telegram Integration Issues' },
        ]}
        title="Telegram Integration Issues"
        description="Resolve Telegram bot problems — webhook setup, bot token issues, message delivery, and group vs private chat configuration."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Telegram integrations use bot tokens and webhooks to receive and send messages. Issues typically involve webhook registration, token validity, message delivery failures, or permission differences between group and private chats.
      </p>

      <h2 id="debug-steps">Debug Steps</h2>
      <ol>
        <li>Check the deployment status in <strong>Deployments → Telegram → Status</strong></li>
        <li>Verify the webhook is registered by calling <code>getWebhookInfo</code> via Telegram API</li>
        <li>Review message logs for delivery failures or errors</li>
        <li>Test the bot directly by sending a message in a private chat</li>
        <li>Check the bot's recent API responses for error codes</li>
      </ol>

      <h2 id="webhook-setup">Webhook Setup Problems</h2>
      <p>
        Telegram delivers updates to your bot via webhooks. If the webhook isn't registered or reachable, the bot won't receive messages.
      </p>

      <h3 id="webhook-requirements">Webhook Requirements</h3>
      <ul>
        <li>The webhook URL must be publicly accessible over HTTPS</li>
        <li>The URL must return a valid SSL certificate (Telegram rejects self-signed certs)</li>
        <li>The endpoint must respond with a <code>200</code> status within 30 seconds</li>
        <li>The URL must be registered via the <code>setWebhook</code> API call</li>
      </ul>

      <DocCallout variant="info" icon={Globe} title="Verify webhook">
        Call <code>getWebhookInfo</code> to check the current webhook status. If the URL is wrong or has errors, the response includes the last error message from Telegram.
      </DocCallout>

      <h3 id="webhook-fix">Fix Webhook Issues</h3>
      <ol>
        <li>Ensure the endpoint is accessible from the internet (not behind a firewall)</li>
        <li>Check that the SSL certificate is valid and trusted</li>
        <li>Register the webhook via <strong>Deployments → Telegram → Webhook Settings</strong></li>
        <li>If using a reverse proxy, ensure it forwards the request body correctly</li>
        <li>Test the endpoint manually with a POST request containing a sample update</li>
      </ol>

      <h2 id="bot-token-issues">Bot Token Issues</h2>
      <p>
        The bot token authenticates your bot with Telegram's API. Invalid or revoked tokens prevent all communication.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Key}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="Token Revoked"
          description="If you regenerated the token in BotFather, the old token is immediately invalidated. Update the new token in Convio."
          href="/docs/telegram-integration"
        />
        <DocFeatureCard
          icon={Key}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="Token Format"
          description="Telegram tokens follow the format <code>123456789:ABCdefGHIjklMNOpqrSTUvwxYZ</code>. Check for missing characters or extra spaces."
          href="/docs/telegram-integration"
        />
      </DocCardGrid>

      <h3 id="regenerate-token">Regenerate Token</h3>
      <p>
        Open BotFather in Telegram, use <code>/mybots</code> to select your bot, and click <strong>API Token → Revoke current token</strong>. Copy the new token and update it in Convio.
      </p>

      <h2 id="message-delivery-failures">Message Delivery Failures</h2>
      <p>
        Messages sent by the bot fail to reach the user.
      </p>
      <ul>
        <li><strong>User hasn't started the bot:</strong> The user must send <code>/start</code> to the bot before it can message them in private chats</li>
        <li><strong>Bot blocked by user:</strong> If the user blocked the bot, messages silently fail</li>
        <li><strong>Rate limiting:</strong> Telegram limits bots to 30 messages per second in groups, 1 message per second in private chats to new users</li>
        <li><strong>Message too long:</strong> Telegram limits messages to 4096 characters. Longer content must be split or sent as a file</li>
      </ul>

      <DocCallout variant="warning" icon={TelegramIcon} title="Anti-spam limits">
        New bots are restricted from messaging users who haven't initiated a conversation. This is Telegram's anti-spam measure. The bot must receive at least one message from the user before replying.
      </DocCallout>

      <h2 id="group-vs-private">Group vs Private Chat Issues</h2>
      <p>
        Bots behave differently in group chats and private chats. Permission and response settings may need separate configuration.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={TelegramIcon}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="Private Chats"
          description="The bot receives all messages. It can respond freely. User must initiate with /start first."
          href="/docs/telegram-integration"
        />
        <DocFeatureCard
          icon={TelegramIcon}
          iconBg="bg-green-500/10"
          iconColor="text-green-500"
          title="Group Chats"
          description="The bot only receives messages that mention it or reply to its messages. Privacy mode is enabled by default."
          href="/docs/telegram-integration"
        />
      </DocCardGrid>

      <h3 id="group-privacy">Disabling Privacy Mode</h3>
      <p>
        To allow the bot to read all messages in a group (not just mentions), disable privacy mode via BotFather: <code>/setprivacy</code> → Select your bot → Disable. The bot must be re-added to the group for the change to take effect.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={TelegramIcon}
          iconBg="bg-sky-500/10"
          iconColor="text-sky-500"
          title="Telegram Integration Setup"
          href="/docs/telegram-integration"
        />
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing Deployments"
          href="/docs/testing-deployments"
        />
      </DocCardGrid>
    </DocContent>
  )
}
