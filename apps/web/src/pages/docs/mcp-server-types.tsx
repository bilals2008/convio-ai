import { Cable, Globe, ArrowRight, ShieldCheck } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function McpServerTypesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'MCP Server Types' },
        ]}
        title="MCP Server Types"
        description="Convio supports two transport types for MCP servers. Pick based on where the server runs."
      />

      <h2 id="overview">Transport Types</h2>
      <p>
        MCP servers communicate with Convio through a transport layer. The transport determines how tool calls and
        responses are exchanged. Convio supports two types — <strong>STDIO</strong> (local) and{' '}
        <strong>Streamable HTTP</strong> (remote).
      </p>

      <h2 id="stdio">STDIO — Local Process</h2>
      <DocCardGrid columns={1}>
        <DocFeatureCard
          icon={Cable}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Standard Input/Output"
          description="Run the MCP server as a local process. Communication happens through stdin/stdout pipes — no network required."
          href="#"
        />
      </DocCardGrid>
      <ul>
        <li><strong>How it works:</strong> Convio spawns the server as a child process and communicates via stdin/stdout</li>
        <li><strong>Best for:</strong> Local development, single-user setups, tools that need filesystem access</li>
        <li><strong>Requirements:</strong> The command (e.g. <code>npx</code>) must be installed on the machine running Convio</li>
        <li><strong>Auth:</strong> Not applicable — no network, so no tokens</li>
      </ul>

      <h2 id="streamable-http">Streamable HTTP</h2>
      <DocCardGrid columns={1}>
        <DocFeatureCard
          icon={Globe}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Streamable HTTP"
          description="The modern HTTP transport for MCP. Connect to hosted tool servers over HTTPS with streaming support."
          href="#"
        />
      </DocCardGrid>
      <ul>
        <li><strong>How it works:</strong> Standard HTTP(S) requests with streaming responses</li>
        <li><strong>Best for:</strong> Hosted servers (Notion, GitHub, Linear, Slack), team-shared tool servers, production</li>
        <li><strong>Requirements:</strong> A reachable HTTPS endpoint</li>
        <li><strong>Auth:</strong> <code>None</code>, <code>Header</code> (bearer token), or <code>OAuth 2.0</code> (PKCE flow)</li>
      </ul>

      <DocCallout variant="info" icon={ShieldCheck} title="Auth modes">
        Header auth sends <code>Authorization: Bearer &lt;key&gt;</code>. OAuth runs a full authorization-code flow with
        PKCE — tokens are stored encrypted when an encryption key is configured.
      </DocCallout>

      <h2 id="comparison">Which to Use When</h2>
      <ul>
        <li><strong>Local / filesystem tools:</strong> STDIO</li>
        <li><strong>Hosted services (Notion, GitHub, Slack):</strong> Streamable HTTP + OAuth</li>
        <li><strong>Internal APIs with a static key:</strong> Streamable HTTP + Header</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Globe}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Connecting an MCP Server"
          href="/docs/connecting-mcp-server"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Linking MCP to Agents"
          href="/docs/linking-mcp-agents"
        />
      </DocCardGrid>
    </DocContent>
  )
}