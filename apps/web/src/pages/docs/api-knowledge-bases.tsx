import { Database, Upload, Search, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ApiKnowledgeBasesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Knowledge Bases API' },
        ]}
        title="Knowledge Bases API"
        description="Create knowledge bases, upload documents, search across your data, and track processing status — all via API."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Knowledge bases store your company's data and make it searchable by agents. The Knowledge Bases API lets you create knowledge bases, upload documents (PDFs, text, URLs), search for relevant context, and track document processing status.
      </p>

      <h2 id="endpoints">Endpoints</h2>
      <pre><code>{`GET    /v1/knowledge-bases              # List knowledge bases
POST   /v1/knowledge-bases              # Create a knowledge base
GET    /v1/knowledge-bases/:id          # Get a specific knowledge base
PATCH  /v1/knowledge-bases/:id          # Update a knowledge base
DELETE /v1/knowledge-bases/:id          # Delete a knowledge base

POST   /v1/knowledge-bases/:id/documents    # Upload a document
GET    /v1/knowledge-bases/:id/documents    # List documents
DELETE /v1/knowledge-bases/:id/documents/:doc_id  # Delete a document

POST   /v1/knowledge-bases/:id/search  # Search the knowledge base`}</code></pre>

      <h2 id="create-kb">Create Knowledge Base</h2>
      <pre><code>{`POST /v1/knowledge-bases
{
  "name": "Product Documentation",
  "description": "Technical docs for our product suite",
  "chunking_strategy": "semantic",
  "embedding_model": "text-embedding-3-small"
}`}</code></pre>
      <p>Response:</p>
      <pre><code>{`{
  "data": {
    "id": "kb_abc123",
    "name": "Product Documentation",
    "status": "active",
    "document_count": 0,
    "chunk_count": 0,
    "created_at": "2026-07-26T10:00:00Z"
  }
}`}</code></pre>

      <h2 id="upload-document">Upload Document</h2>
      <p>Upload files to a knowledge base. Supported formats: PDF, TXT, Markdown, DOCX, CSV, JSON:</p>
      <pre><code>{`POST /v1/knowledge-bases/kb_abc123/documents
Content-Type: multipart/form-data

file: product-guide.pdf
metadata: { "category": "user-guide", "version": "2.1" }
}`}</code></pre>

      <DocCallout variant="info" icon={Upload} title="Processing is asynchronous">
        Documents are queued for processing immediately. Use the document status endpoint to track when processing completes. Large files (100+ pages) may take 2-5 minutes to fully process.
      </DocCallout>

      <h2 id="search">Search</h2>
      <p>
        Search for relevant content across a knowledge base. Returns ranked chunks with similarity scores:
      </p>
      <pre><code>{`POST /v1/knowledge-bases/kb_abc123/search
{
  "query": "How do I reset my password?",
  "top_k": 5,
  "filters": {
    "category": "user-guide"
  }
}`}</code></pre>
      <p>Response:</p>
      <pre><code>{`{
  "data": [
    {
      "id": "chunk_xyz",
      "content": "To reset your password, navigate to Settings → Security...",
      "document_id": "doc_abc",
      "score": 0.92,
      "metadata": { "page": 12 }
    }
  ],
  "meta": {
    "query_time_ms": 45
  }
}`}</code></pre>

      <h2 id="status-tracking">Status Tracking</h2>
      <p>Check document processing status:</p>
      <pre><code>GET /v1/knowledge-bases/kb_abc123/documents</code></pre>
      <p>Document statuses: <code>uploading</code>, <code>processing</code>, <code>ready</code>, <code>failed</code>. Failed documents include an error message with the failure reason.</p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Search}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Streaming API"
          href="/docs/api-streaming"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Webhook Events Reference"
          href="/docs/api-webhooks"
        />
      </DocCardGrid>
    </DocContent>
  )
}
