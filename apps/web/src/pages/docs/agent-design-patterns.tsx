import { Bot, Users, Database, GitBranch, Layers, ArrowRight, Lightbulb } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AgentDesignPatternsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Best Practices', href: '/docs' },
          { label: 'Agent Design Patterns' },
        ]}
        title="Agent Design Patterns"
        description="Decide when to use one agent vs. many, how to specialize them, and how to compose them effectively."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The most common architectural question in Convio is: "Should I build one agent or many?" The answer depends on your use case, knowledge boundaries, and operational complexity. This guide covers the main design patterns and when to use each.
      </p>

      <h2 id="single-vs-many">One Agent vs. Many</h2>
      <p>
        Start with a single agent. Split only when you hit a clear boundary that makes a single agent impractical:
      </p>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Bot}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Single Agent"
          description="One agent with one system prompt, one knowledge base, and one deployment. Best for focused use cases — a single product, a single team, or a single channel."
          href="#"
        />
        <DocFeatureCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Multiple Agents"
          description="Separate agents for different domains, teams, or channels. Best when knowledge bases conflict, teams have different workflows, or channels need different behavior."
          href="#"
        />
      </DocCardGrid>

      <p className="mt-4">
        Split when you observe one of these signals:
      </p>
      <ul>
        <li><strong>Conflicting knowledge:</strong> Two domains have overlapping but contradictory information that's difficult to reconcile in a single knowledge base.</li>
        <li><strong>Different tools:</strong> Two workflows need entirely different tool sets, and including all tools in one agent adds unnecessary complexity.</li>
        <li><strong>Team ownership:</strong> Different teams own different agent behaviors and need independent control over prompts and knowledge.</li>
        <li><strong>Performance:</strong> A single agent's knowledge base is too large for efficient retrieval. Splitting by topic improves relevance.</li>
      </ul>

      <DocCallout variant="tip" icon={Lightbulb} title="Start unified, split when needed">
        A single agent with a well-organized knowledge base outperforms multiple poorly maintained agents. Only split when the operational overhead of a single agent becomes a real bottleneck.
      </DocCallout>

      <h2 id="specialization">Agent Specialization</h2>
      <p>
        When you do split, specialize each agent around a clear responsibility:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Pattern</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Description</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Example</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Domain-Specific</td>
              <td className="py-2 pr-4">Each agent handles a product area or topic</td>
              <td className="py-2">Billing agent, technical support agent, sales agent</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Channel-Specific</td>
              <td className="py-2 pr-4">Each agent is tuned for a channel's constraints</td>
              <td className="py-2">WhatsApp agent (short responses), web agent (detailed answers)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Role-Specific</td>
              <td className="py-2 pr-4">Each agent serves a user persona</td>
              <td className="py-2">New customer agent, power user agent, admin agent</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Task-Specific</td>
              <td className="py-2 pr-4">Each agent performs a focused task</td>
              <td className="py-2">Lead qualification agent, appointment booking agent, FAQ agent</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="shared-vs-isolated">Shared vs. Isolated Knowledge</h2>
      <p>
        When multiple agents need overlapping information, you have two options:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Database}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Shared Knowledge Base"
          description="One knowledge base linked to multiple agents. Changes propagate automatically. Best when agents share 70%+ of their knowledge."
          href="#"
        />
        <DocFeatureCard
          icon={Layers}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Isolated Knowledge Bases"
          description="Each agent has its own knowledge base. Full control over content per agent. Best when agents have mostly distinct knowledge domains."
          href="#"
        />
      </DocCardGrid>

      <DocCallout variant="info" icon={Database} title="Hybrid approach">
        Use a shared base for common content (company info, policies) and agent-specific knowledge bases for domain content. This avoids duplication while keeping domain expertise focused.
      </DocCallout>

      <h2 id="composition">Agent Composition Patterns</h2>
      <p>
        For complex workflows, compose agents to work together:
      </p>
      <ul>
        <li><strong>Triage pattern:</strong> A front-line agent handles simple queries directly and routes complex ones to specialized agents. This keeps most conversations fast while ensuring complex issues get expert attention.</li>
        <li><strong>Pipeline pattern:</strong> Agents pass conversations through a sequence — qualification → technical support → escalation. Each agent handles its stage and passes the result forward.</li>
        <li><strong>Fan-out pattern:</strong> A coordinator agent dispatches tasks to multiple specialist agents in parallel and aggregates results. Useful for queries that span multiple domains.</li>
      </ul>

      <DocCallout variant="warning" icon={GitBranch} title="Keep composition simple">
        Multi-agent orchestration adds latency and complexity. Start with a single agent and only introduce composition when a single agent demonstrably can't handle your workload.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Bot}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Creating an Agent"
          href="/docs/creating-agent"
        />
        <DocNextStepCard
          icon={GitBranch}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Human Handoff"
          href="/docs/human-handoff"
        />
      </DocCardGrid>
    </DocContent>
  )
}
