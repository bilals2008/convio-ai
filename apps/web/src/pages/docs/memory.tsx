import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

export default function MemoryPage() {
  return (
    <div>
      <DocHeading as="h1">Memory Systems</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        Implement cross-session memory so Convio agents remember user preferences and conversation history.
      </p>

      <DocHeading>Overview</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Convio already has conversation tracking per session, but no persistent cross-session memory. Adding memory means agents remember user preferences, past interactions, and context across different conversations.
      </p>

      <DocHeading>Available Patterns</DocHeading>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>Personalized Memory</strong> — Context across conversations for each user</li>
        <li><strong>Multi-LLM Shared Memory</strong> — Different models, same memory store</li>
        <li><strong>Session-Persistent Chat</strong> — Stateful chat with memory</li>
        <li><strong>Interest-Based Memory</strong> — Remember user research interests (ArXiv agent)</li>
      </ul>

      <DocHeading>Integration</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Add a memory store (could use the existing database or a vector store). Each user gets a memory profile that agents read/write during conversations. Integrate into the conversation handler in <code className="text-xs bg-muted px-1.5 py-0.5 rounded">apps/api/src/modules/ai/</code>.
      </p>

      <div className="flex gap-3">
        <Link to="/docs/generative-ui">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: Generative UI
          </Button>
        </Link>
        <Link to="/docs/multi-agent">
          <Button size="sm">
            Next: Multi-Agent Teams
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
