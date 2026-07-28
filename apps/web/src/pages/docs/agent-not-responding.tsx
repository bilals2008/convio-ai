import { AlertTriangle, Bot, Key, Clock, Wifi, RefreshCw, Shield, Server } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AgentNotRespondingPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Troubleshooting', href: '/docs' },
          { label: 'Agent Not Responding' },
        ]}
        title="Agent Not Responding"
        description="Troubleshoot agents that fail to reply — API key issues, rate limits, provider outages, and network problems."
      />

      <h2 id="overview">Overview</h2>
      <p>
        When an agent receives a message but doesn't produce a response, the issue typically involves the AI provider connection. Common causes include invalid API keys, rate limit exhaustion, provider outages, or network connectivity problems.
      </p>

      <h2 id="debug-steps">Debug Steps</h2>
      <p>Follow these steps to identify the root cause:</p>
      <ol>
        <li>Check the <strong>Conversations</strong> page for the conversation — look for error states or stuck messages</li>
        <li>Open <strong>Settings → Provider Keys</strong> and verify the key is valid and active</li>
        <li>Check your provider's status page for reported outages</li>
        <li>Review rate limit usage in <strong>Analytics → Usage</strong></li>
        <li>Test the API key directly with a curl request to confirm connectivity</li>
      </ol>

      <h2 id="api-key-issues">API Key Issues</h2>
      <p>
        Invalid, expired, or misconfigured API keys are the most common cause of agent failures.
      </p>

      <h3 id="key-checklist">Key Checklist</h3>
      <ul>
        <li>The key is pasted correctly with no trailing whitespace or line breaks</li>
        <li>The key hasn't been revoked or rotated at the provider</li>
        <li>The key has sufficient credits or billing is active</li>
        <li>The key is assigned to the correct provider in Convio</li>
        <li>The key is associated with the right organization or project at the provider</li>
      </ul>

      <DocCallout variant="info" icon={Key} title="Test your key directly">
        Use curl to verify the key works outside Convio: <code>curl https://api.openai.com/v1/models -H "Authorization: Bearer YOUR_KEY"</code>. If this fails, the issue is at the provider level.
      </DocCallout>

      <h3 id="key-resolution">Key Resolution</h3>
      <p>
        Convio resolves keys in this order: organization-level provider keys → environment variables. If you've set a key in the dashboard but the agent still fails, check that the key matches the provider your agent is configured to use.
      </p>

      <h2 id="rate-limits">Rate Limits Hit</h2>
      <p>
        Providers enforce rate limits on requests per minute and tokens per minute. When exceeded, the API returns a <code>429</code> status code.
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="Per-Minute Limits"
          description="Most providers cap requests at 60-500 RPM depending on your tier. High-traffic agents can hit these during peak usage."
          href="/docs/rate-limits"
        />
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="Token Limits"
          description="Token-per-minute limits are harder to monitor. Long conversations with large contexts consume tokens quickly."
          href="/docs/rate-limits"
        />
      </DocCardGrid>

      <h3 id="rate-limit-fix">How to Fix</h3>
      <ol>
        <li>Check your current usage in <strong>Analytics → Usage</strong></li>
        <li>Upgrade your provider tier if consistently hitting limits</li>
        <li>Implement shorter system prompts to reduce token consumption per request</li>
        <li>Use conversation truncation for long-running sessions</li>
      </ol>

      <h2 id="provider-outages">Provider Outages</h2>
      <p>
        AI providers experience downtime periodically. When a provider is down, all agents using that provider will fail.
      </p>
      <ul>
        <li>OpenAI: <code>status.openai.com</code></li>
        <li>Anthropic: <code>status.anthropic.com</code></li>
        <li>Google: <code>status.cloud.google.com</code></li>
        <li>Groq: <code>status.groq.com</code></li>
      </ul>

      <DocCallout variant="warning" icon={Server} title="Multi-provider fallback">
        Configure a backup provider in your agent settings. If the primary provider is unreachable, Convio can route requests to the fallback automatically.
      </DocCallout>

      <h2 id="network-issues">Network Issues</h2>
      <p>
        Convio's backend must reach the provider's API. Network problems can prevent this connection.
      </p>
      <ol>
        <li>Check if the provider's API domain is reachable from your server environment</li>
        <li>Verify no firewall rules are blocking outbound HTTPS traffic</li>
        <li>If using a private network or VPN, ensure the provider's IPs are allowed</li>
        <li>Check DNS resolution — the provider's domain must resolve correctly</li>
      </ol>

      <h2 id="timeout-errors">Timeout Errors</h2>
      <p>
        Requests to the provider may time out if the model takes too long to respond. This is common with large context windows or complex prompts.
      </p>
      <ul>
        <li>Reduce the maximum token count in agent settings</li>
        <li>Shorten system prompts to reduce processing time</li>
        <li>Use a faster model for time-sensitive interactions</li>
      </ul>

      <DocCallout variant="destructive" icon={AlertTriangle} title="Persistent failures">
        If the agent fails on every message, the issue is likely configuration-level (wrong key, wrong provider, or a deployment error) rather than transient. Check the deployment logs in <strong>Settings → Deployments</strong>.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Bot}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Supported Providers"
          href="/docs/supported-providers"
        />
        <DocNextStepCard
          icon={RefreshCw}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Provider Keys"
          href="/docs/managing-provider-keys"
        />
      </DocCardGrid>
    </DocContent>
  )
}
