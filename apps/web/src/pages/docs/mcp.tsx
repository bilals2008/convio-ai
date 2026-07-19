import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

export default function McpPage() {
  return (
    <div>
      <DocHeading as="h1">MCP Integration</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        Connect Convio agents to external tools and data sources via Model Context Protocol (MCP).
      </p>

      <DocHeading>Overview</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        MCP (Model Context Protocol) is an open protocol that standardizes how AI agents connect to external tools. Instead of building custom integrations for each tool, MCP provides a unified interface. Convio agents can use MCP to interact with browsers, GitHub, Notion, and more.
      </p>

      <DocHeading>Available MCP Agents</DocHeading>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>Browser MCP Agent</strong> — Drive a real browser with natural language</li>
        <li><strong>GitHub MCP Agent</strong> — Explore and analyze repos in plain English</li>
        <li><strong>Notion MCP Agent</strong> — Talk to Notion pages from terminal</li>
        <li><strong>Multi-MCP Agent Router</strong> — Route to different MCP servers based on task</li>
      </ul>

      <DocHeading>Integration Approach</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Add MCP as a new tool type in Convio's tool system. The existing Tool model can be extended to support MCP servers. Create an MCP client service that connects to MCP servers and exposes their functionality as agent tools.
      </p>

      <div className="flex gap-3">
        <Link to="/docs/voice">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: Voice AI
          </Button>
        </Link>
        <Link to="/docs/generative-ui">
          <Button size="sm">
            Next: Generative UI
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
