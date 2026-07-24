import { DocHeading } from '@/components/docs/doc-heading'

const phases = [
  {
    phase: 'Phase 1',
    title: 'Launch Ready',
    timeline: '1-2 Weeks',
    priority: '🔥 Highest',
    sections: [
      {
        title: 'Infrastructure',
        items: [
          'GitHub Actions CI/CD',
          'Sentry Error Monitoring',
          'Better Logging',
          'More Tests (Auth, Billing, Chat)',
          'Health Check Endpoint',
          'Database Backups',
          'Rate Limiting Improvements',
          'Security Audit',
        ],
      },
      {
        title: 'UI',
        items: [
          'Empty States',
          'Better Loading States',
          'Skeletons',
          'Better Onboarding',
          'Product Tour',
        ],
      },
    ],
  },
  {
    phase: 'Phase 2',
    title: 'AI Quality Improvements',
    priority: 'High',
    sections: [
      {
        title: 'Memory System',
        subtitle: 'Current: Last 50 Messages → Need: Conversation → Summarizer → Memory → Future Chats',
        items: [
          'Conversation Summaries',
          'User Memory',
          'Organization Memory',
          'Memory Search',
          'Memory Settings',
        ],
      },
      {
        title: 'Better RAG',
        subtitle: 'Current: Query → Embedding → Vector Search → Need: Query → Vector Search → Reranker → Top Results',
        items: [
          'BGE Reranker',
          'Hybrid Search',
          'Query Expansion',
          'Source Citations',
          'Confidence Score',
        ],
      },
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Features Customers Want',
    priority: 'High',
    sections: [
      {
        title: 'Shared Inbox',
        subtitle: 'WhatsApp + Telegram + Discord + Website → One Inbox',
        items: [
          'Unified Inbox',
          'Agent Assignment',
          'Conversation Status',
          'Tags',
          'Notes',
        ],
      },
      {
        title: 'Human Handoff',
        items: [
          'Assign Human Agent',
          'Transfer Conversation',
          'Mention Team Member',
          'Internal Notes',
          'Human/AI Toggle',
        ],
      },
      {
        title: 'Analytics V2',
        subtitle: 'Current analytics weak — add:',
        items: [
          'Resolution Rate',
          'Satisfaction Score',
          'Response Time',
          'Cost Tracking',
          'Agent Performance',
          'Popular Questions',
          'Failed Questions',
          'Retention',
        ],
      },
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Premium Features',
    priority: 'Medium',
    sections: [
      {
        title: 'Prompt Versioning',
        items: [
          'Version History',
          'Rollback',
          'Compare Versions',
          'Draft Mode',
        ],
      },
      {
        title: 'Agent Templates',
        subtitle: 'Customer Support · Sales · SaaS · Ecommerce · Real Estate · HR',
        items: [
          'Customer Support Agent',
          'Sales Agent',
          'SaaS Agent',
          'Ecommerce Agent',
          'Real Estate Agent',
          'HR Agent',
        ],
      },
      {
        title: 'Marketplace',
        items: [
          'Agent Templates Marketplace',
          'MCP Marketplace',
          'Tool Marketplace',
        ],
      },
    ],
  },
  {
    phase: 'Phase 5',
    title: 'Multi-Agent System',
    priority: 'Medium',
    subtitle: 'Biggest differentiator — Manager → Research → RAG → Writer → Final Response',
    sections: [
      {
        title: '',
        items: [
          'Agent-to-Agent Communication',
          'Agent Teams',
          'Agent Workflows',
          'Supervisor Agent',
        ],
      },
    ],
  },
  {
    phase: 'Phase 6',
    title: 'Voice AI',
    priority: 'Very High Value',
    sections: [
      {
        title: '',
        items: [
          'Voice Input',
          'Voice Output',
          'Realtime Voice',
          'Twilio Voice',
          'ElevenLabs',
          'Live Phone Agent',
        ],
      },
    ],
  },
  {
    phase: 'Phase 7',
    title: 'Enterprise',
    priority: 'Low',
    sections: [
      {
        title: '',
        items: [
          'Advanced Audit Logs',
          'SOC2 Preparation',
          'SAML Improvements',
          'API Keys',
          'Webhooks',
          'White Label',
        ],
      },
    ],
  },
]

const notBuilding = [
  'Knowledge Graph RAG',
  'Agentic RAG',
  'Generative UI',
  'AI Image Generation',
  'Video Generation',
  'Custom LLM Training',
  'Blockchain Stuff 😆',
]

export default function RoadmapPage() {
  return (
    <div>
      <DocHeading as="h1">Product Roadmap</DocHeading>
      <p className="text-muted-foreground leading-relaxed mb-8">
        Founder-led roadmap. Foundation first: infrastructure, quality, and
        reliability before new features. No random feature drops until the base
        is solid.
      </p>

      <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm">
        <span className="size-2 rounded-full bg-green-500" />
        Exact build order: 1 → 2 → 3 → 4 → 5 → 6 → 7
      </div>

      <div className="space-y-10">
        {phases.map((phase) => (
          <div key={phase.phase} className="rounded-xl border p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {phase.phase}
              </span>
              <span className="text-lg font-semibold">{phase.title}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {phase.priority}
              </span>
            </div>

            {phase.timeline && (
              <p className="text-sm text-muted-foreground mb-4">
                Timeline: {phase.timeline}
              </p>
            )}

            {phase.subtitle && (
              <p className="text-sm text-muted-foreground mb-4">
                {phase.subtitle}
              </p>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              {phase.sections.map((section) => (
                <div key={section.title}>
                  {section.title && (
                    <p className="text-sm font-medium mb-2">{section.title}</p>
                  )}
                  {section.subtitle && (
                    <p className="text-xs text-muted-foreground mb-2 leading-relaxed">
                      {section.subtitle}
                    </p>
                  )}
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-primary/60 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-dashed p-6">
        <p className="text-sm font-medium mb-3">Features NOT To Build Yet ❌</p>
        <p className="text-xs text-muted-foreground mb-3">
          Don&apos;t waste time on these yet:
        </p>
        <div className="flex flex-wrap gap-2">
          {notBuilding.map((item) => (
            <span
              key={item}
              className="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}