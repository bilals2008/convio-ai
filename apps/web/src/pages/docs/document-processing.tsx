import { Link } from 'react-router-dom'
import { ArrowRight, Layers, FileText, Brain, Database, Search } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function DocumentProcessingPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'How Document Processing Works' },
        ]}
        title="How Document Processing Works"
        description="Understand what happens behind the scenes when you upload a document to a knowledge base."
      />

      <h2 id="overview">Overview</h2>
      <p>
        When you upload a file or paste a URL, Convio runs it through a four-stage pipeline: text extraction, chunking, embedding, and indexing. Understanding this pipeline helps you optimize your content for better retrieval quality.
      </p>

      <h2 id="pipeline">The Processing Pipeline</h2>

      <h3 id="stage-1-text-extraction">Stage 1 — Text Extraction</h3>
      <p>
        The first step is converting your document into plain text. The method depends on the file format:
      </p>
      <ul>
        <li><strong>PDF:</strong> Text is extracted from the PDF structure. Scanned PDFs use OCR (optical character recognition) when available.</li>
        <li><strong>Markdown:</strong> Raw text is preserved with heading levels intact for structural chunking.</li>
        <li><strong>CSV:</strong> Each row is converted to a text block with column headers for context.</li>
        <li><strong>JSON:</strong> Objects are flattened into readable key-value text.</li>
        <li><strong>URLs:</strong> HTML is parsed, and the main content area is extracted using readability algorithms.</li>
      </ul>

      <h3 id="stage-2-chunking">Stage 2 — Chunking</h3>
      <p>
        Extracted text is split into smaller, semantically meaningful chunks. This is critical for retrieval quality — if chunks are too large, the model gets irrelevant context; too small, and it loses important context.
      </p>
      <p>
        Convio uses a combination of fixed-size splitting and semantic boundary detection (paragraphs, headings, sentences) to create chunks that are both focused and coherent.
      </p>
      <p>
        See <Link to="/docs/understanding-chunking" className="text-primary hover:underline">Understanding Chunking</Link> for a deep dive into chunk strategies.
      </p>

      <h3 id="stage-3-embedding">Stage 3 — Embedding Generation</h3>
      <p>
        Each chunk is converted into a <strong>384-dimensional vector</strong> using a text embedding model. This vector is a numerical representation of the chunk's semantic meaning — not just its words, but what it actually means.
      </p>
      <p>
        Convio stores these vectors in <strong>pgvector</strong>, a PostgreSQL extension optimized for similarity search.
      </p>

      <DocCallout variant="info" icon={Brain} title="Why 384 dimensions?">
        384 dimensions is a sweet spot between accuracy and performance. It captures enough semantic nuance for high-quality retrieval while keeping storage and search fast.
      </DocCallout>

      <h3 id="stage-4-indexing">Stage 4 — Indexing</h3>
      <p>
        Vectors are indexed in pgvector with an HNSW (Hierarchical Navigable Small World) index for fast approximate nearest-neighbor search. This means Convio can find relevant chunks in milliseconds, even across thousands of documents.
      </p>

      <h2 id="at-query-time">At Query Time</h2>
      <p>
        When a user asks a question, the same pipeline runs in reverse:
      </p>
      <ol>
        <li>The query is embedded into a 384-d vector using the same model</li>
        <li>pgvector performs a similarity search against all stored vectors</li>
        <li>The top-k most relevant chunks are returned</li>
        <li>These chunks are injected into the model's context alongside the user's question</li>
        <li>The model generates an answer grounded in the retrieved content</li>
      </ol>

      <h2 id="processing-time">Processing Time</h2>
      <p>
        Processing time depends on document size and complexity:
      </p>
      <ul>
        <li><strong>Small text files (under 1 MB):</strong> Usually under 30 seconds</li>
        <li><strong>Medium PDFs (1–10 MB):</strong> 1–3 minutes</li>
        <li><strong>Large documents (10–50 MB):</strong> 3–10 minutes</li>
        <li><strong>URLs:</strong> Usually under 15 seconds per page</li>
      </ul>

      <DocCallout variant="tip" icon={Search} title="Parallel processing">
        Multiple documents are processed in parallel, so uploading a batch of 10 small files doesn't take 10x longer than uploading one.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Layers}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Understanding Chunking"
          href="/docs/understanding-chunking"
        />
        <DocNextStepCard
          icon={Database}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Vector Search & Embeddings"
          href="/docs/vector-search"
        />
      </DocCardGrid>
    </DocContent>
  )
}
