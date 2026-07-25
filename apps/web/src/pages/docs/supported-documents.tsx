import { Link } from 'react-router-dom'
import { ArrowRight, FileText, FileCode, Table, FileJson, Globe, HardDrive } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function SupportedDocumentsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Supported Document Types' },
        ]}
        title="Supported Document Types"
        description="Convio supports the most common document formats for knowledge base ingestion."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio accepts a range of file formats and URL sources. Each format is processed through a text extraction pipeline that normalizes content into plain text before chunking and embedding.
      </p>

      <h2 id="file-formats">File Formats</h2>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="PDF (.pdf)"
          description="The most common format for documentation, reports, and manuals. Convio extracts text from all pages, including multi-column layouts."
          href="#pdf"
        />
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Plain Text (.txt)"
          description="Simple text files with no formatting. Ideal for raw data, notes, or exported content."
          href="#txt"
        />
        <DocFeatureCard
          icon={FileCode}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Markdown (.md)"
          description="Structured text with headings, lists, and links. Convio preserves heading hierarchy for better chunking."
          href="#markdown"
        />
        <DocFeatureCard
          icon={Table}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="CSV (.csv)"
          description="Tabular data. Each row is treated as a separate chunk, with column headers included for context."
          href="#csv"
        />
        <DocFeatureCard
          icon={FileJson}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="JSON (.json)"
          description="Structured data files. Convio flattens JSON objects into readable text for embedding."
          href="#json"
        />
        <DocFeatureCard
          icon={Globe}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Web Pages (URLs)"
          description="Paste any URL and Convio extracts the visible text content, stripping navigation, ads, and boilerplate."
          href="#urls"
        />
      </DocCardGrid>

      <h2 id="format-specific-tips">Format-Specific Tips</h2>

      <h3 id="pdf">PDF</h3>
      <ul>
        <li>Text-based PDFs work best. Scanned PDFs (images) have limited text extraction.</li>
        <li>For scanned documents, run OCR before uploading or convert to text first.</li>
        <li>PDFs with complex layouts (multi-column, tables) are handled but may lose some structure.</li>
      </ul>

      <h3 id="markdown">Markdown</h3>
      <ul>
        <li>Use heading levels (<code>#</code>, <code>##</code>, <code>###</code>) to define structure — Convio uses headings as natural chunk boundaries.</li>
        <li>Code blocks and tables are included but may not embed as well as prose.</li>
        <li>Links are extracted as text, not followed during ingestion.</li>
      </ul>

      <h3 id="csv">CSV</h3>
      <ul>
        <li>Keep columns consistent across rows for predictable chunking.</li>
        <li>Include a header row — it's prepended to each row's chunk for context.</li>
        <li>Large CSVs (10,000+ rows) may take longer to process.</li>
      </ul>

      <h3 id="json">JSON</h3>
      <ul>
        <li>Flat objects (key-value pairs) embed best. Deeply nested structures are flattened but may lose clarity.</li>
        <li>Arrays of objects are chunked per item.</li>
        <li>Consider converting complex JSON to Markdown for better retrieval quality.</li>
      </ul>

      <h3 id="urls">Web Pages</h3>
      <ul>
        <li>Publicly accessible pages only — login-protected content won't be captured.</li>
        <li>Convio strips navigation, footers, and ads to extract the main content.</li>
        <li>See <Link to="/docs/adding-web-pages" className="text-primary hover:underline">Adding Web Pages</Link> for details on single-page vs sitemap crawling.</li>
      </ul>

      <h2 id="file-limits">File Size Limits</h2>
      <ul>
        <li><strong>Single file:</strong> 50 MB maximum</li>
        <li><strong>Per upload:</strong> Up to 20 files at once</li>
        <li><strong>Per knowledge base:</strong> No hard limit — but more content means longer processing times</li>
      </ul>

      <DocCallout variant="tip" icon={HardDrive} title="Large files">
        For PDFs over 20 MB, consider splitting into chapters or sections. Smaller files process faster and produce more focused chunks.
      </DocCallout>

      <h2 id="encodings">Supported Encodings</h2>
      <p>
        Convio handles UTF-8 encoded files by default. Most modern text editors and export tools produce UTF-8. If your file uses a different encoding (ISO-8859-1, Windows-1252), convert it to UTF-8 before uploading for best results.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Uploading Documents"
          href="/docs/uploading-documents"
        />
        <DocNextStepCard
          icon={Globe}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Adding Web Pages"
          href="/docs/adding-web-pages"
        />
      </DocCardGrid>
    </DocContent>
  )
}
