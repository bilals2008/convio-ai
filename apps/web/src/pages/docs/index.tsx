import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, ListChecks, Cpu, DollarSign, Mic, Plug, LayoutTemplate, Globe, Code, Layers, type LucideIcon } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Button } from '@/components/ui/button'

const quickLinks: { icon?: LucideIcon; label: string; href: string; desc: string; logo?: string }[] = [
  { icon: ListChecks, label: 'Integration Plan', href: '/docs/plan', desc: 'Phase-by-phase plan for adding awesome-llm-apps features' },
  { icon: Cpu, label: 'RAG Improvements', href: '/docs/corrective-rag', desc: 'Corrective RAG, Hybrid Search, Agentic RAG & more' },
  { icon: DollarSign, label: 'Cost Optimization', href: '/docs/token-optimization', desc: 'Reduce LLM API costs by 30-90%' },
  { icon: Mic, label: 'Voice AI', href: '/docs/voice', desc: 'Speech-in, speech-out voice agents' },
  { logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/whatsapp/wordmark.svg', label: 'WhatsApp Features', href: '/docs/whatsapp-features', desc: 'Typing indicators, buttons, templates & more' },
  { logo: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/discord/wordmark.svg', label: 'Discord Features', href: '/docs/discord-features', desc: 'Components, permissions, voice & more' },
  { icon: Globe, label: 'Widget Features', href: '/docs/widget-features', desc: 'Chat bubble, themes, uploads & analytics' },
  { icon: Code, label: 'API Features', href: '/docs/api-features', desc: 'Conversations, analytics, webhooks & more' },
  { icon: Plug, label: 'MCP Integration', href: '/docs/mcp', desc: 'Model Context Protocol agents' },
  { icon: LayoutTemplate, label: 'Generative UI', href: '/docs/generative-ui', desc: 'Interactive UI from agents' },
  { icon: Layers, label: 'Agent Templates', href: '/docs/templates', desc: 'Pre-built agent prompts and settings' },
]

export default function DocsOverviewPage() {
  return (
    <div>
      <DocHeading as="h1">Documentation</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-8">
        This documentation covers the integration of features from <strong>awesome-llm-apps</strong> — a collection of 100+ open-source AI agents, RAG apps, and agent skills — into Convio. Each section provides implementation guidance, architecture decisions, and phase-by-phase integration plans.
      </p>

      <DocHeading>What is awesome-llm-apps?</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        Awesome LLM Apps is a GitHub repository by Shubham Saboo featuring 100+ hand-built, production-ready AI agents and RAG applications. It works with Claude, Gemini, GPT, DeepSeek, Llama, Qwen and other models. The repo is Apache-2.0 licensed and contains apps ranging from starter single-file agents to complex multi-agent teams with voice, MCP, and generative UI capabilities.
      </p>

      <DocHeading>Why integrate with Convio?</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-6">
        Convio already has a solid foundation — multi-provider AI support, RAG pipeline with pgvector, multi-channel deployment, tools, and streaming. The awesome-llm-apps collection provides battle-tested patterns that can directly improve Convio in these areas:
      </p>

      <div className="grid gap-3 sm:grid-cols-2 mb-10">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="group flex items-start gap-3 rounded-xl border p-4 transition-all hover:border-primary/30 hover:bg-primary/[0.02]"
          >
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              {item.logo ? (
                <img src={item.logo} alt="" className="h-4 object-contain" />
              ) : item.icon ? (
                <item.icon className="size-4 text-primary" />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium group-hover:text-primary transition-colors">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <DocHeading>Quick Start</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-4">
        The awesome-llm-apps repo has been cloned locally. Each feature is documented with step-by-step integration instructions in the following pages. Start with the Integration Plan to understand the prioritization and phase breakdown.
      </p>

      <div className="flex gap-3">
        <Link to="/docs/plan">
          <Button>
            View Integration Plan
            <ArrowRight className="size-4" />
          </Button>
        </Link>
        <Link to="/docs/corrective-rag">
          <Button variant="outline">
            Start with RAG
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
