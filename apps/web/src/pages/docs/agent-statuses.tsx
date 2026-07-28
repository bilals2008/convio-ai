import { Link } from 'react-router-dom'
import { ArrowRight, FileEdit, CheckCircle, PauseCircle, ArrowRightCircle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AgentStatusesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Agent Statuses' },
        ]}
        title="Agent Statuses"
        description="Every agent has a status that controls whether it's live, paused, or still being built. Understanding status transitions prevents deploying unfinished agents or accidentally taking live ones offline."
      />

      <h2 id="statuses">Status Overview</h2>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={FileEdit}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Draft"
          description="The agent is being configured. It's not accessible to end users and doesn't appear on any channel."
          href="#draft"
        />
        <DocFeatureCard
          icon={CheckCircle}
          iconBg="bg-success/10"
          iconColor="text-success"
          title="Active"
          description="The agent is live. It's serving conversations on all connected channels and responding to users."
          href="#active"
        />
        <DocFeatureCard
          icon={PauseCircle}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Inactive"
          description="The agent is paused. It's not responding to conversations but its configuration is preserved."
          href="#inactive"
        />
      </DocCardGrid>

      <h2 id="draft">Draft</h2>
      <p>
        When you create a new agent, it starts in Draft status. In this state:
      </p>
      <ul>
        <li>The agent is only accessible from the dashboard</li>
        <li>You can edit the system prompt, model, tools, and settings freely</li>
        <li>The Playground works for testing</li>
        <li>No external channels can reach the agent</li>
      </ul>

      <DocCallout variant="tip" icon={FileEdit} title="Draft is your safe space">
        Make all your changes in Draft status. Test thoroughly in the Playground before promoting to Active. Draft agents don't affect any live conversations.
      </DocCallout>

      <h2 id="active">Active</h2>
      <p>
        When you activate an agent, it goes live on all connected channels. In Active status:
      </p>
      <ul>
        <li>The agent responds to conversations on web widget, WhatsApp, Telegram, and any other connected channel</li>
        <li>You can still edit the agent, but changes take effect immediately — be careful with prompt edits on live agents</li>
        <li>Analytics and conversation logs are being recorded</li>
        <li>Token usage is being tracked against your plan</li>
      </ul>

      <DocCallout variant="warning" icon={CheckCircle} title="Test before activating">
        Always test in the Playground while in Draft status. An Active agent on a public channel is your production interface — surprises here affect real users.
      </DocCallout>

      <h2 id="inactive">Inactive</h2>
      <p>
        Deactivating an agent pauses it without deleting any configuration. In Inactive status:
      </p>
      <ul>
        <li>The agent stops responding on all channels</li>
        <li>Users who try to interact see a fallback message (configurable)</li>
        <li>All settings, tools, and knowledge base connections are preserved</li>
        <li>You can reactivate at any time — no reconfiguration needed</li>
      </ul>

      <h2 id="transitions">Status Transitions</h2>
      <p>
        Agents move between statuses based on your actions:
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">From</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">To</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Draft</td>
              <td className="py-2 pr-4">Active</td>
              <td className="py-2">Click "Activate" — agent goes live</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Active</td>
              <td className="py-2 pr-4">Inactive</td>
              <td className="py-2">Click "Deactivate" — agent pauses</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Inactive</td>
              <td className="py-2 pr-4">Active</td>
              <td className="py-2">Click "Activate" — agent resumes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Active</td>
              <td className="py-2 pr-4">Draft</td>
              <td className="py-2">Not available — deactivate first</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Inactive</td>
              <td className="py-2 pr-4">Draft</td>
              <td className="py-2">Click "Edit as Draft" — returns to draft state</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCallout variant="info" icon={ArrowRightCircle} title="Why no Active → Draft?">
        An Active agent may have ongoing conversations. Moving directly to Draft would silently disconnect those users. Deactivate first to ensure a clean transition, then edit as Draft.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={CheckCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Cloning & Versioning"
          href="/docs/cloning-agents"
        />
        <DocNextStepCard
          icon={FileEdit}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Creating an Agent"
          href="/docs/creating-agent"
        />
      </DocNextStepCard>
    </DocContent>
  )
}
