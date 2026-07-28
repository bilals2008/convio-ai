import { Link } from 'react-router-dom'
import { Wrench, Globe, Calculator, Link2, Puzzle, ArrowRight, Shield } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ToolsOverviewPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Tools Overview' },
        ]}
        title="Tools Overview"
        description="Tools let your agents go beyond conversation — they can search the web, run calculations, fetch URLs, and call your own custom functions."
      />

      <h2 id="what-are-tools">What Are Tools?</h2>
      <p>
        Tools are functions that an AI agent can invoke during a conversation. Instead of relying solely on its training data, an agent with tools can perform real-world actions: looking up live information, computing results, or interacting with external systems.
      </p>
      <p>
        This is known as <strong>function calling</strong> (or tool calling). The AI model decides when a tool would help answer the user's request, generates the correct parameters, and executes the function. The result is fed back into the conversation as context.
      </p>

      <h2 id="how-it-works">How Tool Calling Works</h2>
      <ol>
        <li><strong>User sends a message</strong> — e.g., "What's the weather in London?"</li>
        <li><strong>Model selects a tool</strong> — the model recognizes it needs live data and picks the web search tool</li>
        <li><strong>Model generates parameters</strong> — it produces a structured query like <code>{'{ "query": "weather in London today" }'}</code></li>
        <li><strong>Tool executes</strong> — Convio runs the function and returns the result</li>
        <li><strong>Model responds</strong> — using the tool output, the agent gives an accurate, up-to-date answer</li>
      </ol>
      <p>
        This happens transparently. The user sees a natural conversation; the agent silently orchestrates tool calls behind the scenes.
      </p>

      <h2 id="built-in-vs-custom">Built-in vs Custom Tools</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Wrench}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Built-in Tools"
          description="Ready to use immediately. Includes web search, calculator, and URL fetcher. No configuration required — just toggle them on in agent settings."
          href="/docs/built-in-tools"
        />
        <DocFeatureCard
          icon={Puzzle}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Custom Tools"
          description="Define your own functions using JSON Schema. Connect to internal APIs, databases, or any HTTP endpoint. Full control over parameters and behavior."
          href="/docs/custom-tools"
        />
      </DocCardGrid>

      <h2 id="use-cases">Common Use Cases</h2>
      <ul>
        <li><strong>Real-time information:</strong> Look up current events, stock prices, weather, or live data</li>
        <li><strong>Calculations:</strong> Compute pricing, totals, conversions, or mathematical expressions</li>
        <li><strong>Content retrieval:</strong> Fetch and summarize articles, documentation, or web pages</li>
        <li><strong>Internal systems:</strong> Query your CRM, update records, check inventory, or trigger workflows</li>
        <li><strong>Data validation:</strong> Verify email addresses, check availability, or confirm data against a source</li>
      </ul>

      <DocCallout variant="tip" icon={Shield} title="Tools respect permissions">
        Every tool call goes through Convio's permission system. Agents can only use tools you've explicitly attached, and you control which tools are available per agent.
      </DocCallout>

      <h2 id="mcp">Extending with MCP</h2>
      <p>
        For more advanced integrations, Convio supports the <Link to="/docs/mcp-overview" className="text-primary hover:underline">Model Context Protocol (MCP)</Link>. MCP lets you connect external servers that provide additional tools, turning your agent into a bridge to any system.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Globe}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Built-in Tools"
          href="/docs/built-in-tools"
        />
        <DocNextStepCard
          icon={Puzzle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Custom Tools"
          href="/docs/custom-tools"
        />
      </DocCardGrid>
    </DocContent>
  )
}
