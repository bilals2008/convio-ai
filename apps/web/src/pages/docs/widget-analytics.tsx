import { BarChart3, Users, MessageCircle, TrendingUp, ArrowRight } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function WidgetAnalyticsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Widget Analytics' },
        ]}
        title="Widget Analytics"
        description="Track visitor interactions, engagement metrics, and conversation performance from your widget."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Widget analytics are available in the dashboard under <strong>Channels → Widget → Analytics</strong>. The data updates in real time and covers the full visitor lifecycle — from page load to conversation completion.
      </p>

      <h2 id="tracking-interactions">Tracking Interactions</h2>
      <p>
        The widget automatically tracks these interaction events:
      </p>
      <ul>
        <li><strong>Page views:</strong> How many visitors loaded a page with the widget</li>
        <li><strong>Widget opens:</strong> How many times the chat bubble was clicked</li>
        <li><strong>Messages sent:</strong> Total visitor messages across all conversations</li>
        <li><strong>Messages received:</strong> Total agent responses delivered</li>
        <li><strong>File uploads:</strong> Number of files attached to conversations</li>
      </ul>

      <h2 id="visitor-count">Visitor Count</h2>
      <p>
        The visitor count shows unique visitors who loaded the widget on your site. The widget uses a session-based identifier — returning visitors within the same session are counted once.
      </p>

      <h3 id="visitor-metrics">Visitor Metrics</h3>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Unique Visitors"
          description="Distinct visitors who loaded the widget in the selected time period."
        />
        <DocFeatureCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Returning Visitors"
          description="Visitors who opened the widget more than once across different sessions."
        />
      </DocCardGrid>

      <h2 id="engagement-metrics">Engagement Metrics</h2>
      <p>
        Engagement metrics show how visitors interact with the widget:
      </p>
      <ul>
        <li><strong>Open rate:</strong> Percentage of visitors who clicked the chat bubble</li>
        <li><strong>Average messages per conversation:</strong> How many messages visitors exchange with the agent</li>
        <li><strong>Average response time:</strong> Time between visitor message and agent response</li>
        <li><strong>Session duration:</strong> How long visitors stay in the chat</li>
        <li><strong>Bounce rate:</strong> Visitors who opened the widget but sent no messages</li>
      </ul>

      <h2 id="conversation-rates">Conversation Rates</h2>
      <p>
        Conversion metrics measure the widget's impact on your goals:
      </p>

      <h3 id="conversion-funnel">Conversion Funnel</h3>
      <ol>
        <li><strong>Visitors:</strong> Total visitors who loaded the page</li>
        <li><strong>Widget opens:</strong> Visitors who clicked the chat bubble</li>
        <li><strong>Conversations started:</strong> Visitors who sent at least one message</li>
        <li><strong>Conversations resolved:</strong> Conversations marked as resolved by the agent</li>
      </ol>

      <DocCallout variant="tip" icon={TrendingUp} title="Benchmark">
        A healthy widget open rate is 5–15% of page visitors. A conversation start rate of 30–50% of widget opens indicates the greeting message is effective.
      </DocCallout>

      <h2 id="time-range">Time Range Filtering</h2>
      <p>
        Filter analytics by time range:
      </p>
      <ul>
        <li><strong>Last 24 hours:</strong> Real-time activity</li>
        <li><strong>Last 7 days:</strong> Weekly trends</li>
        <li><strong>Last 30 days:</strong> Monthly overview</li>
        <li><strong>Custom range:</strong> Specific date range for reporting</li>
      </ul>

      <h2 id="exporting">Exporting Data</h2>
      <p>
        Download analytics data as CSV for external reporting:
      </p>
      <ol>
        <li>Open the Analytics tab for your widget</li>
        <li>Set the desired time range</li>
        <li>Click <strong>Export CSV</strong></li>
        <li>The file downloads with all metrics for the selected period</li>
      </ol>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Widget Settings"
          href="/docs/widget-settings"
        />
        <DocNextStepCard
          icon={MessageCircle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Multi-language Support"
          href="/docs/widget-multilang"
        />
      </DocCardGrid>
    </DocContent>
  )
}
