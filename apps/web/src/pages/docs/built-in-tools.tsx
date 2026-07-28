import { Link } from 'react-router-dom'
import { Globe, Calculator, Link2, Clock, ArrowRight, Zap } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function BuiltInToolsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Built-in Tools' },
        ]}
        title="Built-in Tools"
        description="Convio ships with three ready-to-use tools. Toggle them on per agent — no setup required."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Built-in tools are pre-configured functions available to any agent. They require no API keys or external setup. Simply enable them in your agent's settings and the model will use them when appropriate.
      </p>

      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={Globe}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Web Search"
          description="Search the internet for real-time information using a search engine API."
          href="/docs/web-search-tool"
        />
        <DocFeatureCard
          icon={Calculator}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Calculator"
          description="Evaluate mathematical expressions with support for arithmetic, exponents, and parentheses."
          href="/docs/calculator-tool"
        />
        <DocFeatureCard
          icon={Link2}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="URL Fetcher"
          description="Fetch the content of a web page and extract readable text for summarization."
          href="/docs/url-fetcher-tool"
        />
      </DocCardGrid>

      <h2 id="enabling-tools">Enabling Built-in Tools</h2>
      <ol>
        <li>Open your agent's settings page</li>
        <li>Scroll to the <strong>Tools</strong> section</li>
        <li>Toggle on the tools you want the agent to use</li>
        <li>Save the agent</li>
      </ol>
      <p>
        Once enabled, the model will automatically decide when to use each tool based on the user's request. You don't need to instruct it in the system prompt — the model selects tools when they're relevant.
      </p>

      <h2 id="rate-limits">Rate Limits</h2>
      <p>
        Built-in tools have usage limits to prevent abuse and control costs:
      </p>
      <ul>
        <li><strong>Web Search:</strong> 100 searches per agent per day by default</li>
        <li><strong>Calculator:</strong> Unlimited — no rate limits apply</li>
        <li><strong>URL Fetcher:</strong> 50 fetches per agent per day by default</li>
      </ul>
      <p>
        Rate limits reset daily at midnight UTC. If an agent hits a limit, it will respond without the tool and explain that the information is unavailable.
      </p>

      <DocCallout variant="info" icon={Clock} title="Rate limits are configurable">
        Contact support or adjust limits in your organization settings if your use case requires higher throughput.
      </DocCallout>

      <h2 id="tool-results">How Results Are Used</h2>
      <p>
        When a tool returns a result, it's injected into the conversation as system context. The model uses this data to formulate its response. Tool results are not shown to the end user as raw output — the agent summarizes and presents them naturally.
      </p>

      <h2 id="disabling-tools">Disabling Tools</h2>
      <p>
        If you don't want an agent to use a tool, simply toggle it off. The model won't attempt to call disabled tools, even if the user's request seems to require them. In that case, the agent will respond using only its training data and knowledge base.
      </p>

      <DocCallout variant="warning" icon={Zap} title="Knowledge base vs tools">
        A knowledge base gives the agent persistent, curated facts. Tools give it live, external data. Use both together for the best results — knowledge base for your company's information, tools for real-time lookups.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Globe}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Web Search Tool"
          href="/docs/web-search-tool"
        />
        <DocNextStepCard
          icon={Calculator}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Calculator Tool"
          href="/docs/calculator-tool"
        />
      </DocCardGrid>
    </DocContent>
  )
}
