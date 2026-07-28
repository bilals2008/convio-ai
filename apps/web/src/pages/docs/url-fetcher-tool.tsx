import { Link2, FileText, Clock, AlertTriangle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocFeatureCard } from '@/components/docs'

export default function UrlFetcherToolPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'URL Fetcher Tool' },
        ]}
        title="URL Fetcher Tool"
        description="Fetch web pages and extract their content so agents can read, summarize, and discuss any public URL."
      />

      <h2 id="how-it-works">How It Works</h2>
      <p>
        The URL fetcher retrieves the HTML content of a given URL, strips out non-essential elements (navigation, ads, scripts), and extracts readable text. The agent receives the cleaned content and can summarize, quote, or answer questions about it.
      </p>
      <ol>
        <li>The user provides a URL or asks about a specific page</li>
        <li>The model generates a fetch request for that URL</li>
        <li>Convio downloads the page and extracts the main content</li>
        <li>The cleaned text is passed to the model as context</li>
        <li>The agent responds using the extracted information</li>
      </ol>

      <h2 id="content-extraction">Content Extraction</h2>
      <p>
        The fetcher intelligently extracts the meaningful content from a page:
      </p>
      <ul>
        <li><strong>Removes:</strong> Navigation menus, sidebars, ads, footers, scripts, stylesheets</li>
        <li><strong>Preserves:</strong> Article text, headings, paragraphs, lists, code blocks</li>
        <li><strong>Handles:</strong> JavaScript-rendered pages, paywall-free articles, documentation sites</li>
      </ul>
      <p>
        Extracted content is truncated to a reasonable limit (approximately 10,000 tokens) to stay within model context windows. For very long pages, the most relevant content is prioritized.
      </p>

      <h2 id="summarization">Summarization</h2>
      <p>
        The agent can summarize fetched content in multiple ways:
      </p>
      <ul>
        <li><strong>Brief summary:</strong> Key points in 2-3 sentences</li>
        <li><strong>Detailed summary:</strong> Comprehensive overview with main sections</li>
        <li><strong>Specific answers:</strong> "What does this article say about X?"</li>
        <li><strong>Quote extraction:</strong> Pull specific passages or data points</li>
      </ul>

      <h2 id="use-cases">Use Cases</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Article Summarization"
          description="Provide a URL and get a concise summary without reading the full article."
          href="#"
        />
        <DocFeatureCard
          icon={Link2}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Documentation Lookup"
          description="Point the agent at documentation URLs to answer technical questions."
          href="#"
        />
      </DocCardGrid>

      <h2 id="additional-use-cases">Additional Scenarios</h2>
      <ul>
        <li><strong>Product research:</strong> "Summarize the reviews on this product page"</li>
        <li><strong>Competitor analysis:</strong> "What pricing does this competitor list?"</li>
        <li><strong>News reading:</strong> "Read this article and tell me the key takeaways"</li>
        <li><strong>Legal/policy review:</strong> "What are the main points of this terms of service?"</li>
      </ul>

      <h2 id="rate-limits">Rate Limits</h2>
      <p>
        Each agent can fetch up to <strong>50 URLs per day</strong>. Limits reset at midnight UTC. When a limit is reached, the agent will explain it can't fetch the page and suggest alternatives.
      </p>

      <DocCallout variant="warning" icon={AlertTriangle} title="Respect robots.txt">
        The URL fetcher respects <code>robots.txt</code> directives. Some sites may block automated access. If a fetch fails, the agent will let the user know.
      </DocCallout>

      <h2 id="enabling">Enabling the URL Fetcher</h2>
      <ol>
        <li>Open your agent's settings</li>
        <li>In the <strong>Tools</strong> section, toggle <strong>URL Fetcher</strong> on</li>
        <li>Save the agent</li>
      </ol>
    </DocContent>
  )
}
