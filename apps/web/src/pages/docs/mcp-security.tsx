import { Shield, Key, Lock, Eye, AlertTriangle, FileCode, Gauge } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid } from '@/components/docs'

export default function McpSecurityPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'MCP Security' },
        ]}
        title="MCP Security Best Practices"
        description="How Convio protects MCP credentials and how to keep your integrations secure."
      />

      <h2 id="overview">How Convio Protects Credentials</h2>
      <p>
        MCP servers can expose powerful tools to your agents. Convio has built-in safeguards on the connection level:
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Lock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Token Encryption at Rest"
          description="When MCP_OAUTH_ENCRYPTION_KEY is set, OAuth tokens are AES-256-GCM encrypted before storage. Without it, dev-only plaintext."
          href="#"
        />
        <DocFeatureCard
          icon={FileCode}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Header Sanitization"
          description="Authorization, Mcp-Session-Id, Content-Type, Host, Content-Length, and Connection cannot be overridden via custom headers."
          href="#"
        />
        <DocFeatureCard
          icon={Gauge}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Rate Limiting"
          description="Authorize and disconnect endpoints are capped at 20 requests/min per IP."
          href="#"
        />
        <DocFeatureCard
          icon={Eye}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Audit Trail"
          description="Authorize, disconnect, and OAuth callback events are logged (mcp_oauth.* actions)."
          href="#"
        />
      </DocCardGrid>

      <h2 id="access-control">Access Control</h2>
      <ul>
        <li><strong>Admin-only writes:</strong> Only organization admins can create, update, or delete MCP servers</li>
        <li><strong>Admin-only OAuth:</strong> Connect/disconnect/re-authorize requires org admin</li>
        <li><strong>Membership reads:</strong> Regular members can view server status</li>
        <li><strong>Per-agent linking:</strong> Attach a server only to agents that need it</li>
        <li><strong>Disabled servers:</strong> Disabling a server removes its tools from agent tool routing</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="Least privilege">
        Attach only the servers each agent actually needs. Use tokens with the minimum required scope — a read-only
        GitHub token instead of an admin one.
      </DocCallout>

      <h2 id="api-key-management">API Key Management</h2>
      <ul>
        <li>Store header-auth keys in the API Key field (never in code)</li>
        <li>Use minimum-scope tokens — don't use admin keys when read-only suffices</li>
        <li>Rotate keys on a schedule; rotate immediately if compromised</li>
        <li>Never commit keys to version control</li>
        <li>Set expiration dates on all tokens</li>
      </ul>

      <h2 id="oauth-considerations">OAuth Considerations</h2>
      <ul>
        <li>Tokens are refreshed automatically; expired tokens surface a <code>lastError</code> in the server status</li>
        <li>Reconnect revokes the current token before re-authorizing</li>
        <li>Disconnect clears stored OAuth state entirely</li>
        <li>Enable <code>MCP_OAUTH_ENCRYPTION_KEY</code> in production to encrypt tokens at rest</li>
      </ul>

      <DocCallout variant="info" icon={Key} title="Encryption key is optional but recommended">
        Without <code>MCP_OAUTH_ENCRYPTION_KEY</code>, tokens are stored as plaintext — fine for local dev, not for
        production. Set the env var to enable AES-256-GCM encryption at rest.
      </DocCallout>

      <h2 id="monitoring">Monitoring</h2>
      <ul>
        <li><strong>OAuth status:</strong> The status column shows authorized / expiry / last error per server</li>
        <li><strong>Error rates:</strong> Spikes may indicate a compromised key or misconfigured server</li>
        <li><strong>Audit trails:</strong> Track connections, disconnects, and re-authorizations</li>
        <li><strong>Usage anomalies:</strong> Unusual tool call patterns warrant investigation</li>
      </ul>

      <h2 id="checklist">Security Checklist</h2>
      <ul>
        <li><code>MCP_OAUTH_ENCRYPTION_KEY</code> set in production</li>
        <li>Header-auth keys use minimum required scope</li>
        <li>Each agent only has servers it needs</li>
        <li>Only admins manage MCP servers</li>
        <li>Connection test passes before linking to agents</li>
        <li>Unused MCP connections removed</li>
      </ul>
    </DocContent>
  )
}