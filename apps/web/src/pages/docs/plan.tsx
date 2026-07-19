import { Link } from 'react-router-dom'
import { ArrowRight, Shield, Zap, BarChart3, Mic, Plug, LayoutTemplate, Database, Users, Search } from 'lucide-react'
import { DocHeading } from '@/components/docs/doc-heading'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const phases = [
  {
    id: 'phase-1',
    title: 'Phase 1 — RAG Quality & Cost Optimization',
    badge: 'Immediate Impact' as const,
    icon: Search,
    timeline: 'Week 1-2',
    items: [
      {
        title: 'Corrective RAG (CRAG)',
        desc: 'Current RAG does simple cosine similarity. CRAG adds self-grading — retrieval evaluates its own quality and falls back to web search if weak.',
        path: '/docs/corrective-rag',
        source: 'rag_tutorials/corrective_rag',
        effort: 'Medium',
        impact: 'High — Better answer quality, fewer hallucinations',
      },
      {
        title: 'Hybrid Search RAG',
        desc: 'Add keyword-based search (BM25) alongside vector search. Combine both results for better retrieval accuracy.',
        path: '/docs/hybrid-search',
        source: 'rag_tutorials/hybrid_search_rag',
        effort: 'Low',
        impact: 'High — Significant retrieval improvement',
      },
      {
        title: 'RAG Failure Diagnostics',
        desc: 'Add a diagnostics system that tells you why RAG failed — chunking problem, embedding quality, or retrieval threshold.',
        path: '/docs/rag-diagnostics',
        source: 'rag_tutorials/rag_failure_diagnostics_clinic',
        effort: 'Low',
        impact: 'Medium — Better debugging',
      },
      {
        title: 'Token Optimization (TOON)',
        desc: 'Reduce token usage by 30-60% using TOON format. Direct cost savings on every API call.',
        path: '/docs/token-optimization',
        source: 'advanced_llm_apps/llm_optimization_tools/toonify_token_optimization',
        effort: 'Low',
        impact: 'High — Direct cost savings',
      },
      {
        title: 'Headroom Context Optimization',
        desc: 'Reduce context window usage by 50-90% without quality loss. Dramatic API cost reduction.',
        path: '/docs/context-optimization',
        source: 'advanced_llm_apps/llm_optimization_tools/headroom_context_optimization',
        effort: 'Low',
        impact: 'High — Major cost reduction',
      },
    ],
  },
  {
    id: 'phase-2',
    title: 'Phase 2 — Advanced RAG & Agentic Patterns',
    badge: 'Core Enhancement' as const,
    icon: Zap,
    timeline: 'Week 3-4',
    items: [
      {
        title: 'Agentic RAG with Reasoning',
        desc: 'Agent decides step-by-step what to retrieve before answering. More accurate for complex multi-step questions.',
        path: '/docs/agentic-rag',
        source: 'rag_tutorials/agentic_rag_with_reasoning',
        effort: 'Medium',
        impact: 'High — Better complex query handling',
      },
      {
        title: 'Knowledge Graph RAG',
        desc: 'Build entity relationships from documents. Enables multi-hop reasoning with verifiable citations.',
        path: '/docs/knowledge-graph-rag',
        source: 'rag_tutorials/knowledge_graph_rag_citations',
        effort: 'High',
        impact: 'Medium — Niche but powerful',
      },
      {
        title: 'Memory Systems',
        desc: 'Implement cross-session memory so agents remember user preferences and conversation history across sessions.',
        path: '/docs/memory',
        source: 'advanced_llm_apps/llm_apps_with_memory_tutorials/',
        effort: 'Medium',
        impact: 'High — Better user experience',
      },
      {
        title: 'Multi-Agent Teams',
        desc: 'Implement agent collaboration patterns — orchestrator + worker agents for complex tasks.',
        path: '/docs/multi-agent',
        source: 'advanced_ai_agents/multi_agent_apps/agent_teams/',
        effort: 'High',
        impact: 'Medium — Advanced use cases',
      },
    ],
  },
  {
    id: 'phase-3',
    title: 'Phase 3 — Voice, MCP & Generative UI',
    badge: 'Differentiator' as const,
    icon: Mic,
    timeline: 'Week 5-6',
    items: [
      {
        title: 'Voice AI Agents',
        desc: 'Add real-time voice input/output to agents. Speech-in, speech-out using Gemini Live or similar.',
        path: '/docs/voice',
        source: 'voice_ai_agents/',
        effort: 'High',
        impact: 'High — Major differentiator',
      },
      {
        title: 'MCP Integration',
        desc: 'Connect agents to external tools via Model Context Protocol — browser automation, GitHub, Notion.',
        path: '/docs/mcp',
        source: 'mcp_ai_agents/',
        effort: 'Medium',
        impact: 'High — Extends agent capabilities',
      },
      {
        title: 'Generative UI',
        desc: 'Agents render interactive UI components — forms, cards, charts — instead of just text responses.',
        path: '/docs/generative-ui',
        source: 'generative_ui_agents/',
        effort: 'High',
        impact: 'High — Unique UX advantage',
      },
    ],
  },
  {
    id: 'phase-4',
    title: 'Phase 4 — Polish & Optimization',
    badge: 'Production Readiness' as const,
    icon: BarChart3,
    timeline: 'Week 7-8',
    items: [
      {
        title: 'Self-Improving Agents',
        desc: 'Agents that optimize their own skills against evaluations. Continuous improvement without manual tuning.',
        path: '/docs/self-improving',
        source: 'agent_skills/self-improving-agent-skills',
        effort: 'High',
        impact: 'Medium — Long-term value',
      },
      {
        title: 'Trust-Gated Multi-Agent',
        desc: 'Add verification and audit trails to multi-agent workflows. Essential for enterprise compliance.',
        path: '/docs/trust-gated',
        source: 'advanced_ai_agents/multi_agent_apps/trust_gated_agent_team',
        effort: 'Medium',
        impact: 'High — Enterprise readiness',
      },
      {
        title: 'RAG-as-a-Service',
        desc: 'Package RAG pipeline as a proper service with API endpoints. Better scalability and maintainability.',
        path: '/docs/rag-service',
        source: 'rag_tutorials/rag-as-a-service',
        effort: 'Medium',
        impact: 'Medium — Cleaner architecture',
      },
    ],
  },
]

