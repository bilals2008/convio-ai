import { Link } from 'react-router-dom'
import { Network, Server, ArrowRight, Puzzle, Globe } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function McpOverviewPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'MCP Overview' },
        ]}
        title="What is MCP?"
        description="The Model Context Protocol connects your agents to external tool servers — unlocking integrations beyond what built-in and custom tools provide."
      />

      <h2 id="what-is-mcp">Model Context Protocol Explained</h2>
      <p>
        MCP (Model Context Protocol) is an open standard that lets AI models discover and use tools hosted on external servers. Instead of defining tools inside Convio, you connect to a running MCP server that provides its own set of tools.
      </p>
      <p>
        Think of it as a universal adapter. An MCP server exposes tools in a standardized format, and Convio connects to it — giving your agents access to any capability the server offers, without you writing tool definitions manually.
      </p>

      <h2 id="why-mcp">Why MCP Matters</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Puzzle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Ecosystem"
          description="Tap into a growing ecosystem of MCP servers for databases, APIs, file systems, and more — built by the community."
          href="#"
        />
        <DocFeatureCard
          icon={Server}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Separation of Concerns"
          description="Tool logic lives on the MCP server, not in your agent config. Update the server without touching Convio."
          href="#"
        />
      </DocCardGrid>

      <h2 id="mcp-vs-custom">MCP vs Built-in vs Custom Tools</h2>
      <ul>
        <li><strong>Built-in tools:</strong> Pre-configured, zero setup. Limited to Convio's three tools.</li>
        <li><strong>Custom tools:</strong> Your own JSON Schema definitions pointing at HTTP endpoints. Full control but you manage the schema.</li>
        <li><strong>MCP:</strong> Connect to external servers that provide pre-built tool sets. The server handles the schema — you just connect and select which tools to expose.</li>
      </ul>

      <h2 id="use-cases">Use Cases</h2>
      <ul>
        <li><strong>Database queries:</strong> Connect a database MCP server to let agents read from or write to your data store</li>
        <li><strong>File system access:</strong> Read, write, and search files on a server through an MCP file system tool</li>
        <li><strong>API integrations:</strong> Use community MCP servers for Slack, GitHub, Jira, or other services</li>
        <li><strong>Custom workflows:</strong> Build your own MCP server exposing internal tools and services</li>
        <li><strong>Multi-tool orchestration:</strong> A single MCP server can expose dozens of related tools under one connection</li>
      </ul>

      <DocCallout variant="info" icon={Globe} title="MCP is optional">
        MCP is an advanced feature. If built-in tools and custom tools cover your needs, you don't need MCP. Add it when you need to integrate with external systems that already have MCP servers, or when you want to build a reusable tool server.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Network}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="MCP Server Types"
          href="/docs/mcp-server-types"
        />
        <DocNextStepCard
          icon={Server}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Connecting an MCP Server"
          href="/docs/connecting-mcp-server"
        />
      </DocCardGrid>
    </DocContent>
  )
}
