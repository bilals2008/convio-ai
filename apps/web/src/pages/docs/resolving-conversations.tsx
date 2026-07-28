import { Link } from 'react-router-dom'
import { CheckCircle, Archive, RotateCcw, BarChart3 } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ResolvingConversationsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Resolving & Archiving' },
        ]}
        title="Resolving & Archiving Conversations"
        description="Know when to resolve a conversation, how to archive old threads, and what happens to your analytics when conversations are closed."
      />

      <h2 id="when-to-resolve">When to Resolve</h2>
      <p>
        A conversation should be resolved when its purpose has been fulfilled. Resolve when:
      </p>
      <ul>
        <li><strong>The user's question is answered:</strong> They confirmed the solution works or the information is what they needed</li>
        <li><strong>The issue is fixed:</strong> A bug was reported, investigated, and resolved</li>
        <li><strong>The request is completed:</strong> An order was placed, a demo was scheduled, or a change was made</li>
        <li><strong>The user goes silent:</strong> After a configurable inactivity period, the conversation auto-resolves</li>
        <li><strong>Escalation is handled:</strong> The conversation was handed to a human agent who resolved it</li>
      </ul>

      <DocCallout variant="warning" icon={CheckCircle} title="Don't resolve prematurely">
        Resolving a conversation before the user confirms satisfaction can hurt your CSAT scores. Always wait for explicit confirmation or a reasonable inactivity window.
      </DocCallout>

      <h2 id="how-to-resolve">How to Resolve</h2>
      <p>
        Conversations can be resolved in three ways:
      </p>

      <h3 id="manual-resolution">Manual Resolution</h3>
      <p>
        A human agent clicks the <strong>Resolve</strong> button in the conversation view. This immediately closes the conversation and moves it to Resolved status.
      </p>

      <h3 id="agent-resolution">Agent Resolution</h3>
      <p>
        The AI agent can resolve conversations automatically when configured to do so. Common triggers:
      </p>
      <ul>
        <li>The agent detects the issue is addressed (sentiment analysis)</li>
        <li>The user says "thanks" or "that works" after receiving an answer</li>
        <li>The conversation reaches the maximum number of turns (configurable)</li>
      </ul>

      <h3 id="auto-resolution">Inactivity Timeout</h3>
      <p>
        Configure an inactivity timeout in <strong>Settings → Conversations</strong>. If no messages are exchanged within the timeout period, the conversation auto-resolves. Default is 24 hours.
      </p>

      <h2 id="how-to-archive">How to Archive</h2>
      <p>
        Archiving moves conversations out of the active view entirely. Archive manually or let the retention policy handle it:
      </p>

      <h3 id="manual-archive">Manual Archiving</h3>
      <p>
        Select conversations from the list and click <strong>Archive</strong> in the bulk actions bar. Archived conversations are immediately hidden from the default view.
      </p>

      <h3 id="auto-archive">Automatic Archiving</h3>
      <p>
        Configure automatic archiving in <strong>Settings → Data Retention</strong>:
      </p>
      <ul>
        <li><strong>Archive after resolution:</strong> Auto-archive X days after a conversation is resolved</li>
        <li><strong>Archive after inactivity:</strong> Auto-archive X days after the last message</li>
        <li><strong>Permanent deletion:</strong> Delete archived conversations after X days (default: 90 days)</li>
      </ul>

      <DocCallout variant="tip" icon={Archive} title="Retention compliance">
        If your industry requires conversation records for compliance (healthcare, finance, legal), set a longer retention period and disable permanent deletion.
      </DocCallout>

      <h2 id="reopening">Reopening Conversations</h2>
      <p>
        A resolved or closed conversation can be reopened when:
      </p>
      <ul>
        <li>The user sends a new message on the same channel</li>
        <li>A human agent manually reopens from the conversation view</li>
        <li>A new conversation is created on a different channel (creates a separate thread)</li>
      </ul>

      <h3 id="reopen-behavior">Reopen Behavior</h3>
      <ul>
        <li>The conversation returns to Active status</li>
        <li>The full message history is preserved</li>
        <li>Analytics record the reopen event</li>
        <li>The conversation is no longer counted as "resolved" in reports (it becomes "reopened")</li>
      </ul>

      <DocCallout variant="info" icon={RotateCcw} title="Reopen rate is a metric">
        High reopen rates indicate premature resolution or incomplete answers. Track this metric to improve agent performance and resolution quality.
      </DocCallout>

      <h2 id="analytics-impact">Impact on Analytics</h2>
      <p>
        Resolution and archiving directly affect your analytics:
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Metric</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Impact of Resolution</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Impact of Archiving</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Resolution Time</td>
              <td className="py-2 pr-4">Finalized — included in average resolution time</td>
              <td className="py-2">No change</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Active Conversations</td>
              <td className="py-2 pr-4">Decremented immediately</td>
              <td className="py-2">No change (already resolved)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">CSAT Score</td>
              <td className="py-2 pr-4">CSAT survey triggered (if configured)</td>
              <td className="py-2">No change</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Token Usage</td>
              <td className="py-2 pr-4">Finalized — total cost locked</td>
              <td className="py-2">No change</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Conversation Reports</td>
              <td className="py-2 pr-4">Included in "resolved" counts</td>
              <td className="py-2">Excluded from default reports</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Conversation Search"
          href="/docs/conversation-search"
        />
        <DocNextStepCard
          icon={CheckCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Conversation Statuses"
          href="/docs/conversation-statuses"
        />
      </DocCardGrid>
    </DocContent>
  )
}
