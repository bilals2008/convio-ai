import { Shield, Key, Lock, Eye, AlertTriangle } from 'lucide-react'
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
        description="Protect your MCP integrations with proper credential management, access control, and monitoring."
      />

      <h2 id="overview">Why Security Matters</h2>
      <p>
        MCP servers expose external tools to your agents. Without proper security, a misconfigured MCP connection could leak credentials, expose sensitive data, or give agents unintended access to systems. Follow these practices to keep your integrations secure.
      </p>

      <h2 id="api-key-management">API Key Management</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Key}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Use Environment Variables"
          description="Never hardcode API keys in MCP configuration. Store them in environment variables or a secrets manager."
          href="#"
        />
        <DocFeatureCard
          icon={Lock}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Rotate Keys Regularly"
          description="Rotate API keys on a schedule. If a key is compromised, rotate immediately and audit usage logs."
          href="#"
        />
      </DocCardGrid>

      <h3 id="key-practices">Key Practices</h3>
      <ul>
        <li>Store keys in environment variables, not configuration files</li>
        <li>Use a secrets manager (HashiCorp Vault, AWS Secrets Manager) for production</li>
        <li>Never commit keys to version control</li>
        <li>Use the minimum scope required — don't use admin keys when read-only suffices</li>
        <li>Set expiration dates on all API keys</li>
      </ul>

      <h2 id="access-control">Access Control</h2>
      <p>
        Limit what each MCP connection and agent can do:
      </p>
      <ul>
        <li><strong>Per-agent tool selection:</strong> Only enable tools the agent actually needs</li>
        <li><strong>Per-server scope:</strong> Use MCP servers with limited permissions — a read-only database server, not an admin connection</li>
        <li><strong>Network restrictions:</strong> Run STDIO servers locally; use firewalls for remote SSE/HTTP servers</li>
        <li><strong>Rate limiting:</strong> Configure rate limits on MCP servers to prevent abuse</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="Principle of least privilege">
        An agent that summarizes support tickets doesn't need write access to your database. An agent that answers FAQ questions doesn't need access to your billing system. Scope every MCP tool to the minimum required.
      </DocCallout>

      <h2 id="sandboxing">Sandboxing</h2>
      <p>
        For maximum isolation, run MCP servers in sandboxed environments:
      </p>
      <ul>
        <li><strong>Container isolation:</strong> Run each MCP server in its own Docker container with minimal permissions</li>
        <li><strong>Process isolation:</strong> Use separate system users for different MCP servers</li>
        <li><strong>Network isolation:</strong> Restrict which hosts each MCP server can reach</li>
        <li><strong>Filesystem isolation:</strong> Mount only necessary directories; use read-only mounts where possible</li>
      </ul>

      <h2 id="monitoring">Monitoring</h2>
      <p>
        Monitor MCP activity to detect issues early:
      </p>
      <ul>
        <li><strong>Tool call logs:</strong> Track which tools are called, when, and with what parameters</li>
        <li><strong>Error rates:</strong> Spike in errors may indicate a compromised key or misconfigured server</li>
        <li><strong>Usage anomalies:</strong> Unusual tool call patterns warrant investigation</li>
        <li><strong>Audit trails:</strong> Keep logs of all MCP connections, key rotations, and permission changes</li>
      </ul>

      <DocCallout variant="info" icon={Eye} title="Review regularly">
        Periodically review your MCP connections. Remove unused servers, rotate stale keys, and verify that each connection still has appropriate permissions.
      </DocCallout>

      <h2 id="checklist">Security Checklist</h2>
      <ul>
        <li>API keys stored in environment variables or secrets manager</li>
        <li>Keys use minimum required scope</li>
        <li>Each agent only has tools it needs</li>
        <li>MCP servers run with limited network and filesystem access</li>
        <li>Connection test passes before linking to agents</li>
        <li>Monitoring and logging enabled</li>
        <li>Key rotation schedule established</li>
        <li>Unused MCP connections removed</li>
      </ul>
    </DocContent>
  )
}
