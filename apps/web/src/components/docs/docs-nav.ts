import {
  Home,
  ListChecks,
  GitBranch,
  Search,
  Brain,
  Network,
  DollarSign,
  Shrink,
  Mic,
  Plug,
  LayoutTemplate,
  Database,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface DocItem {
  title: string
  href: string
  icon: LucideIcon
  description?: string
}

export interface DocSection {
  title: string
  items: DocItem[]
}

export const docSections: DocSection[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Overview', href: '/docs', icon: Home, description: 'Documentation overview and setup guide' },
      { title: 'Integration Plan', href: '/docs/plan', icon: ListChecks, description: 'Phase-by-phase plan for awesome-llm-apps' },
    ],
  },
  {
    title: 'RAG Improvements',
    items: [
      { title: 'Corrective RAG', href: '/docs/corrective-rag', icon: GitBranch, description: 'Self-grading retrieval pipeline' },
      { title: 'Hybrid Search RAG', href: '/docs/hybrid-search', icon: Search, description: 'Keyword + vector search' },
      { title: 'Agentic RAG', href: '/docs/agentic-rag', icon: Brain, description: 'Step-by-step reasoning retrieval' },
      { title: 'Knowledge Graph RAG', href: '/docs/knowledge-graph-rag', icon: Network, description: 'Multi-hop with citations' },
    ],
  },
  {
    title: 'Cost Optimization',
    items: [
      { title: 'Token Optimization', href: '/docs/token-optimization', icon: DollarSign, description: 'Reduce API costs by 30-60%' },
      { title: 'Context Optimization', href: '/docs/context-optimization', icon: Shrink, description: 'Reduce API costs by 50-90%' },
    ],
  },
  {
    title: 'Voice & Multimodal',
    items: [
      { title: 'Voice AI Agents', href: '/docs/voice', icon: Mic, description: 'Speech-in, speech-out agents' },
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      { title: 'MCP Integration', href: '/docs/mcp', icon: Plug, description: 'Model Context Protocol agents' },
      { title: 'Generative UI', href: '/docs/generative-ui', icon: LayoutTemplate, description: 'Interactive UI from agents' },
      { title: 'Memory Systems', href: '/docs/memory', icon: Database, description: 'Cross-session memory patterns' },
      { title: 'Multi-Agent Teams', href: '/docs/multi-agent', icon: Users, description: 'Multi-agent collaboration patterns' },
    ],
  },
]
