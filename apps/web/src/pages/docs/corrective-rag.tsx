import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

export default function CorrectiveRagPage() {
  return (
    <div>
      <DocHeading as="h1">Corrective RAG (CRAG)</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        Improve Convio's RAG pipeline with self-grading retrieval that evaluates answer quality and falls back to web search when needed.
      </p>

      <DocHeading>Current State</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Convio currently uses a basic RAG pipeline: retrieve chunks via cosine similarity from pgvector, then generate answer from context. There is no evaluation of retrieval quality — if the wrong chunks are retrieved, the answer will be wrong.
      </p>

      <DocHeading>What CRAG Adds</DocHeading>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>Self-Grading:</strong> After retrieval, the LLM evaluates if chunks are relevant to the query</li>
        <li><strong>Fallback:</strong> If all chunks are irrelevant, fall back to web search</li>
        <li><strong>Knowledge Refinement:</strong> Extract only the relevant parts from chunks, discard noise</li>
        <li><strong>Hallucination Reduction:</strong> Answer is only generated if retrieval quality meets threshold</li>
      </ul>

      <DocHeading>Implementation Steps</DocHeading>
      <ol className="space-y-3 text-sm text-muted-foreground mb-6 list-decimal pl-5">
        <li><strong>Add relevance grading prompt</strong> — Create a system prompt that evaluates chunk relevance to the query</li>
        <li><strong>Implement CRAG pipeline</strong> — Wrap current retrieve-and-generate with grade → refine → answer logic</li>
        <li><strong>Add web search fallback</strong> — Use existing web-search tool when retrieval quality is low</li>
        <li><strong>Handle edge cases</strong> — All irrelevant → return web results, Mixed → refine relevant ones, All relevant → normal flow</li>
      </ol>

      <DocHeading>Source Files</DocHeading>
      <p className="text-sm text-muted-foreground mb-6">
        Reference implementation: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">C:\Users\muham\Desktop\llm\awesome-llm-apps\rag_tutorials\corrective_rag</code>
      </p>

      <DocHeading>Integration into Convio</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-6">
        The CRAG pipeline should be integrated into <code className="text-xs bg-muted px-1.5 py-0.5 rounded">apps/api/src/services/processor.ts</code> where current RAG logic lives. Create a new function <code className="text-xs bg-muted px-1.5 py-0.5 rounded">correctiveRetrieveAndGenerate()</code> that wraps the existing retrieval with grading logic.
      </p>

      <div className="flex gap-3">
        <Link to="/docs/plan">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back to Plan
          </Button>
        </Link>
        <Link to="/docs/hybrid-search">
          <Button size="sm">
            Next: Hybrid Search
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
