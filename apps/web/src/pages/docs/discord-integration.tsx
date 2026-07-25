import { Link } from 'react-router-dom'
import { Settings, Shield, User, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'
import { DiscordIcon } from '@/components/docs/brand-icons'

export default function DiscordIntegrationPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Discord Integration' },
        ]}
        title="Discord Integration"
        description="Add your agent to Discord servers with one-click OAuth2. Configure slash commands, set bot nicknames, and manage permissions."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Discord integration uses OAuth2 to add your bot to servers with a single click. The bot operates within Discord's permission system and supports slash commands, thread interactions, and server-specific configuration.
      </p>

      <h2 id="oauth2-setup">One-Click OAuth2 Setup</h2>
      <p>
        Convio handles the Discord OAuth2 flow automatically:
      </p>
      <ol>
        <li>Navigate to <strong>Deployments → New Deployment → Discord</strong></li>
        <li>Click <strong>Authorize with Discord</strong></li>
        <li>Log in to your Discord account (if not already logged in)</li>
        <li>Select the server where you want to add the bot</li>
        <li>Review and approve the requested permissions</li>
        <li>The bot joins the server and the deployment activates</li>
      </ol>

      <DocCallout variant="info" icon={Shield} title="Required permissions">
        Convio requests only the minimum permissions needed: Send Messages, Read Message History, Use Slash Commands, and Manage Messages (for context). You can adjust these in Discord's server settings after installation.
      </DocCallout>

      <h2 id="slash-commands">Slash Commands</h2>
      <p>
        Discord slash commands provide a structured way for users to interact with your agent:
      </p>
      <ul>
        <li><code>/ask</code> — Send a message to the agent (default command)</li>
        <li><code>/help</code> — Show usage information and available commands</li>
        <li><code>/reset</code> — Clear conversation history and start fresh</li>
      </ul>

      <h3 id="custom-commands">Custom Commands</h3>
      <p>
        Define custom slash commands through the Convio dashboard. Each command maps to a specific action or prompt modification:
      </p>
      <ul>
        <li>Commands are registered globally or per-server</li>
        <li>Support optional arguments with type validation</li>
        <li>Can trigger specific agent behaviors or tools</li>
      </ul>

      <h2 id="bot-nickname">Bot Nickname Configuration</h2>
      <p>
        Set a custom nickname for the bot in each server. This controls how the bot appears in the member list and chat:
      </p>
      <ul>
        <li>Set via the Convio deployment settings</li>
        <li>Can be different per server</li>
        <li>Defaults to the bot's global username if not configured</li>
      </ul>

      <h2 id="server-permissions">Server Permissions</h2>
      <p>
        Discord permissions control what the bot can do in each server. Key permissions:
      </p>
      <ul>
        <li><strong>View Channels:</strong> Required to see and read channel messages</li>
        <li><strong>Send Messages:</strong> Required to respond to users</li>
        <li><strong>Read Message History:</strong> Required to maintain conversation context</li>
        <li><strong>Use Slash Commands:</strong> Required for command-based interactions</li>
        <li><strong>Manage Messages:</strong> Optional — allows the bot to delete its own messages</li>
      </ul>

      <DocCallout variant="warning" icon={Settings} title="Permission changes require re-auth">
        If you change the bot's permissions in Discord, you may need to re-authorize the OAuth2 connection for the changes to take effect in Convio.
      </DocCallout>

      <h2 id="thread-support">Thread Support</h2>
      <p>
        The bot can operate within Discord threads, maintaining separate conversation context per thread. This keeps conversations organized in busy channels.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={DiscordIcon}
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-500"
          title="Discord Gateway & Interactions"
          href="/docs/discord-gateway"
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
