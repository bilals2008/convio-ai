import { BarChart3, Users, MessageCircle, TrendingUp, ArrowRight, Calendar, Activity, Bot } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function DashboardAnalyticsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Dashboard Analytics' },
        ]}
        title="Dashboard Analytics"
        description="Organization-wide metrics showing total conversations, messages, users, and active bots across all channels."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Dashboard analytics provide a bird's-eye view of your entire Convio deployment. Navigate to <strong>Analytics</strong> in the sidebar to see aggregated metrics across all agents and channels.
      </p>

      <h2 id="overview-cards">Overview Cards</h2>
      <p>
        The top of the analytics page displays four summary cards:
      </p>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={MessageCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Total Conversations"
          description="Number of conversations started in the selected period. Includes both AI-resolved and human-escalated conversations."
        />
        <DocFeatureCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Unique Users"
          description="Distinct users who sent at least one message across any channel. Deduplicated by user ID."
        />
        <DocFeatureCard
          icon={Bot}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Active Bots"
          description="Number of agents that handled at least one conversation in the selected period."
        />
        <DocFeatureCard
          icon={Activity}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Total Messages"
          description="Combined count of user messages and agent responses. Useful for volume tracking and cost estimation."
        />
      </DocCardGrid>

      <h2 id="trend-charts">Trend Charts</h2>
      <p>
        Below the summary cards, trend charts visualize metrics over time:
      </p>
      <ul>
        <li><strong>Conversations over time:</strong> Daily or weekly conversation count as a line or bar chart</li>
        <li><strong>Messages over time:</strong> Input vs output message volume stacked or overlaid</li>
        <li><strong>Response time trend:</strong> Average response time per day, useful for spotting degradation</li>
        <li><strong>Success rate trend:</strong> Daily success rate percentage, highlighted against your target threshold</li>
      </ul>

      <DocCallout variant="info" icon={BarChart3} title="Chart controls">
        Hover over any data point for exact numbers. Click and drag to zoom into a specific period. Double-click to reset the view.
      </DocCallout>

      <h2 id="quick-insights">Quick Insights</h2>
      <p>
        The insights panel highlights notable changes compared to the previous period:
      </p>
      <ul>
        <li><strong>Conversation volume change:</strong> Percentage increase or decrease vs the prior period</li>
        <li><strong>Peak hours:</strong> The time range with the highest conversation volume</li>
        <li><strong>Top channel:</strong> Which channel drove the most conversations</li>
        <li><strong>Resolution improvement:</strong> Changes in success rate or response time</li>
      </ul>

      <h2 id="date-range">Date Range Selection</h2>
      <p>
        Use the date picker in the top-right corner to filter all metrics:
      </p>
      <ul>
        <li><strong>Last 24 hours:</strong> Real-time activity for immediate monitoring</li>
        <li><strong>Last 7 days:</strong> Weekly trends and patterns</li>
        <li><strong>Last 30 days:</strong> Monthly overview for reporting</li>
        <li><strong>Custom range:</strong> Select specific start and end dates for targeted analysis</li>
      </ul>

      <DocCallout variant="tip" icon={Calendar} title="Weekly reviews">
        Check dashboard analytics every Monday morning to catch issues from the previous week before they compound.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Per-Agent Analytics"
          href="/docs/per-agent-analytics"
        />
        <DocNextStepCard
          icon={Calendar}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Date Ranges"
          href="/docs/date-ranges"
        />
        <DocNextStepCard
          icon={MessageCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Channel Breakdown"
          href="/docs/channel-breakdown"
        />
        <DocNextStepCard
          icon={TrendingUp}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Exporting Analytics"
          href="/docs/exporting-analytics"
        />
      </DocCardGrid>
    </DocContent>
  )
}
