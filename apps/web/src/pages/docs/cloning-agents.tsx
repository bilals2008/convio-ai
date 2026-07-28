import { Link } from 'react-router-dom'
import { ArrowRight, Copy, GitBranch, Layers, AlertTriangle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function CloningAgentsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Cloning & Versioning' },
        ]}
        title="Cloning & Versioning Agents"
        description="Duplicate agent configurations to create variations, test changes safely, or manage iterations without losing your original setup."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Cloning creates an exact copy of an agent — same system prompt, model, tools, knowledge base connections, and settings. The clone starts in Draft status regardless of the original's status, so you can modify it without affecting the live agent.
      </p>

      <h2 id="cloning-an-agent">Cloning an Agent</h2>
      <ol>
        <li>Navigate to <strong>Agents</strong> in the dashboard</li>
        <li>Find the agent you want to clone</li>
        <li>Click the <strong>⋯</strong> menu and select <strong>Clone</strong></li>
        <li>Enter a new name for the cloned agent</li>
        <li>Click <strong>Clone</strong></li>
      </ol>
      <p>
        The cloned agent appears in your agents list with "(Copy)" appended to the name. It's in Draft status and ready to modify.
      </p>

      <h2 id="when-to-clone">When to Clone vs Create New</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Copy}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Clone When..."
          description="You want a variation of an existing agent — same structure, different prompt or model. Saves time reconfiguring tools and knowledge bases."
          href="#clone-when"
        />
        <DocFeatureCard
          icon={Layers}
          iconBg="bg-muted"
          iconColor="text-muted-foreground"
          title="Create New When..."
          description="You need a fundamentally different agent — different use case, different tools, or different channel configuration."
          href="#create-new-when"
        />
      </DocCardGrid>

      <h3 id="clone-when">Clone When</h3>
      <ul>
        <li><strong>A/B testing prompts:</strong> Clone an active agent, change the prompt, and test the clone in the Playground while the original stays live</li>
        <li><strong>Per-channel variants:</strong> Clone an agent to create channel-specific versions — one for WhatsApp with shorter responses, one for web with longer explanations</li>
        <li><strong>Safe iteration:</strong> Want to experiment with a new model or tools? Clone first so you can revert to the original if the experiment fails</li>
        <li><strong>Multi-language support:</strong> Clone an agent and translate the prompt for different languages</li>
      </ul>

      <h3 id="create-new-when">Create New When</h3>
      <ul>
        <li>Different use case entirely (support vs sales vs onboarding)</li>
        <li>Different knowledge base requirements</li>
        <li>Different tool configurations</li>
        <li>No similarity to any existing agent</li>
      </ul>

      <h2 id="versioning">Managing Iterations</h2>
      <p>
        Convio doesn't have a formal versioning system, but you can manage iterations effectively with a naming convention:
      </p>

      <h3 id="naming-convention">Suggested Naming Convention</h3>
      <div className="rounded-lg border border-border/60 bg-card p-4 my-4 font-mono text-[12px] leading-relaxed text-muted-foreground whitespace-pre-wrap">
{`Support Agent v1          — original, active
Support Agent v2 — shorter — iteration with shorter responses
Support Agent v2 — final   — approved version
Support Agent backup       — clone of v1 before changes`}</div>

      <DocCallout variant="info" icon={GitBranch} title="Keep inactive clones as backups">
        If you clone an agent to experiment, don't delete the clone even if the experiment fails. Rename it with a "backup" suffix. This gives you a history of what you tried and a rollback point if needed.
      </DocCallout>

      <h2 id="what-gets-cloned">What Gets Cloned</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Item</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Cloned?</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Agent name</td>
              <td className="py-2">Copied (appends "Copy")</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">System prompt</td>
              <td className="py-2">Yes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Model selection</td>
              <td className="py-2">Yes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Temperature & settings</td>
              <td className="py-2">Yes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Tools</td>
              <td className="py-2">Yes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Knowledge base connections</td>
              <td className="py-2">Yes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Welcome message</td>
              <td className="py-2">Yes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Suggested replies</td>
              <td className="py-2">Yes</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Status</td>
              <td className="py-2">No — always starts as Draft</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Channel connections</td>
              <td className="py-2">No — channels must be reconnected</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Conversation history</td>
              <td className="py-2">No — clone is a fresh agent</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCallout variant="warning" icon={AlertTriangle} title="Channels don't clone">
        A cloned agent won't automatically appear on the same channels as the original. You need to connect channels manually after cloning. This prevents accidental deployment of untested agents.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Copy}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agent Statuses"
          href="/docs/agent-statuses"
        />
        <DocNextStepCard
          icon={GitBranch}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Testing in the Playground"
          href="/docs/agent-playground"
        />
      </DocCardGrid>
    </DocContent>
  )
}
