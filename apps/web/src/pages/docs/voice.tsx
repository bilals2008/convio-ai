import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

export default function VoicePage() {
  return (
    <div>
      <DocHeading as="h1">Voice AI Agents</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        Add speech-in, speech-out capabilities to Convio agents using real-time voice APIs.
      </p>

      <DocHeading>Overview</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Convio currently supports text-based chat across web, WhatsApp, Telegram, and Discord. Voice AI would add a new channel — voice calls — where users speak naturally and the agent responds verbally in real-time.
      </p>

      <DocHeading>Available Implementations</DocHeading>
      <ul className="space-y-2 text-sm text-muted-foreground mb-6 list-disc pl-5">
        <li><strong>Insurance Claim Live Agent Team</strong> — Real-time voice claim intake with Gemini Live</li>
        <li><strong>Customer Support Voice Agent</strong> — Voice answers grounded in your own docs</li>
        <li><strong>Voice RAG Agent</strong> — Ask PDFs questions, hear answers</li>
        <li><strong>AI Audio Tour Agent</strong> — Self-guided audio tours from location/interests</li>
      </ul>

      <DocHeading>Integration Points</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Voice would be a new deployment channel in Convio. Create a new service <code className="text-xs bg-muted px-1.5 py-0.5 rounded">apps/api/src/services/voice.ts</code> following the existing channel patterns (whatsapp.ts, telegram.ts, discord.ts).
      </p>

      <div className="flex gap-3">
        <Link to="/docs/context-optimization">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-3.5" />
            Back: Context Optimization
          </Button>
        </Link>
        <Link to="/docs/mcp">
          <Button size="sm">
            Next: MCP Integration
            <ArrowRight className="size-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
