import { Link } from 'react-router-dom'
import { Inbox, Filter, MessageSquare, Clock, Search } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AgentInboxPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'The Human Agent Inbox' },
        ]}
        title="The Human Agent Inbox"
        description="Where human agents view, manage, and respond to conversations escalated from the AI."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The Agent Inbox is your team's command center for human-handled conversations. It shows all assigned conversations, their status, priority, and wait time. Access it from the dashboard sidebar under <strong>Inbox</strong>.
      </p>

      <h2 id="viewing-conversations">Viewing Assigned Conversations</h2>
      <p>
        The inbox displays conversations assigned to you (or all conversations if you have team-lead permissions). Each conversation card shows:
      </p>
      <ul>
        <li><strong>User name or identifier:</strong> Who the conversation is with</li>
        <li><strong>Channel:</strong> Where the message came from (WhatsApp, web, Telegram, etc.)</li>
        <li><strong>Last message preview:</strong> Snippet of the most recent message</li>
        <li><strong>Wait time:</strong> How long since the last human response</li>
        <li><strong>Priority:</strong> Urgent, high, normal, or low</li>
        <li><strong>Escalation reason:</strong> Why it was handed off from the AI</li>
      </ul>

      <h2 id="conversation-queue">Conversation Queue</h2>
      <p>
        Conversations are ordered by a combination of priority and wait time. The default sort puts the most urgent, longest-waiting conversations at the top.
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Priority</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Color</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">SLA Target</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">When Assigned</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Urgent</td>
              <td className="py-2 pr-4">Red</td>
              <td className="py-2 pr-4">Under 5 minutes</td>
              <td className="py-2">Compliance issues, legal requests, active outages</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">High</td>
              <td className="py-2 pr-4">Orange</td>
              <td className="py-2 pr-4">Under 15 minutes</td>
              <td className="py-2">Billing disputes, emotional escalation, VIP users</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Normal</td>
              <td className="py-2 pr-4">Blue</td>
              <td className="py-2 pr-4">Under 1 hour</td>
              <td className="py-2">Standard handoffs, complex questions</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Low</td>
              <td className="py-2 pr-4">Gray</td>
              <td className="py-2 pr-4">Under 4 hours</td>
              <td className="py-2">Non-urgent follow-ups, informational requests</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="priority-filtering">Priority Filtering</h2>
      <p>
        Filter the inbox by priority, channel, escalation reason, or agent. Use the filter bar at the top of the inbox:
      </p>
      <ul>
        <li><strong>My conversations:</strong> Only show conversations assigned to you</li>
        <li><strong>Unassigned:</strong> Show conversations not yet picked up</li>
        <li><strong>By priority:</strong> Filter to Urgent, High, Normal, or Low</li>
        <li><strong>By channel:</strong> Show only WhatsApp, web widget, or other channels</li>
        <li><strong>By tag:</strong> Filter by conversation tags (billing, technical, etc.)</li>
      </ul>

      <DocCallout variant="tip" icon={Filter} title="Saved filters">
        Save your most-used filter combinations as presets. Click the filter bar, configure your filters, and click "Save as Preset" to reuse them instantly.
      </DocCallout>

      <h2 id="response-interface">Response Interface</h2>
      <p>
        Click any conversation to open the response interface. It includes:
      </p>
      <ul>
        <li><strong>Full conversation history:</strong> Every message from both the AI and the user, with timestamps</li>
        <li><strong>Context panel:</strong> User metadata, previous conversations, and AI agent context</li>
        <li><strong>Quick actions:</strong> Resolve, reassign, tag, or add internal notes</li>
        <li><strong>Message composer:</strong> Type your response with rich text support</li>
        <li><strong>Internal notes:</strong> Add private notes visible only to your team</li>
      </ul>

      <DocCallout variant="info" icon={MessageSquare} title="AI context preserved">
        The human agent sees a summary of the AI conversation above the message history. This includes what the user needed, what the AI tried, and why the handoff occurred.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Clock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Taking Over from the AI"
          href="/docs/taking-over"
        />
        <DocNextStepCard
          icon={Inbox}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Returning to AI"
          href="/docs/returning-to-ai"
        />
      </DocCardGrid>
    </DocContent>
  )
}
