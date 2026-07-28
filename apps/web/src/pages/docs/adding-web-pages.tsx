import { Link } from 'react-router-dom'
import { ArrowRight, Globe, Link2, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AddingWebPagesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Adding Web Pages as Knowledge' },
        ]}
        title="Adding Web Pages as Knowledge"
        description="Turn any public web page into searchable knowledge for your agent."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Instead of downloading content and re-uploading it, you can paste a URL directly into your knowledge base. Convio fetches the page, extracts the meaningful text, and indexes it — no manual copy-paste required.
      </p>

      <h2 id="how-it-works">How URL Ingestion Works</h2>
      <ol>
        <li><strong>Fetch:</strong> Convio sends a request to the URL and retrieves the HTML content.</li>
        <li><strong>Extract:</strong> The main text content is extracted, stripping navigation menus, footers, ads, and boilerplate.</li>
        <li><strong>Clean:</strong> HTML tags are removed, leaving clean, readable text.</li>
        <li><strong>Chunk & Embed:</strong> The extracted text is chunked and embedded just like uploaded documents.</li>
      </ol>

      <h2 id="what-gets-captured">What Gets Captured</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={CheckCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Included"
          description="Main body text, headings, paragraphs, lists, code blocks, table content, and article text."
          href="#"
        />
        <DocFeatureCard
          icon={AlertCircle}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Excluded"
          description="Navigation menus, footers, sidebars, ads, cookie banners, JavaScript-rendered content, and embedded media."
          href="#"
        />
      </DocCardGrid>

      <h2 id="single-page">Single Page vs Sitemap</h2>

      <h3 id="single-page-ingestion">Single Page</h3>
      <p>
        Paste a single URL to ingest just that page. This is the most common approach — ideal for specific documentation pages, blog posts, or FAQ entries.
      </p>

      <h3 id="sitemap-crawling">Sitemap Crawling</h3>
      <p>
        If you paste a URL that points to a sitemap (usually at <code>/sitemap.xml</code>), Convio can crawl all the pages listed in it. This is useful for ingesting an entire documentation site or blog.
      </p>

      <DocCallout variant="tip" icon={Globe} title="Sitemap detection">
        Convio automatically detects sitemap URLs. If the URL ends in <code>.xml</code> or contains "sitemap," it will offer to crawl all linked pages.
      </DocCallout>

      <h2 id="adding-a-url">Adding a URL</h2>
      <ol>
        <li>Open your knowledge base and go to the <strong>Sources</strong> tab</li>
        <li>Click <strong>Add URL</strong></li>
        <li>Paste the URL into the input field</li>
        <li>Click <strong>Add</strong> — Convio fetches and processes the page immediately</li>
      </ol>

      <h2 id="limitations">Limitations</h2>
      <ul>
        <li><strong>Public pages only:</strong> Login-protected, paywalled, or intranet pages cannot be accessed.</li>
        <li><strong>JavaScript-heavy sites:</strong> Pages that rely heavily on client-side rendering may not yield complete content.</li>
        <li><strong>Rate limits:</strong> Convio respects robots.txt and applies rate limiting to avoid overwhelming servers.</li>
        <li><strong>Dynamic content:</strong> Pages that change frequently (live dashboards, real-time feeds) are captured at ingestion time and not automatically updated.</li>
      </ul>

      <DocCallout variant="warning" icon={AlertCircle} title="Content updates">
        Web pages are captured once at ingestion time. If the page content changes, you'll need to re-add the URL or trigger a reprocess to update the knowledge base.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Document Processing"
          href="/docs/document-processing"
        />
        <DocNextStepCard
          icon={Link2}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Knowledge Bases"
          href="/docs/managing-knowledge-bases"
        />
      </DocCardGrid>
    </DocContent>
  )
}