export default function DocsPlanPage() {
  return (
    <div>
      <DocHeading as="h1">Integration Plan</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-2">
        Phase-by-phase plan for integrating awesome-llm-apps features into Convio.
      </p>
      <p className="text-xs text-muted-foreground/60 mb-8">
        Source: awesome-llm-apps cloned at <code className="text-xs bg-muted px-1 py-0.5 rounded">C:\Users\muham\Desktop\llm\awesome-llm-apps</code>
      </p>

      <div className="space-y-10">
        {phases.map((phase) => (
          <section key={phase.id} id={phase.id} data-doc-heading>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <phase.icon className="size-4 text-primary" />
              </div>
              <div>
                <DocHeading className="!mt-0 !mb-0">{phase.title}</DocHeading>
              </div>
              <Badge variant="secondary" className="ml-auto shrink-0 text-xs">
                {phase.timeline}
              </Badge>
            </div>

            <div className="space-y-3 mt-4">
              {phase.items.map((item, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <Link to={item.path} className="text-sm font-medium hover:text-primary transition-colors">
                      {item.title}
                      <ArrowRight className="size-3 ml-1 inline-block" />
                    </Link>
                    <div className="flex gap-1.5 shrink-0">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                        {item.effort}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 text-primary border-primary/30">
                        {item.impact.split(' — ')[0]}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{item.desc}</p>
                  <p className="text-xs text-muted-foreground/60">
                    Source: <code className="text-[10px] bg-muted px-1 py-0.5 rounded">{item.source}</code>
                  </p>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 border-t pt-8">
        <DocHeading>Next Steps</DocHeading>
        <p className="text-muted-foreground leading-relaxed mb-4">
          Start with Phase 1 for immediate impact. Each feature has its own dedicated doc page with
          detailed implementation guidance.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link to="/docs/corrective-rag">
            <Button size="sm">
              Start: Corrective RAG
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
          <Link to="/docs/token-optimization">
            <Button size="sm" variant="outline">
              Start: Token Optimization
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
