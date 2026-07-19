import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

export default function GenerativeUiPage() {
  return (
    <div>
      <DocHeading as="h1">Generative UI</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        Make Convio agents render interactive UI components — forms, cards, charts — instead of just text.
      </p>

      <DocHeading>Overview</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Currently Convio agents respond with text. Generative UI takes it further — agents can render actual interactive components. Need a budget plan? The agent renders an interactive card. Need a dashboard? Describe it in chat, and charts appear on a live canvas.
      </p>

      <DocHeading>Available Implementations</DocHeading>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>Generative UI Starter</strong> — Chat-driven kanban board</li>
        <li><strong>AI Financial Coach</strong> — Budget, savings, debt as interactive cards</li>
        <li><strong>AI Dashboard Canvas</strong> — Describe dashboards, charts assemble live</li>
        <li><strong>AI Shadcn Component Generator</strong> — Chat to production-ready shadcn components</li>
      </ul>

      <DocHeading>Integration</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-6">
        This would primarily affect the web widget and chat UI. Add a component renderer that interprets structured output from the AI (e.g., JSON schema for cards, charts, forms) and renders them inline in the conversation.
      </p>

      <div className="flex gap-3">
        <Link to="/docs/mcp">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: MCP Integration
          </Button>
        </Link>
        <Link to="/docs/memory">
          <Button size="sm">
            Next: Memory Systems
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
