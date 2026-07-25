import { Database, FileText, RefreshCw, Copy, Layers, Search, Lightbulb, AlertTriangle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function KBBestPracticesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Best Practices', href: '/docs' },
          { label: 'Knowledge Base Best Practices' },
        ]}
        title="Knowledge Base Best Practices"
        description="Structure and maintain your knowledge base for accurate, relevant retrieval across every conversation."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Your knowledge base determines what your agent knows. Well-structured content produces accurate answers; poorly organized content leads to irrelevant retrieval, hallucinations, and frustrated users. These guidelines help you build a knowledge base that your agent can search reliably.
      </p>

      <h2 id="document-structure">Document Structure</h2>
      <p>
        How you structure documents directly impacts retrieval quality. Each document should be a self-contained unit covering one topic:
      </p>
      <ul>
        <li><strong>One topic per document:</strong> Don't combine unrelated content. A document about billing and a document about API limits should be separate.</li>
        <li><strong>Clear headings:</strong> Use descriptive headings that reflect the content. "Shipping Policy for International Orders" is better than "Shipping Info."</li>
        <li><strong>Concise paragraphs:</strong> Short paragraphs are easier for the model to cite. Keep paragraphs under 100 words when possible.</li>
        <li><strong>Include context:</strong> Don't assume the reader has background knowledge. Define terms and reference related topics.</li>
      </ul>

      <DocCallout variant="tip" icon={Lightbulb} title="The inverted pyramid">
        Put the most important information first in each document. Models give more weight to content near the beginning, and retrievers sometimes truncate long passages.
      </DocCallout>

      <h2 id="chunk-sizes">Optimal Chunk Sizes</h2>
      <p>
        Convio chunks your documents for vector indexing. The chunk size affects retrieval granularity:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Chunk Size</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Best For</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Trade-offs</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Small (200–400 tokens)</td>
              <td className="py-2 pr-4">FAQs, product specs, short procedures</td>
              <td className="py-2">Precise retrieval, but may miss broader context.</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Medium (400–800 tokens)</td>
              <td className="py-2 pr-4">How-to guides, policy documents, explanations</td>
              <td className="py-2">Balanced context and precision.</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Large (800–1200 tokens)</td>
              <td className="py-2 pr-4">Technical references, detailed tutorials</td>
              <td className="py-2">Rich context, but may include irrelevant information.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p>
        Convio's default chunking works well for most content. Only adjust if you have specific retrieval patterns — for example, if your agent frequently returns overly long or overly short answers.
      </p>

      <h2 id="content-organization">Content Organization</h2>
      <p>
        Organize your knowledge base into logical groups that align with your agent's responsibilities:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="By Topic"
          description="Group documents by subject: product features, billing, technical support, policies. Useful for agents with clear domain boundaries."
          href="#"
        />
        <DocFeatureCard
          icon={Layers}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="By Audience"
          description="Separate content for different user types: new customers, power users, admins. Each audience sees only relevant information."
          href="#"
        />
        <DocFeatureCard
          icon={Search}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="By Channel"
          description="Create channel-specific knowledge bases when responses need to differ by platform — shorter for WhatsApp, detailed for web."
          href="#"
        />
        <DocFeatureCard
          icon={Database}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="By Freshness"
          description="Keep time-sensitive content (pricing, features, policies) in separate, frequently updated documents."
          href="#"
        />
      </DocCardGrid>

      <h2 id="updating">Updating Knowledge</h2>
      <p>
        Outdated information is worse than no information. Establish a regular update cadence:
      </p>
      <ul>
        <li><strong>Schedule reviews:</strong> Audit your knowledge base monthly. Remove stale content, update changed information.</li>
        <li><strong>Version documents:</strong> When policies change, update the existing document rather than creating a new one. This preserves retrieval history.</li>
        <li><strong>Track what's used:</strong> Use Convio's analytics to see which documents are retrieved most often. Prioritize accuracy for high-traffic content.</li>
        <li><strong>Remove duplicates:</strong> Duplicate or overlapping content confuses retrieval. Merge similar documents and set up redirects.</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="Avoid duplicate content">
        When two documents cover the same topic with slightly different wording, the model may pull both and produce contradictory answers. Consolidate into a single authoritative source.
      </DocCallout>

      <h2 id="quality-checklist">Quality Checklist</h2>
      <p>
        Before adding content to your knowledge base, verify:
      </p>
      <ol>
        <li>Each document covers exactly one topic.</li>
        <li>Headings are descriptive and specific.</li>
        <li>Content is factually accurate and up to date.</li>
        <li>No duplicate or overlapping content exists.</li>
        <li>Important information appears near the top of each document.</li>
        <li>Technical terms are defined or explained in context.</li>
      </ol>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Database}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Creating a Knowledge Base"
          href="/docs/creating-knowledge-base"
        />
        <DocNextStepCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Document Processing"
          href="/docs/document-processing"
        />
      </DocCardGrid>
    </DocContent>
  )
}
