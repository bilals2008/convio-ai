import { Calendar, ArrowRight, TrendingUp, Download, Clock, BarChart3 } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function DateRangesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Daily & Custom Date Ranges' },
        ]}
        title="Daily & Custom Date Ranges"
        description="View trends over time, select custom date ranges, and export analytics for any period."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio's analytics support flexible date range selection so you can analyze trends over any time period. Use preset ranges for quick checks or custom ranges for targeted analysis.
      </p>

      <h2 id="viewing-trends">Viewing Trends Over Time</h2>
      <p>
        All analytics charts support time-based visualization. Switch between daily, weekly, and monthly aggregation to see the right level of detail:
      </p>
      <ul>
        <li><strong>Daily:</strong> Granular view for identifying specific problem days or spikes</li>
        <li><strong>Weekly:</strong> Smoothed trends for spotting patterns across weeks</li>
        <li><strong>Monthly:</strong> High-level view for executive reporting and long-term trends</li>
      </ul>

      <DocCallout variant="tip" icon={BarChart3} title="Zoom into charts">
        Click and drag on any chart to zoom into a specific period. Double-click to reset. This works at any aggregation level.
      </DocCallout>

      <h2 id="preset-ranges">Preset Date Ranges</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Clock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Last 24 Hours"
          description="Real-time activity. Updates every few minutes. Use for immediate monitoring and incident response."
        />
        <DocFeatureCard
          icon={Calendar}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Last 7 Days"
          description="Weekly trends. Good for spotting weekday vs weekend patterns and weekly comparisons."
        />
        <DocFeatureCard
          icon={TrendingUp}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Last 30 Days"
          description="Monthly overview. Standard for performance reviews and monthly reporting."
        />
        <DocFeatureCard
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Last 90 Days"
          description="Quarterly view. Useful for identifying seasonal patterns and long-term trends."
        />
      </DocCardGrid>

      <h2 id="custom-range">Custom Date Range Selection</h2>
      <p>
        For targeted analysis, select a custom date range:
      </p>
      <ol>
        <li>Click the date range picker in the top-right of the analytics page</li>
        <li>Select <strong>Custom Range</strong></li>
        <li>Pick your start and end dates</li>
        <li>All metrics and charts update to reflect the selected period</li>
      </ol>

      <h3 id="custom-range-limits">Limits</h3>
      <ul>
        <li>Maximum range: 365 days</li>
        <li>Minimum range: 1 day</li>
        <li>Future dates are not selectable</li>
        <li>Data is available from your account creation date onward</li>
      </ul>

      <h2 id="aggregation">Aggregation Options</h2>
      <p>
        When viewing trends, select the aggregation level:
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Aggregation</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Best For</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Data Points</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Daily</td>
              <td className="py-2 pr-4">Granular analysis, incident investigation</td>
              <td className="py-2">1 per day</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Weekly</td>
              <td className="py-2 pr-4">Pattern recognition, week-over-week comparison</td>
              <td className="py-2">1 per week</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Monthly</td>
              <td className="py-2 pr-4">Executive reporting, long-term trends</td>
              <td className="py-2">1 per month</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="export">Export Options</h2>
      <p>
        Export analytics data for any date range:
      </p>
      <ul>
        <li><strong>CSV:</strong> Spreadsheet-compatible format for Excel and Google Sheets</li>
        <li><strong>JSON:</strong> Machine-readable format for programmatic analysis</li>
      </ul>
      <p>
        Select the date range first, then click <strong>Export</strong> in the top-right corner. The export includes all metrics visible in the current view.
      </p>

      <DocCallout variant="info" icon={Download} title="Export size limits">
        Exports covering more than 90 days of daily data may take a few minutes to generate. You'll receive a download link when the export is ready.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Download}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Exporting Analytics"
          href="/docs/exporting-analytics"
        />
        <DocNextStepCard
          icon={TrendingUp}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Key Metrics"
          href="/docs/key-metrics"
        />
      </DocCardGrid>
    </DocContent>
  )
}
