import { Globe, Search, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocFeatureCard } from '@/components/docs'

export default function WebSearchToolPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Web Search Tool' },
        ]}
        title="Web Search Tool"
        description="Let your agents search the internet for real-time information using a built-in search engine."
      />

      <h2 id="how-it-works">How It Works</h2>
      <p>
        The web search tool sends a query to a search engine and returns the top results with titles, URLs, and snippets. The agent uses these results to answer the user's question with current, real-world data.
      </p>
      <ol>
        <li>The model generates a search query based on the user's question</li>
        <li>Convio sends the query to the search API</li>
        <li>Search results (titles, URLs, snippets) are returned</li>
        <li>The model reads the results and formulates a response</li>
      </ol>
      <p>
        The entire process typically completes in under two seconds. The user never sees raw search results — only the agent's synthesized answer.
      </p>

      <h2 id="when-to-use">When to Use Web Search</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={CheckCircle}
          iconBg="bg-success/10"
          iconColor="text-success"
          title="Good Use Cases"
          description="Current events, live data, recent news, product availability, public information not in training data."
          href="#"
        />
        <DocFeatureCard
          icon={AlertTriangle}
          iconBg="bg-warning/10"
iconColor="text-warning"
          title="Avoid When"
          description="Internal company data (use knowledge base), private information, or when the answer is already in the agent's training data."
          href="#"
        />
      </DocCardGrid>

      <h2 id="knowledge-base-vs-search">Knowledge Base vs Web Search</h2>
      <ul>
        <li><strong>Knowledge base:</strong> Persistent, curated data you upload. Best for company policies, product docs, and internal information. Always available, no rate limits.</li>
        <li><strong>Web search:</strong> Live internet queries. Best for real-time data, current events, and information that changes frequently. Subject to rate limits.</li>
      </ul>
      <p>
        Use both together. The knowledge base handles your private data; web search fills in the gaps with live information.
      </p>

      <h2 id="rate-limits">Rate Limits</h2>
      <p>
        By default, each agent can perform <strong>100 web searches per day</strong>. Limits reset at midnight UTC.
      </p>
      <p>
        When a limit is reached, the agent will respond without searching and let the user know it can't perform a live lookup at the moment. The conversation continues normally — the tool is simply skipped for that turn.
      </p>

      <DocCallout variant="tip" icon={Clock} title="Optimize usage">
        If your agent frequently triggers web searches for the same type of query, consider adding that information to the knowledge base instead. This reduces tool usage and gives the agent faster, more reliable answers.
      </DocCallout>

      <h2 id="example-scenarios">Example Scenarios</h2>
      <ul>
        <li><strong>"What's the current price of Bitcoin?"</strong> — the agent searches for live price data</li>
        <li><strong>"Any news about Acme Corp this week?"</strong> — the agent retrieves recent articles</li>
        <li><strong>"Is it raining in Tokyo right now?"</strong> — the agent looks up current weather</li>
        <li><strong>"What are the latest changes to GDPR?"</strong> — the agent finds recent regulatory updates</li>
      </ul>

      <h2 id="enabling">Enabling Web Search</h2>
      <ol>
        <li>Open your agent's settings</li>
        <li>In the <strong>Tools</strong> section, toggle <strong>Web Search</strong> on</li>
        <li>Save the agent</li>
      </ol>
      <p>
        No API key is required — Convio handles the search integration.
      </p>
    </DocContent>
  )
}
