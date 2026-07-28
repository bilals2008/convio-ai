import { AlertTriangle, Shield, Settings, RefreshCw, Wifi, Key } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'
import { DiscordIcon } from '@/components/docs/brand-icons'

export default function DiscordIssuesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Troubleshooting', href: '/docs' },
          { label: 'Discord Integration Issues' },
        ]}
        title="Discord Integration Issues"
        description="Fix Discord bot problems — permission errors, slash commands, gateway disconnects, and token issues."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Discord integrations rely on OAuth2 authentication, bot permissions, gateway connections, and slash command registration. Issues in any of these areas can prevent the bot from responding.
      </p>

      <h2 id="debug-steps">Debug Steps</h2>
      <ol>
        <li>Check the bot's online status in Discord — a red/grey status indicates a connection problem</li>
        <li>Go to <strong>Deployments → Discord → Logs</strong> for connection and error details</li>
        <li>Verify the bot has the required permissions in the server</li>
        <li>Test slash commands by typing <code>/</code> in a channel — if commands don't appear, registration failed</li>
        <li>Check the Discord Developer Portal for the bot's application status</li>
      </ol>

      <h2 id="permission-errors">Permission Errors</h2>
      <p>
        The bot can't send messages, read channels, or perform actions due to missing permissions.
      </p>

      <h3 id="required-permissions">Required Permissions</h3>
      <ul>
        <li><strong>View Channels:</strong> Must be enabled for the bot to see any channel content</li>
        <li><strong>Send Messages:</strong> Required to respond to users</li>
        <li><strong>Read Message History:</strong> Required for conversation context</li>
        <li><strong>Use Slash Commands:</strong> Required for <code>/ask</code>, <code>/help</code>, <code>/reset</code></li>
      </ul>

      <DocCallout variant="warning" icon={Shield} title="Permission hierarchy">
        Discord's role hierarchy matters. The bot's role must be higher than the roles of users it's trying to moderate. In server settings, drag the bot's role above other roles.
      </DocCallout>

      <h3 id="fix-permissions">Fix Permissions</h3>
      <ol>
        <li>Go to Server Settings → Roles → find the bot's role</li>
        <li>Enable all required permissions listed above</li>
        <li>Check channel-specific overrides — a channel with "Deny Send Messages" overrides the role</li>
        <li>Re-authorize the OAuth2 connection in Convio to apply changes</li>
      </ol>

      <h2 id="slash-commands-not-showing">Slash Commands Not Showing</h2>
      <p>
        Slash commands are registered globally or per-server. If they don't appear when typing <code>/</code>, the registration failed or hasn't propagated.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={DiscordIcon}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="Propagation Delay"
          description="Global slash command registration can take up to 1 hour to propagate across all Discord servers. Per-server commands propagate faster."
          href="/docs/discord-integration"
        />
        <DocFeatureCard
          icon={DiscordIcon}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="Scope Mismatch"
          description="Commands registered for a specific server won't appear in other servers. Ensure the deployment targets the correct server."
          href="/docs/discord-integration"
        />
      </DocCardGrid>

      <h3 id="re-register-commands">Re-register Commands</h3>
      <p>
        If commands don't appear after 1 hour, go to <strong>Deployments → Discord → Slash Commands</strong> and click <strong>Re-register</strong>. This forces a fresh registration with Discord's API.
      </p>

      <h2 id="gateway-disconnects">Gateway Disconnects</h2>
      <p>
        The bot goes offline periodically or fails to reconnect after Discord performs maintenance.
      </p>
      <ul>
        <li><strong>Normal behavior:</strong> Discord sends a heartbeat every 41.25 seconds. Brief disconnects during heartbeat are normal and the bot reconnects automatically.</li>
        <li><strong>Extended outage:</strong> If the bot stays offline for more than 5 minutes, the gateway connection may have failed permanently.</li>
        <li><strong>Rate limiting:</strong> Too many reconnection attempts can cause the bot to be rate-limited by Discord.</li>
      </ul>

      <DocCallout variant="info" icon={Wifi} title="Gateway reconnect">
        Convio automatically reconnects to the Discord gateway. If the bot stays offline, try manually reconnecting from the deployment settings. Check Discord's status page for platform-wide issues.
      </DocCallout>

      <h2 id="bot-token-issues">Bot Token Issues</h2>
      <p>
        The bot token is used for API authentication. If the token is invalid or compromised, the bot can't connect.
      </p>

      <h3 id="token-checklist">Token Checklist</h3>
      <ul>
        <li>The token hasn't been regenerated in the Discord Developer Portal</li>
        <li>The token is pasted correctly with no extra spaces</li>
        <li>The bot application hasn't been deleted or disabled</li>
        <li>The bot is not in more than 100 servers (Discord's limit for unverified bots)</li>
      </ul>

      <DocCallout variant="destructive" icon={Key} title="Token compromise">
        If your bot token is exposed (e.g., committed to a public repo), regenerate it immediately in the Discord Developer Portal. Update the new token in Convio deployment settings.
      </DocCallout>

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
          icon={Bot}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing Deployments"
          href="/docs/testing-deployments"
        />
      </DocCardGrid>
    </DocContent>
  )
}
