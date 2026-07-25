import { Link } from 'react-router-dom'
import { Circle, Clock, CheckCircle, Archive, Lock } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ConversationStatusesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Conversation Statuses' },
        ]}
        title="Conversation Statuses"
        description="Statuses track where a conversation sits in its lifecycle. Each status controls visibility in the dashboard, agent behavior, and analytics reporting."
      />

      <h2 id="statuses">Status Overview</h2>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={Circle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Active"
          description="Live conversation. The agent is responding or a human agent is engaged. Visible in the main conversations list."
          href="#active"
        />
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Waiting"
          description="Escalated to a human agent. The AI has stepped back and the conversation is queued for human response."
          href="#waiting"
        />
        <DocFeatureCard
          icon={CheckCircle}
          iconBg="bg-success/10"
          iconColor="text-success"
          title="Resolved"
          description="The issue has been addressed. The conversation is closed but remains accessible for reference."
          href="#resolved"
        />
      </DocCardGrid>

      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Archive}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Closed"
          description="Archived from the active view. Retained for analytics and history but hidden from the default conversation list."
          href="#closed"
        />
        <DocFeatureCard
          icon={Lock}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Archived"
          description="Long-term storage. Fully hidden from the dashboard. Accessible via search and the archive filter only."
          href="#archived"
        />
      </DocCardGrid>

      <h2 id="active">Active</h2>
      <p>
        Active is the default status for conversations with ongoing engagement. When a conversation is Active:
      </p>
      <ul>
        <li>The AI agent responds to incoming messages normally</li>
        <li>The conversation appears at the top of the conversations list</li>
        <li>Human agents can see it in their queue (if assigned)</li>
        <li>Analytics count it as an open conversation</li>
      </ul>

      <DocCallout variant="info" icon={Circle} title="Auto-active">
        Conversations automatically move to Active when the agent sends its first response. No manual action needed.
      </DocCallout>

      <h2 id="waiting">Waiting</h2>
      <p>
        A conversation enters Waiting status when it has been escalated to a human agent. In this state:
      </p>
      <ul>
        <li>The AI agent stops responding — it has handed off control</li>
        <li>The conversation appears in the human agent queue with a "Waiting" badge</li>
        <li>The waiting timer shows how long the user has been waiting</li>
        <li>If no human responds within the configured timeout, the AI may resume (configurable)</li>
      </ul>

      <DocCallout variant="warning" icon={Clock} title="Monitor wait times">
        Long wait times in Waiting status correlate with user abandonment. Set up alerts for conversations waiting longer than your SLA threshold.
      </DocCallout>

      <h2 id="resolved">Resolved</h2>
      <p>
        Resolved means the conversation's purpose has been fulfilled. It can be resolved by:
      </p>
      <ul>
        <li><strong>Agent action:</strong> The AI agent determines the issue is addressed and marks it resolved</li>
        <li><strong>Human action:</strong> A human agent closes the conversation from the dashboard</li>
        <li><strong>Timeout:</strong> Configurable inactivity timeout resolves conversations after no activity</li>
        <li><strong>User action:</strong> The user explicitly ends the conversation (channel-dependent)</li>
      </ul>

      <h3 id="resolved-implications">What Happens on Resolution</h3>
      <ul>
        <li>The conversation moves out of the active list</li>
        <li>Token usage for the conversation is finalized</li>
        <li>Analytics record the resolution time and outcome</li>
        <li>The conversation can be reopened by sending a new message (creates a new status cycle)</li>
      </ul>

      <h2 id="closed">Closed</h2>
      <p>
        Closed is an intermediate state between Resolved and Archived. In this state:
      </p>
      <ul>
        <li>The conversation is hidden from the default conversations view</li>
        <li>It remains accessible via the "Closed" filter or search</li>
        <li>Analytics still count it in historical reports</li>
        <li>No new messages can be added — the thread is sealed</li>
      </ul>

      <h2 id="archived">Archived</h2>
      <p>
        Archived is the final state for conversations. They are:
      </p>
      <ul>
        <li>Completely hidden from the dashboard UI</li>
        <li>Retained in the database for compliance and analytics</li>
        <li>Accessible via the API and export tools</li>
        <li>Not counted in real-time metrics or active conversation counts</li>
      </ul>

      <DocCallout variant="tip" icon={Archive} title="Retention policy">
        Configure your retention period in <strong>Settings → Data Retention</strong>. Default is 90 days from resolution. Conversations older than the retention period are permanently deleted.
      </DocCallout>

      <h2 id="transitions">Status Transitions</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">From</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">To</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Trigger</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">New</td>
              <td className="py-2 pr-4">Active</td>
              <td className="py-2">First agent or human reply</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Active</td>
              <td className="py-2 pr-4">Waiting</td>
              <td className="py-2">Escalation to human agent</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Waiting</td>
              <td className="py-2 pr-4">Active</td>
              <td className="py-2">Human agent responds</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Active</td>
              <td className="py-2 pr-4">Resolved</td>
              <td className="py-2">Agent closes, human closes, or inactivity timeout</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Waiting</td>
              <td className="py-2 pr-4">Resolved</td>
              <td className="py-2">Human agent closes or timeout with no response</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Resolved</td>
              <td className="py-2 pr-4">Closed</td>
              <td className="py-2">Automatic after configured period</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Closed</td>
              <td className="py-2 pr-4">Archived</td>
              <td className="py-2">Automatic after retention period</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Resolved / Closed</td>
              <td className="py-2 pr-4">Active</td>
              <td className="py-2">User sends a new message (reopen)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={CheckCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Resolving & Archiving"
          href="/docs/resolving-conversations"
        />
        <DocNextStepCard
          icon={Clock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Viewing Conversations"
          href="/docs/viewing-conversations"
        />
      </DocCardGrid>
    </DocContent>
  )
}
