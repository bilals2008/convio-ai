import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

export default function AgenticRagPage() {
  return (
    <div>
      <DocHeading as="h1">Agentic RAG with Reasoning</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        Add step-by-step reasoning to retrieval — agent decides what to retrieve, evaluates results, and iterates before answering.
      </p>

      <DocHeading>Overview</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Current RAG retrieves chunks in one shot and generates an answer. Agentic RAG gives the agent reasoning capabilities — it can:
      </p>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li>Decompose complex queries into sub-questions</li>
        <li>Retrieve different information for each sub-question</li>
        <li>Evaluate if retrieved info is sufficient before answering</li>
        <li>Perform additional retrieval rounds if needed</li>
        <li>Show step-by-step reasoning to users</li>
      </ul>

      <DocHeading>Integration Points</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Integrate into <code className="text-xs bg-muted px-1.5 py-0.5 rounded">apps/api/src/modules/ai/</code> where the streaming chat handler lives. The reasoning step can stream tokens to show users the agent's thought process.
      </p>

      <div className="flex gap-3">
        <Link to="/docs/hybrid-search">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: Hybrid Search
          </Button>
        </Link>
        <Link to="/docs/knowledge-graph-rag">
          <Button size="sm">
            Next: Knowledge Graph RAG
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
