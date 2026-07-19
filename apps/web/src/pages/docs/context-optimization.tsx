import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

export default function ContextOptimizationPage() {
  return (
    <div>
      <DocHeading as="h1">Headroom Context Optimization</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        Reduce context window usage by 50-90% without quality loss, dramatically lowering API costs.
      </p>

      <DocHeading>Overview</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Headroom optimizes how context is structured before sending to LLMs. It compresses conversation history, system prompts, and RAG context while preserving essential information. This is especially valuable for Convio since every chat message accumulates in the context window.
      </p>

      <DocHeading>Key Benefits for Convio</DocHeading>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>Direct Cost Savings:</strong> Less tokens = lower API bills per conversation</li>
        <li><strong>Faster Responses:</strong> Smaller context = quicker LLM inference</li>
        <li><strong>Longer Conversations:</strong> Fit more turns within context limits</li>
        <li><strong>Better for Billing:</strong> Lower cost-per-conversation improves margins on free/pro plans</li>
      </ul>

      <DocHeading>Source</DocHeading>
      <p className="text-sm text-muted-foreground mb-6">
        Reference: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">C:\Users\muham\Desktop\llm\awesome-llm-apps\advanced_llm_apps\llm_optimization_tools\headroom_context_optimization</code>
      </p>

      <div className="flex gap-3">
        <Link to="/docs/token-optimization">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: Token Optimization
          </Button>
        </Link>
        <Link to="/docs/voice">
          <Button size="sm">
            Next: Voice AI
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
