import { Link } from 'react-router-dom'
import { ArrowRight, Clock, CheckCircle, AlertCircle, Loader, RefreshCw } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function DocumentStatusesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Document Statuses' },
        ]}
        title="Document Statuses"
        description="Understand what each document status means and how to troubleshoot processing errors."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Every document in your knowledge base has a status that indicates where it is in the processing pipeline. Understanding these statuses helps you track progress and diagnose issues.
      </p>

      <h2 id="statuses">Status Reference</h2>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Pending"
          description="The document is in the processing queue. Convio hasn't started extracting text yet. This usually resolves within seconds."
          href="#pending"
        />
        <DocFeatureCard
          icon={Loader}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Processing"
          description="Text extraction, chunking, and embedding generation are in progress. Progress percentage is displayed for large files."
          href="#processing"
        />
        <DocFeatureCard
          icon={CheckCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Ready"
          description="The document is fully indexed. Its content is searchable and the agent can retrieve it during conversations."
          href="#ready"
        />
        <DocFeatureCard
          icon={AlertCircle}
          iconBg="bg-destructive/10"
          iconColor="text-destructive"
          title="Error"
          description="Processing failed. The error message explains what went wrong. Common causes are listed below."
          href="#error"
        />
      </DocCardGrid>

      <h2 id="pending">Pending</h2>
      <p>
        The document has been uploaded but hasn't entered the processing pipeline yet. This is normal — Convio processes documents in the order they're received.
      </p>
      <ul>
        <li>Usually resolves within a few seconds</li>
        <li>During high load, may take longer</li>
        <li>No action needed — just wait</li>
      </ul>

      <h2 id="processing">Processing</h2>
      <p>
        The document is actively being processed. The progress indicator shows how far along it is through the pipeline (text extraction → chunking → embedding).
      </p>
      <ul>
        <li>Small files: usually under 30 seconds</li>
        <li>Medium files (1–10 MB): 1–3 minutes</li>
        <li>Large files (10–50 MB): 3–10 minutes</li>
      </ul>

      <DocCallout variant="tip" icon={Loader} title="Don't navigate away">
        Processing continues in the background even if you close the page. You can safely navigate away and check back later.
      </DocCallout>

      <h2 id="ready">Ready</h2>
      <p>
        The document is fully indexed and available for retrieval. The agent can search its content and use it to answer questions.
      </p>
      <ul>
        <li>The document's chunks are stored in pgvector</li>
        <li>Vector search will return relevant chunks from this document</li>
        <li>No further action needed</li>
      </ul>

      <h2 id="error">Error</h2>
      <p>
        Processing failed. The error message provides details about what went wrong. Common errors and fixes:
      </p>

      <h3 id="common-errors">Common Errors</h3>
      <ul>
        <li><strong>"Unsupported file format":</strong> The file type isn't supported. Check <Link to="/docs/supported-documents" className="text-primary hover:underline">Supported Document Types</Link>.</li>
        <li><strong>"File too large":</strong> The file exceeds the 50 MB limit. Split it into smaller files.</li>
        <li><strong>"Text extraction failed":</strong> The PDF may be scanned (image-based) or corrupted. Try OCR or a different file.</li>
        <li><strong>"Empty content":</strong> The document contains no extractable text. Verify the file isn't empty or purely image-based.</li>
        <li><strong>"Encoding error":</strong> The file isn't UTF-8 encoded. Convert it and re-upload.</li>
      </ul>

      <h2 id="reprocessing">Reprocessing Documents</h2>
      <p>
        If a document failed or you want to reprocess it after making changes:
      </p>
      <ol>
        <li>Open the knowledge base and go to the <strong>Documents</strong> tab</li>
        <li>Find the document in the list</li>
        <li>Click the <strong>⋮</strong> menu on the right side</li>
        <li>Select <strong>Reprocess</strong></li>
        <li>The document status changes to "Processing" and runs through the pipeline again</li>
      </ol>

      <DocCallout variant="warning" icon={RefreshCw} title="Reprocessing overwrites">
        Reprocessing replaces the existing chunks and embeddings. If you've made manual edits to the knowledge base, those edits will be lost.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={RefreshCw}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Knowledge Bases"
          href="/docs/managing-knowledge-bases"
        />
        <DocNextStepCard
          icon={AlertCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Uploading Documents"
          href="/docs/uploading-documents"
        />
      </DocCardGrid>
    </DocContent>
  )
}
