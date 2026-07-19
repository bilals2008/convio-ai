import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

export default function HybridSearchPage() {
  return (
    <div>
      <DocHeading as="h1">Hybrid Search RAG</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        Improve retrieval accuracy by combining keyword-based search (BM25) with vector similarity search.
      </p>

      <DocHeading>Current State</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Convio's RAG uses pure vector search (pgvector, cosine distance). Vector search excels at semantic similarity but can miss exact keyword matches. Hybrid search combines both approaches for better coverage.
      </p>

      <DocHeading>What Hybrid Search Adds</DocHeading>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>BM25 Keyword Search:</strong> Traditional keyword matching for exact terms, names, and codes</li>
        <li><strong>Result Fusion:</strong> Combine BM25 and vector results with Reciprocal Rank Fusion (RRF)</li>
        <li><strong>Better Coverage:</strong> Catches queries that vector search misses (exact matches, structured data)</li>
        <li><strong>Improved Accuracy:</strong> Both semantic and keyword-aware retrieval working together</li>
      </ul>

      <DocHeading>Implementation</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Add BM25 indexing alongside existing pgvector embeddings. Use PostgreSQL's built-in <code className="text-xs bg-muted px-1 py-0.5 rounded">tsvector</code> for full-text search, then combine results using RRF.
      </p>

      <div className="flex gap-3">
        <Link to="/docs/corrective-rag">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: Corrective RAG
          </Button>
        </Link>
        <Link to="/docs/agentic-rag">
          <Button size="sm">
            Next: Agentic RAG
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
