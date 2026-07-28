import { Link } from 'react-router-dom'
import { LayoutDashboard, Settings, MessageCircle, Bot, Hash, Send, Globe, Code, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ManagingDeploymentsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Managing Multiple Deployments' },
        ]}
        title="Managing Multiple Deployments"
        description="Deploy one agent across all channels. Maintain consistent behavior, apply channel-specific overrides, and monitor everything from the dashboard."
      />

      <h2 id="overview">One Agent, All Channels</h2>
      <p>
        The power of Convio's architecture is that a single agent serves every channel. Your system prompt, model, tools, and knowledge base are configured once and shared across all deployments. Users on WhatsApp, Telegram, Discord, and Slack all interact with the same agent.
      </p>

      <DocCallout variant="tip" icon={LayoutDashboard} title="Single source of truth">
        Update your agent's system prompt once, and every deployment reflects the change instantly. No need to sync configurations across channels.
      </DocCallout>

      <h2 id="consistent-behavior">Consistent Behavior</h2>
      <p>
        Consistency means the same agent produces the same quality of response regardless of channel. Convio maintains this by:
      </p>
      <ul>
        <li><strong>Shared configuration:</strong> System prompt, model, temperature, and tools are identical across deployments</li>
        <li><strong>Shared knowledge base:</strong> All deployments reference the same knowledge sources</li>
        <li><strong>Shared conversation history:</strong> When a user contacts the agent on multiple channels, the context is linked</li>
        <li><strong>Shared analytics:</strong> Metrics aggregate across all channels for a complete view</li>
      </ul>

      <h2 id="channel-overrides">Channel-Specific Overrides</h2>
      <p>
        While the core agent is shared, some adjustments are channel-specific:
      </p>
      <ul>
        <li><strong>Response length:</strong> Shorter responses for character-limited channels like Discord</li>
        <li><strong>Formatting:</strong> Markdown for Discord/Slack, plain text or limited formatting for WhatsApp</li>
        <li><strong>Media handling:</strong> Channels without media support can receive text-only alternatives</li>
        <li><strong>Welcome message:</strong> Different greeting text per channel (e.g., "Welcome to our Discord!" vs "Hi on WhatsApp!")</li>
      </ul>

      <h3 id="override-config">Configuring Overrides</h3>
      <p>
        Channel overrides are set per deployment in the deployment settings. They modify the agent's behavior without changing the core configuration:
      </p>
      <ol>
        <li>Open the deployment you want to customize</li>
        <li>Navigate to <strong>Channel Overrides</strong></li>
        <li>Configure the specific overrides for that channel</li>
        <li>Save — changes take effect immediately</li>
      </ol>

      <h2 id="deployment-dashboard">Deployment Dashboard</h2>
      <p>
        The deployment dashboard provides a unified view of all your deployments:
      </p>

      <h3 id="dashboard-overview">Overview Panel</h3>
      <ul>
        <li><strong>Total deployments:</strong> Count of active, paused, and errored deployments</li>
        <li><strong>Messages today:</strong> Aggregate message count across all channels</li>
        <li><strong>Average response time:</strong> Mean response time across all channels</li>
        <li><strong>Error rate:</strong> Percentage of failed message deliveries</li>
      </ul>

      <h3 id="dashboard-list">Deployment List</h3>
      <p>
        Each deployment is listed with:
      </p>
      <ul>
        <li><strong>Channel icon:</strong> Visual indicator of the channel type</li>
        <li><strong>Deployment name:</strong> Your custom label</li>
        <li><strong>Agent name:</strong> The agent this deployment serves</li>
        <li><strong>Status:</strong> Color-coded indicator (green/yellow/red/gray)</li>
        <li><strong>Messages today:</strong> Message count for this specific deployment</li>
        <li><strong>Quick actions:</strong> Pause, resume, or open settings</li>
      </ul>

      <h2 id="bulk-operations">Bulk Operations</h2>
      <p>
        Manage multiple deployments efficiently:
      </p>
      <ul>
        <li><strong>Pause all:</strong> Temporarily disable all deployments (useful during maintenance)</li>
        <li><strong>Update agent:</strong> Change the agent assigned to multiple deployments at once</li>
        <li><strong>Export config:</strong> Export deployment configurations for backup or replication</li>
      </ul>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Settings}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Deployment Statuses"
          href="/docs/deployment-statuses"
        />
        <DocNextStepCard
          icon={MessageCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Channel-Specific Behavior"
          href="/docs/channel-behavior"
        />
      </DocCardGrid>
    </DocContent>
  )
}
