import { Cable, Wifi, Globe, ArrowRight } from 'lucide-react'
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
        description="Convio supports three transport types for connecting to MCP servers. Choose based on your infrastructure."
      />

      <h2 id="overview">Transport Types</h2>
      <p>
        MCP servers communicate with Convio through a transport layer. The transport determines how tool calls and responses are exchanged. Convio supports three options.
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
        <li><strong>How it works:</strong> Convio spawns the MCP server as a child process and communicates via stdin/stdout</li>
        <li><strong>Best for:</strong> Local development, single-user setups, tools that need filesystem access</li>
        <li><strong>Requirements:</strong> The server binary must be accessible on the machine running Convio</li>
        <li><strong>Latency:</strong> Near-zero — no network overhead</li>
      </ul>

      <DocCallout variant="tip" icon={Cable} title="Use STDIO for development">
        STDIO is the simplest option for testing and development. No ports to configure, no firewalls to worry about. The server runs as a local process alongside Convio.
      </DocCallout>

      <h2 id="sse">SSE — Server-Sent Events</h2>
      <DocCardGrid columns={1}>
        <DocFeatureCard
          icon={Wifi}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Server-Sent Events"
          description="Connect to a remote MCP server over HTTP. The server streams responses back using Server-Sent Events."
          href="#"
        />
      </DocCardGrid>
      <ul>
        <li><strong>How it works:</strong> Convio sends requests via HTTP POST and receives responses as an SSE stream</li>
        <li><strong>Best for:</strong> Remote servers, team-shared tool servers, cloud-hosted MCP instances</li>
        <li><strong>Requirements:</strong> A reachable HTTP endpoint with SSE support</li>
        <li><strong>Latency:</strong> Depends on network distance — typically 50-200ms</li>
      </ul>

      <h2 id="streamable-http">Streamable HTTP</h2>
      <DocCardGrid columns={1}>
        <DocFeatureCard
          icon={Globe}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Streamable HTTP"
          description="The modern HTTP transport for MCP. Combines the simplicity of HTTP with streaming support for large responses."
          href="#"
        />
      </DocCardGrid>
      <ul>
        <li><strong>How it works:</strong> Standard HTTP requests with optional streaming via chunked transfer encoding</li>
        <li><strong>Best for:</strong> Production deployments, serverless environments, load-balanced setups</li>
        <li><strong>Requirements:</strong> HTTP endpoint supporting chunked responses</li>
        <li><strong>Latency:</strong> Similar to SSE, with better compatibility for proxies and CDNs</li>
      </ul>

      <h2 id="comparison">Which to Use When</h2>
      <ul>
        <li><strong>Local development:</strong> STDIO — zero config, instant feedback</li>
        <li><strong>Team sharing a tool server:</strong> SSE — simple remote connection</li>
        <li><strong>Production / cloud:</strong> Streamable HTTP — robust, proxy-friendly</li>
        <li><strong>Behind a corporate proxy:</strong> Streamable HTTP — standard HTTP traffic, no special headers</li>
      </ul>

      <DocCallout variant="info" icon={Globe} title="Start with SSE">
        If you're unsure, start with SSE. It works for most use cases and is easier to debug than STDIO. Switch to Streamable HTTP when you need production hardening.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Cable}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Connecting an MCP Server"
          href="/docs/connecting-mcp-server"
        />
        <DocNextStepCard
          icon={Wifi}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Linking MCP to Agents"
          href="/docs/linking-mcp-agents"
        />
      </DocCardGrid>
    </DocContent>
  )
}
