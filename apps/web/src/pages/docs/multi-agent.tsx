import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

export default function MultiAgentPage() {
  return (
    <div>
      <DocHeading as="h1">Multi-Agent Teams</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        Implement multi-agent collaboration patterns — multiple agents working together on complex tasks.
      </p>

      <DocHeading>Available Team Patterns</DocHeading>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>Finance Agent Team</strong> — Financial analyst team in 20 lines of Python</li>
        <li><strong>Legal Agent Team</strong> — Research, contract analysis, and strategy</li>
        <li><strong>Recruitment Agent Team</strong> — Resume screening to interview scheduling</li>
        <li><strong>Teaching Agent Team</strong> — Faculty of agents that build learning paths</li>
        <li><strong>Real Estate Agent Team</strong> — Property search, market analysis, recommendations</li>
        <li><strong>Sales Intelligence Team</strong> — Competitive battle cards in real time</li>
        <li><strong>VC Due Diligence Team</strong> — Startup investment analysis</li>
      </ul>

      <DocHeading>Integration</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Convio's single-agent architecture can be extended to support agent teams. Create a team configuration where users define multiple agents with different roles. The orchestrator agent delegates to specialized workers and synthesizes results.
      </p>

      <div className="flex gap-3">
        <Link to="/docs/memory">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: Memory Systems
          </Button>
        </Link>
      </div>
    </div>
  )
}
