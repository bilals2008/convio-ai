import { AlertTriangle, Server, Webhook, Shield, Clock, RefreshCw, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'
import { WhatsAppIcon, TelegramIcon, DiscordIcon, SlackIcon } from '@/components/docs/brand-icons'

export default function DeploymentErrorsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Troubleshooting', href: '/docs' },
          { label: 'Deployment Connection Errors' },
        ]}
        title="Deployment Connection Errors"
        description="Fix deployment connection issues — webhook failures, platform-specific problems, timeouts, and authentication errors."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Deployment connection errors occur when your agent can't communicate with an external platform. These errors span webhook delivery failures, platform authentication issues, network timeouts, and configuration mismatches.
      </p>

      <h2 id="debug-steps">Debug Steps</h2>
      <ol>
        <li>Go to <strong>Deployments → your deployment → Logs</strong> to view connection attempts</li>
        <li>Check the deployment status indicator — <strong>Connected</strong>, <strong>Reconnecting</strong>, or <strong>Disconnected</strong></li>
        <li>Review webhook delivery logs for failed or timed-out requests</li>
        <li>Test the endpoint URL directly with a curl or browser request</li>
        <li>Verify platform credentials haven't been revoked or expired</li>
      </ol>

      <h2 id="webhook-issues">Webhook Configuration Issues</h2>
      <p>
        Webhooks allow Convio to receive events from external platforms. Misconfiguration prevents event delivery.
      </p>

      <h3 id="webhook-checklist">Webhook Checklist</h3>
      <ul>
        <li>The webhook URL is publicly accessible (not behind a firewall or VPN)</li>
        <li>The URL returns a <code>200</code> status code on GET requests</li>
        <li>SSL/TLS is valid — expired certificates cause connection failures</li>
        <li>The webhook secret is correctly configured and matches the platform's secret</li>
        <li>Content-Type header is set to <code>application/json</code></li>
      </ul>

      <DocCallout variant="warning" icon={Webhook} title="Test your webhook">
        Use the <strong>Test Webhook</strong> button in the deployment settings to send a test event. Check the logs to confirm the endpoint receives and processes it correctly.
      </DocCallout>

      <h3 id="webhook-retry">Webhook Retries</h3>
      <p>
        Failed webhooks are retried up to 3 times with exponential backoff. If all retries fail, the event is logged as failed. Check the retry queue in <strong>Deployments → Logs</strong> to see if events are stuck.
      </p>

      <h2 id="platform-issues">Platform-Specific Problems</h2>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={WhatsAppIcon}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="WhatsApp"
          description="Template rejection, number verification failures, or Meta API rate limits. Most issues resolve after verifying the business phone number."
          href="/docs/whatsapp-integration"
        />
        <DocFeatureCard
          icon={DiscordIcon}
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-500"
          title="Discord"
          description="OAuth2 token expiration, permission scope mismatches, or gateway disconnections. Re-authorize if the bot goes offline."
          href="/docs/discord-integration"
        />
        <DocFeatureCard
          icon={TelegramIcon}
          iconBg="bg-sky-500/10"
          iconColor="text-sky-500"
          title="Telegram"
          description="Webhook registration failures or bot token issues. Verify the webhook URL is accessible from Telegram's servers."
          href="/docs/telegram-integration"
        />
        <DocFeatureCard
          icon={SlackIcon}
          iconBg="bg-violet-500/10"
          iconColor="text-violet-500"
          title="Slack"
          description="Event subscription failures or missing permission scopes. Check the App Manifest for required OAuth scopes."
          href="/docs/slack-integration"
        />
      </DocCardGrid>

      <h2 id="connection-timeouts">Connection Timeouts</h2>
      <p>
        Timeouts occur when the external platform doesn't respond within the expected window.
      </p>
      <ul>
        <li><strong>Webhook delivery timeout:</strong> 30 seconds maximum. If your endpoint takes longer, optimize the response time or return a <code>202</code> immediately and process asynchronously.</li>
        <li><strong>API request timeout:</strong> Convio's outbound requests to platform APIs timeout after 15 seconds. Ensure your platform's API is responsive.</li>
        <li><strong>Gateway reconnect timeout:</strong> For persistent connections (Discord, Telegram), the gateway reconnects after 60 seconds. Extended outages may require manual reconnection.</li>
      </ul>

      <h2 id="auth-failures">Authentication Failures</h2>
      <p>
        Connection errors with <code>401</code> or <code>403</code> status codes indicate authentication problems.
      </p>
      <ol>
        <li>Regenerate the platform token or bot token</li>
        <li>Update the token in <strong>Deployments → Settings → Credentials</strong></li>
        <li>Verify the token has the required permission scopes</li>
        <li>Check if the token has been revoked by the platform</li>
        <li>For OAuth2 connections, re-authorize the app to refresh the access token</li>
      </ol>

      <DocCallout variant="destructive" icon={Shield} title="Token rotation">
        Some platforms automatically rotate tokens. Enable automatic token refresh in deployment settings to prevent unexpected disconnections.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Server}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Deployments"
          href="/docs/managing-deployments"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing Deployments"
          href="/docs/testing-deployments"
        />
      </DocCardGrid>
    </DocContent>
  )
}
