import { AlertTriangle, BarChart3, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function UsageLimitsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Usage Limits' },
        ]}
        title="Understanding Usage Limits"
        description="Learn how usage limits work across agents, messages, and organization resources."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Every Convio plan has usage limits that control how many agents, messages, and resources you can use. Limits reset at the start of each monthly billing cycle. Understanding these limits helps you plan your usage and avoid unexpected interruptions.
      </p>

      <h2 id="agent-limits">Agent Limits</h2>
      <p>
        Agent limits define the maximum number of active agents in your organization. Each plan has a different cap:
      </p>
      <ul>
        <li><strong>Free:</strong> 1 agent</li>
        <li><strong>Pro:</strong> 10 agents</li>
        <li><strong>Business:</strong> 50 agents</li>
        <li><strong>Enterprise:</strong> Unlimited (custom)</li>
      </ul>
      <p>
        You can create agents freely, but only the number allowed by your plan can be active simultaneously. Deactivating an agent frees up a slot.
      </p>

      <h2 id="message-quotas">Message Quotas</h2>
      <p>
        Messages are counted per billing cycle. A "message" is one conversation turn — a user message plus the agent's response. Your quota depends on your plan:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="How counting works"
          description="Each user message and each agent response counts as one message toward your monthly quota."
        />
        <DocFeatureCard
          icon={BarChart3}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="What doesn't count"
          description="Internal system messages, tool calls, and webhook-triggered messages do not count toward your quota."
        />
      </DocCardGrid>

      <h2 id="org-limits">Organization Limits</h2>
      <p>
        Beyond agents and messages, your plan limits other organizational resources:
      </p>
      <ul>
        <li><strong>Team members:</strong> The number of users who can access your organization.</li>
        <li><strong>Knowledge bases:</strong> The number of knowledge bases you can create.</li>
        <li><strong>Channels:</strong> The number of connected channels (web, WhatsApp, Slack, etc.).</li>
        <li><strong>Documents per KB:</strong> The maximum documents per knowledge base.</li>
      </ul>

      <h2 id="when-limits-hit">What Happens When You Hit a Limit</h2>
      <p>
        When you reach a limit, Convio handles it gracefully:
      </p>
      <ul>
        <li><strong>Agent limit reached:</strong> You cannot activate additional agents. Existing agents continue working normally.</li>
        <li><strong>Message quota reached:</strong> Agents stop responding to new messages. They resume automatically when the billing cycle resets.</li>
        <li><strong>Member limit reached:</strong> You cannot invite new members until someone leaves or you upgrade.</li>
        <li><strong>Knowledge base limit reached:</strong> You cannot create new knowledge bases. Existing ones continue working.</li>
      </ul>

      <DocCallout variant="warning" icon={AlertTriangle} title="No data loss">
        Hitting a limit never deletes your data. Agents, conversations, and knowledge bases remain intact. The limit only prevents new activity until the cycle resets or you upgrade.
      </DocCallout>

      <h2 id="checking-usage">Checking Your Current Usage</h2>
      <p>
        View your current usage in the dashboard:
      </p>
      <ol>
        <li>Go to <strong>Settings → Billing</strong> in your organization.</li>
        <li>The usage panel shows your current consumption against each limit.</li>
        <li>A progress bar indicates how close you are to each limit.</li>
        <li>The billing cycle end date is displayed at the top.</li>
      </ol>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="View Your Plan"
          href="/docs/viewing-plan"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-info/10"
          iconColor="text-info"
          title="Upgrade Your Plan"
          href="/docs/upgrading-plan"
        />
      </DocCardGrid>
    </DocContent>
  )
}
