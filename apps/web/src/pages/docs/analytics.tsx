import { BarChart3, Users, MessageCircle, TrendingUp, ArrowRight, Activity, Clock, Zap } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AnalyticsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Analytics Overview' },
        ]}
        title="Analytics & Monitoring"
        description="Track agent performance, conversation metrics, and system health across your entire Convio deployment."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio's analytics platform gives you full visibility into how your AI agents perform across every channel. Metrics update in real time and are retained for the duration of your data retention period.
      </p>
      <p>
        Analytics are organized at two levels: <strong>dashboard-level</strong> (organization-wide) and <strong>per-agent</strong> (individual agent performance). Both are accessible from the <strong>Analytics</strong> tab in the sidebar.
      </p>

      <h2 id="where-to-find">Where to Find Analytics</h2>
      <p>
        Navigate to <strong>Analytics</strong> in the sidebar. The top-level view shows organization-wide metrics. Select any agent from the dropdown to drill into its specific performance.
      </p>
      <ul>
        <li><strong>Dashboard Analytics:</strong> Aggregated metrics across all agents and channels</li>
        <li><strong>Per-Agent Analytics:</strong> Individual agent breakdowns with daily trends</li>
        <li><strong>Audit Logs:</strong> Full event history for compliance and debugging</li>
      </ul>

      <h2 id="what-is-tracked">What Metrics Are Tracked</h2>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={MessageCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Conversations"
          description="Total conversations started, resolved, and currently active across all channels."
        />
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Response Time"
          description="Average time between a user message and the agent's first response."
        />
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Token Usage"
          description="Input and output tokens consumed per agent, per conversation, and per channel."
        />
        <DocFeatureCard
          icon={TrendingUp}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Success Rate"
          description="Percentage of conversations resolved without human escalation."
        />
        <DocFeatureCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Unique Users"
          description="Distinct users who interacted with your agents in the selected period."
        />
        <DocFeatureCard
          icon={Activity}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Channel Breakdown"
          description="Performance comparison across WhatsApp, web widget, Discord, and other channels."
        />
      </DocCardGrid>

      <h2 id="dashboard-vs-agent">Dashboard vs Per-Agent Analytics</h2>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Level</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Scope</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Best For</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Dashboard</td>
              <td className="py-2 pr-4">All agents, all channels</td>
              <td className="py-2">Organization health, cost tracking, cross-channel comparison</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Per-Agent</td>
              <td className="py-2 pr-4">Single agent, all channels</td>
              <td className="py-2">Agent tuning, knowledge base gaps, prompt optimization</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="key-metrics-summary">Key Metrics Summary</h2>
      <p>
        These are the most important numbers to watch daily:
      </p>
      <ul>
        <li><strong>Avg Response Time:</strong> Should stay under 3 seconds for chat channels</li>
        <li><strong>Success Rate:</strong> Target 85%+ for well-configured agents</li>
        <li><strong>Token Usage:</strong> Monitor for cost spikes or unexpected loops</li>
        <li><strong>Active Conversations:</strong> Sudden drops may indicate channel issues</li>
      </ul>

      <DocCallout variant="tip" icon={TrendingUp} title="Start here">
        Check dashboard analytics daily, then drill into per-agent metrics weekly. Set up alerts for response time and success rate thresholds.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Dashboard Analytics"
          href="/docs/dashboard-analytics"
        />
        <DocNextStepCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Per-Agent Analytics"
          href="/docs/per-agent-analytics"
        />
        <DocNextStepCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Key Metrics"
          href="/docs/key-metrics"
        />
        <DocNextStepCard
          icon={Activity}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Channel Breakdown"
          href="/docs/channel-breakdown"
        />
      </DocCardGrid>
    </DocContent>
  )
}
