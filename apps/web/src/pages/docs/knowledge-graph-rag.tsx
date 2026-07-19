import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

export default function KnowledgeGraphRagPage() {
  return (
    <div>
      <DocHeading as="h1">Knowledge Graph RAG</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        Build entity-relationship graphs from documents for multi-hop reasoning with verifiable citations.
      </p>

      <DocHeading>Overview</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Standard RAG retrieves isolated chunks. Knowledge Graph RAG extracts entities (people, places, concepts) and their relationships from documents, enabling the agent to answer questions that require connecting information across multiple chunks.
      </p>

      <div className="flex gap-3">
        <Link to="/docs/agentic-rag">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: Agentic RAG
          </Button>
        </Link>
        <Link to="/docs/token-optimization">
          <Button size="sm">
            Next: Token Optimization
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
