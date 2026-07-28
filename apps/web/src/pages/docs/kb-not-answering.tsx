import { AlertTriangle, FileSearch, Database, Brain, Settings, RefreshCw, Search, Upload } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function KbNotAnsweringPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Troubleshooting', href: '/docs' },
          { label: 'Knowledge Base Not Answering' },
        ]}
        title="Knowledge Base Not Answering"
        description="Fix knowledge base issues — document processing errors, chunking problems, embedding failures, and poor search relevance."
      />

      <h2 id="overview">Overview</h2>
      <p>
        When your agent can't answer questions from your knowledge base, the issue typically involves the document processing pipeline. Documents must be uploaded, processed, chunked, embedded, and indexed before the agent can retrieve them. A failure at any stage prevents answers.
      </p>

      <h2 id="debug-steps">Debug Steps</h2>
      <ol>
        <li>Go to <strong>Knowledge Bases → your KB → Documents</strong> and check the status of each document</li>
        <li>Look for documents stuck in <strong>Processing</strong> or marked <strong>Failed</strong></li>
        <li>Use the <strong>Test Search</strong> feature in the KB settings to verify retrieval</li>
        <li>Check the conversation logs for "no relevant context found" messages</li>
        <li>Review chunk count and embedding status in the KB overview</li>
      </ol>

      <h2 id="processing-errors">Document Processing Errors</h2>
      <p>
        Documents fail during the processing pipeline for several reasons:
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={FileSearch}
          iconBg="bg-red-500/10"
          iconColor="text-red-500"
          title="Unsupported Format"
          description="Only PDF, DOCX, TXT, Markdown, and HTML are supported. Other formats like XLSX or PPTX fail silently."
          href="/docs/supported-documents"
        />
        <DocFeatureCard
          icon={FileSearch}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="Corrupted Files"
          description="Files that are corrupted, password-protected, or have encoding issues cannot be parsed."
          href="/docs/supported-documents"
        />
        <DocFeatureCard
          icon={FileSearch}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-500"
          title="File Too Large"
          description="Files exceeding the size limit for your plan fail to upload. Check the upload size limits in your plan details."
          href="/docs/supported-documents"
        />
        <DocFeatureCard
          icon={FileSearch}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-500"
          title="Processing Timeout"
          description="Very large documents may time out during processing. Split them into smaller files."
          href="/docs/document-processing"
        />
      </DocCardGrid>

      <h3 id="retry-processing">Retry Failed Documents</h3>
      <p>
        For documents marked as Failed, click the retry button in the document list. If retries fail, re-upload the document after fixing the underlying issue.
      </p>

      <h2 id="chunking-issues">Chunking Issues</h2>
      <p>
        After parsing, documents are split into chunks for embedding. Poor chunking leads to missed answers even when the information exists in your documents.
      </p>

      <DocCallout variant="warning" icon={Settings} title="Chunk size matters">
        Default chunk size is 500 tokens with 50-token overlap. If your documents contain long tables or dense technical content, increase the chunk size in KB settings under <strong>Advanced → Chunking</strong>.
      </DocCallout>

      <h3 id="common-chunking-problems">Common Chunking Problems</h3>
      <ul>
        <li><strong>Tables split mid-row:</strong> Increase chunk size or restructure tables in source documents</li>
        <li><strong>Headers separated from content:</strong> Use Markdown headers in your source docs so chunking respects section boundaries</li>
        <li><strong>Context lost between chunks:</strong> Increase the overlap setting to preserve continuity</li>
      </ul>

      <h2 id="embedding-failures">Embedding Failures</h2>
      <p>
        Embedding converts text chunks into vectors for semantic search. If embedding fails, chunks exist but can't be searched.
      </p>
      <ul>
        <li>Verify the embedding API key is configured and valid in <strong>Settings → Provider Keys</strong></li>
        <li>Check that the embedding provider (OpenAI, etc.) is not experiencing an outage</li>
        <li>Review rate limits — embedding large documents in bulk may hit token-per-minute limits</li>
        <li>Ensure the embedding model is compatible with the selected provider</li>
      </ul>

      <h2 id="search-relevance">Search Relevance Problems</h2>
      <p>
        The agent retrieves chunks but the results aren't relevant to the question. This is a retrieval quality issue, not a processing failure.
      </p>

      <h3 id="improve-relevance">How to Improve Relevance</h3>
      <ol>
        <li><strong>Test search queries:</strong> Use the KB test feature with representative questions</li>
        <li><strong>Check chunk quality:</strong> View chunks in the KB dashboard — are they meaningful standalone?</li>
        <li><strong>Adjust similarity threshold:</strong> Lower the threshold in agent settings to return more results</li>
        <li><strong>Add more documents:</strong> Gaps in the KB mean the agent can't answer certain topics</li>
        <li><strong>Re-upload improved documents:</strong> Better source material directly improves retrieval</li>
      </ol>

      <DocCallout variant="info" icon={Search} title="Reranking">
        Enable reranking in your agent settings to reorder search results by relevance. This improves answer quality without changing the underlying search.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Upload}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Uploading Documents"
          href="/docs/uploading-documents"
        />
        <DocNextStepCard
          icon={Brain}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Understanding Chunking"
          href="/docs/understanding-chunking"
        />
      </DocCardGrid>
    </DocContent>
  )
}
