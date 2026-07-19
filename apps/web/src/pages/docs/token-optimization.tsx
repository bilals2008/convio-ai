import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TokenOptimizationPage() {
  return (
    <div>
      <DocHeading as="h1">Token Optimization (TOON)</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        Reduce LLM API costs by 30-60% using token-optimized formatting without quality loss.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 mb-6">
        <Card className="p-4">
          <p className="text-lg font-semibold text-primary">30-60%</p>
          <p className="text-xs text-muted-foreground">Cost reduction with TOON format</p>
        </Card>
        <Card className="p-4">
          <p className="text-lg font-semibold text-primary">50-90%</p>
          <p className="text-xs text-muted-foreground">Cost reduction with Headroom</p>
        </Card>
      </div>

      <DocHeading>How TOON Works</DocHeading>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li>Reformats prompts to use minimal tokens while preserving semantic meaning</li>
        <li>Removes redundant whitespace, verbose instructions, verbose formatting</li>
        <li>Uses compact structured formats instead of prose</li>
        <li>Works with any LLM provider (OpenAI, Anthropic, Google, Groq)</li>
      </ul>

      <DocHeading>Integration into Convio</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Add as a pre-processing step in <code className="text-xs bg-muted px-1.5 py-0.5 rounded">packages/ai/src/index.ts</code> before sending prompts to providers. Make it configurable per agent so users can choose between cost vs. verbosity.
      </p>

      <div className="flex gap-3">
        <Link to="/docs/knowledge-graph-rag">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: Knowledge Graph RAG
          </Button>
        </Link>
        <Link to="/docs/context-optimization">
          <Button size="sm">
            Next: Context Optimization
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
