import { BarChart3, Users, MessageCircle, TrendingUp, ArrowRight, Bot, Clock, Zap } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function PerAgentAnalyticsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Per-Agent Analytics' },
        ]}
        title="Per-Agent Analytics"
        description="Individual agent performance metrics, daily breakdowns, and agent comparison tools."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Per-agent analytics let you evaluate each agent's performance independently. Select an agent from the dropdown at the top of the analytics page to view its specific metrics.
      </p>

      <h2 id="individual-performance">Individual Agent Performance</h2>
      <p>
        Each agent's analytics page shows:
      </p>
      <DocCardGrid columns={3}>
        <DocFeatureCard
          icon={MessageCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Conversations Handled"
          description="Total conversations this agent participated in during the selected period."
        />
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Avg Response Time"
          description="Mean time between user message and agent response for this specific agent."
        />
        <DocFeatureCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Token Usage"
          description="Total input and output tokens consumed by this agent."
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
          description="Distinct users who interacted with this agent."
        />
        <DocFeatureCard
          icon={Bot}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Channels Used"
          description="Breakdown of conversations per channel for this agent."
        />
      </DocCardGrid>

      <h2 id="daily-breakdowns">Daily Breakdowns</h2>
      <p>
        The daily breakdown chart shows per-day metrics for the selected agent:
      </p>
      <ul>
        <li><strong>Conversations per day:</strong> Volume trend to identify peak usage days</li>
        <li><strong>Messages per day:</strong> Input and output message counts stacked by type</li>
        <li><strong>Response time per day:</strong> Average response time trend to spot degradation</li>
        <li><strong>Token cost per day:</strong> Estimated daily cost based on token usage</li>
      </ul>

      <DocCallout variant="tip" icon={BarChart3} title="Spot patterns">
        Look for weekly patterns — many businesses see predictable volume spikes on certain weekdays. Use this to plan capacity and staffing.
      </DocCallout>

      <h2 id="agent-comparison">Agent Comparison</h2>
      <p>
        Use the <strong>Compare</strong> toggle to view side-by-side metrics for multiple agents. This helps identify:
      </p>
      <ul>
        <li>Which agent resolves conversations most efficiently</li>
        <li>Which agent has the best success rate</li>
        <li>Where token usage differs between agents handling similar workloads</li>
        <li>Response time differences across agents on the same channel</li>
      </ul>

      <h3 id="comparison-metrics">Comparison Metrics Table</h3>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Metric</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Agent A</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Agent B</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Conversations</td>
              <td className="py-2 pr-4">1,247</td>
              <td className="py-2">983</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Success Rate</td>
              <td className="py-2 pr-4">91.2%</td>
              <td className="py-2">87.5%</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Avg Response Time</td>
              <td className="py-2 pr-4">1.8s</td>
              <td className="py-2">2.4s</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Token Cost</td>
              <td className="py-2 pr-4">$42.30</td>
              <td className="py-2">$38.15</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="usage-per-agent">Usage Per Agent</h2>
      <p>
        The usage section breaks down how each agent consumes resources:
      </p>
      <ul>
        <li><strong>Model used:</strong> Which AI model the agent is configured with</li>
        <li><strong>Avg tokens per conversation:</strong> Efficiency metric for cost control</li>
        <li><strong>Peak concurrent conversations:</strong> Maximum simultaneous conversations handled</li>
        <li><strong>Escalation rate:</strong> How often this agent hands off to humans</li>
      </ul>

      <DocCallout variant="warning" icon={Zap} title="Cost alerts">
        Set up token usage alerts per agent to catch runaway costs. An agent stuck in a loop can consume thousands of tokens before anyone notices.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Zap}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Token Tracking"
          href="/docs/token-tracking"
        />
        <DocNextStepCard
          icon={TrendingUp}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Success Rate"
          href="/docs/success-rate"
        />
        <DocNextStepCard
          icon={MessageCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Channel Breakdown"
          href="/docs/channel-breakdown"
        />
        <DocNextStepCard
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Key Metrics"
          href="/docs/key-metrics"
        />
      </DocCardGrid>
    </DocContent>
  )
}
