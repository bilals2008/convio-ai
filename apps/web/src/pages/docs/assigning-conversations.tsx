import { Link } from 'react-router-dom'
import { Users, Shuffle, BarChart3, MousePointerClick, Scale } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AssigningConversationsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Assigning Conversations' },
        ]}
        title="Assigning Conversations"
        description="Control how escalated conversations reach human agents — manually from the dashboard or automatically via assignment rules."
      />

      <h2 id="overview">Overview</h2>
      <p>
        When a conversation is escalated from the AI, it needs to reach a human agent. Convio supports both manual assignment (you pick the agent) and automatic assignment (rules route the conversation). Choose the method that fits your team's workflow.
      </p>

      <h2 id="manual-assignment">Manual Assignment</h2>
      <p>
        Assign conversations directly from the dashboard. This is useful for small teams or when you want to route specific conversations to specific people.
      </p>
      <ul>
        <li>Open the conversation in the dashboard</li>
        <li>Click the <strong>Assign</strong> button in the conversation header</li>
        <li>Select an agent from the dropdown (shows availability status)</li>
        <li>The agent is notified immediately and the conversation appears in their inbox</li>
      </ul>

      <DocCallout variant="info" icon={MousePointerClick} title="Bulk assignment">
        Select multiple conversations from the list view and use the bulk actions bar to assign them all to one agent. Useful when redistributing workload.
      </DocCallout>

      <h2 id="automatic-rules">Automatic Assignment Rules</h2>
      <p>
        Configure rules that route conversations automatically based on conditions you define. Rules are evaluated in order — the first matching rule applies.
      </p>

      <h3 id="rule-conditions">Rule Conditions</h3>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Condition</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Example</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Use Case</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Channel</td>
              <td className="py-2 pr-4">Channel = WhatsApp</td>
              <td className="py-2">Route WhatsApp conversations to a mobile specialist</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Topic / Tag</td>
              <td className="py-2 pr-4">Tag = billing</td>
              <td className="py-2">Send billing conversations to the finance team</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Language</td>
              <td className="py-2 pr-4">Language = Spanish</td>
              <td className="py-2">Route Spanish conversations to Spanish-speaking agents</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Priority</td>
              <td className="py-2 pr-4">Priority = Urgent</td>
              <td className="py-2">Urgent conversations go to senior agents</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="round-robin">Round-Robin Distribution</h2>
      <p>
        Round-robin assigns conversations sequentially to agents in a defined order. Each agent receives the next conversation in the queue.
      </p>
      <ul>
        <li><strong>Cyclic:</strong> Agent A → Agent B → Agent C → Agent A …</li>
        <li><strong>Skip unavailable:</strong> Agents marked offline or Do Not Disturb are skipped</li>
        <li><strong>Weighted:</strong> Assign weights to agents (e.g., senior agent gets 2x more) for uneven distribution</li>
      </ul>

      <DocCallout variant="tip" icon={Shuffle} title="Start simple">
        Round-robin is the best default for most teams. It distributes evenly without configuration overhead. Switch to skill-based routing only when you have clear specialization needs.
      </DocCallout>

      <h2 id="load-balancing">Load Balancing</h2>
      <p>
        Load balancing distributes conversations based on current workload rather than a fixed order. Convio tracks active conversations per agent and routes to the least-loaded agent.
      </p>
      <ul>
        <li><strong>Active count:</strong> Route to the agent with the fewest active conversations</li>
        <li><strong>Capacity limits:</strong> Set a maximum active conversation count per agent; agents at capacity are skipped</li>
        <li><strong>Priority weighting:</strong> Urgent conversations go to agents with more available capacity</li>
      </ul>

      <DocCallout variant="warning" icon={Scale} title="Capacity planning">
        Set realistic capacity limits. Too high and agents get overwhelmed; too low and conversations queue unnecessarily. Start with 5-10 active conversations per agent and adjust based on response times.
      </DocCallout>

      <h2 id="routing-priority">Routing Priority</h2>
      <p>
        When multiple rules match, priority determines which one applies. Configure routing priority in <strong>Settings → Handoff → Routing</strong>:
      </p>
      <ol>
        <li>Explicit assignment rules (highest priority)</li>
        <li>Skill-based routing rules</li>
        <li>Load-balanced fallback</li>
        <li>Round-robin default (lowest priority)</li>
      </ol>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="The Human Agent Inbox"
          href="/docs/agent-inbox"
        />
        <DocNextStepCard
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Conversation Statuses"
          href="/docs/conversation-statuses"
        />
      </DocCardGrid>
    </DocContent>
  )
}
