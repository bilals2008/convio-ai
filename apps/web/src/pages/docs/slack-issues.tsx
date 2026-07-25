import { AlertTriangle, Shield, Settings, RefreshCw, Key, Webhook, Lock } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'
import { SlackIcon } from '@/components/docs/brand-icons'

export default function SlackIssuesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Troubleshooting', href: '/docs' },
          { label: 'Slack Integration Issues' },
        ]}
        title="Slack Integration Issues"
        description="Fix Slack integration problems — event subscriptions, token expiration, permission scopes, and app manifest errors."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Slack integrations use OAuth2 tokens, event subscriptions, and permission scopes. Issues typically involve failed event delivery, expired tokens, missing permissions, or app configuration problems.
      </p>

      <h2 id="debug-steps">Debug Steps</h2>
      <ol>
        <li>Check the deployment status in <strong>Deployments → Slack → Status</strong></li>
        <li>Go to <strong>Slack App Settings → Event Subscriptions</strong> to verify the webhook URL is verified</li>
        <li>Review the deployment logs for API errors or authentication failures</li>
        <li>Test the bot by mentioning it in a channel or sending a direct message</li>
        <li>Check the Slack API response codes in the deployment logs</li>
      </ol>

      <h2 id="event-subscription-failures">Event Subscription Failures</h2>
      <p>
        Slack sends events to your app via HTTP POST. If event subscriptions fail, the bot can't receive messages.
      </p>

      <h3 id="webhook-verification">Webhook URL Verification</h3>
      <p>
        Slack verifies the webhook URL when you first configure it. The endpoint must:
      </p>
      <ul>
        <li>Respond with the <code>challenge</code> value from Slack's verification request</li>
        <li>Return a <code>200</code> status code within 3 seconds</li>
        <li>Be publicly accessible over HTTPS</li>
        <li>Use a valid SSL certificate</li>
      </ul>

      <DocCallout variant="warning" icon={Webhook} title="Verification challenge">
        When Slack sends a URL verification request, it includes a <code>challenge</code> token. Your endpoint must echo this token back in the response body. Convio handles this automatically for standard Slack deployments.
      </DocCallout>

      <h3 id="event-types">Required Event Types</h3>
      <p>
        Ensure these events are subscribed in the Slack App settings:
      </p>
      <ul>
        <li><code>message.im</code> — Direct messages to the bot</li>
        <li><code>message.channels</code> — Messages in channels the bot is in</li>
        <li><code>message.groups</code> — Messages in private channels</li>
        <li><code>app_mention</code> — When the bot is @mentioned</li>
      </ul>

      <h2 id="token-expiration">Token Expiration</h2>
      <p>
        Slack OAuth2 tokens can expire or be revoked, breaking the connection.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Key}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="Bot Token Revoked"
          description="The bot token is revoked if the app is uninstalled from the workspace or the admin rotates tokens. Re-authorize in Convio."
          href="/docs/slack-integration"
        />
        <DocFeatureCard
          icon={Key}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="OAuth Token Expired"
          description="Slack tokens don't expire by default, but workspace admins can set token expiration policies. Check with your admin."
          href="/docs/slack-integration"
        />
      </DocCardGrid>

      <h3 id="refresh-token">Refresh the Token</h3>
      <ol>
        <li>Go to <strong>Deployments → Slack → Credentials</strong></li>
        <li>Click <strong>Re-authorize with Slack</strong></li>
        <li>Complete the OAuth flow in the browser</li>
        <li>Verify the deployment status changes to Connected</li>
      </ol>

      <h2 id="permission-scopes">Permission Scopes</h2>
      <p>
        Slack apps require specific OAuth scopes to function. Missing scopes cause permission errors.
      </p>

      <h3 id="required-scopes">Required Scopes</h3>
      <ul>
        <li><code>chat:write</code> — Send messages</li>
        <li><code>channels:history</code> — Read messages in public channels</li>
        <li><code>groups:history</code> — Read messages in private channels</li>
        <li><code>im:history</code> — Read direct messages</li>
        <li><code>app_mentions:read</code> — Read @mentions</li>
      </ul>

      <DocCallout variant="info" icon={Lock} title="Adding scopes">
        New scopes must be added in the Slack App settings, then the app must be re-installed to the workspace for the changes to take effect. Go to <strong>OAuth & Permissions → Scopes</strong> to add missing scopes.
      </DocCallout>

      <h2 id="app-manifest-errors">App Manifest Errors</h2>
      <p>
        Slack's app manifest defines your app's configuration. Errors in the manifest prevent the app from being installed.
      </p>
      <ul>
        <li><strong>Duplicate event subscriptions:</strong> Each event type can only be listed once</li>
        <li><strong>Invalid redirect URLs:</strong> The OAuth redirect URL must match exactly what's configured in Convio</li>
        <li><strong>Scope conflicts:</strong> Some scopes require admin approval and can't be added without workspace admin action</li>
        <li><strong>Misconfigured features:</strong> Bot User, Event Subscriptions, and Interactivity must all be enabled if used</li>
      </ul>

      <DocCallout variant="destructive" icon={AlertTriangle} title="App not found">
        If the app can't be installed, check that the app is published or available for installation in the workspace. Unlisted apps can only be installed by workspace admins.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={SlackIcon}
          iconBg="bg-violet-500/10"
          iconColor="text-violet-500"
          title="Slack Integration Setup"
          href="/docs/slack-integration"
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
