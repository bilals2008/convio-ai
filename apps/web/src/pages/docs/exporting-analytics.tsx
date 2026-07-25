import { Download, ArrowRight, FileText, Calendar, BarChart3, Clock } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function ExportingAnalyticsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Exporting Analytics' },
        ]}
        title="Exporting Analytics"
        description="Download reports, export data for external analysis, and schedule automated exports."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Convio lets you export analytics data for external reporting, compliance, and custom analysis. Exports include all metrics visible in the current analytics view for the selected date range.
      </p>

      <h2 id="downloading-reports">Downloading Reports</h2>
      <p>
        To export analytics data:
      </p>
      <ol>
        <li>Navigate to <strong>Analytics</strong> in the sidebar</li>
        <li>Select the date range using the date picker</li>
        <li>Optionally filter by agent or channel</li>
        <li>Click <strong>Export</strong> in the top-right corner</li>
        <li>Choose your format: CSV or JSON</li>
        <li>The file downloads to your browser</li>
      </ol>

      <h2 id="data-portability">Data Portability</h2>
      <p>
        Your data belongs to you. Exports include raw metrics without aggregation, so you can perform any analysis externally. There are no restrictions on how you use exported data.
      </p>

      <DocCallout variant="info" icon={FileText} title="Full data access">
        For complete data portability including conversations, knowledge bases, and agent configurations, use the API endpoints documented in the Developer section.
      </DocCallout>

      <h2 id="formats">Export Formats</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="CSV Export"
          description="Spreadsheet-compatible format. Opens directly in Excel, Google Sheets, or any CSV reader. One row per metric per time period."
        />
        <DocFeatureCard
          icon={BarChart3}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="JSON Export"
          description="Machine-readable format for programmatic analysis. Includes nested structures for complex metrics. Ideal for custom dashboards and pipelines."
        />
      </DocCardGrid>

      <h3 id="csv-structure">CSV Structure</h3>
      <p>
        CSV exports include headers and one row per data point:
      </p>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Column</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Description</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">date</td>
              <td className="py-2">The metric date (YYYY-MM-DD)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">agent_id</td>
              <td className="py-2">Agent identifier (or "all" for aggregate)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">channel</td>
              <td className="py-2">Channel name (or "all" for aggregate)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">conversations</td>
              <td className="py-2">Number of conversations started</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">messages</td>
              <td className="py-2">Total messages (input + output)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">tokens_input</td>
              <td className="py-2">Input tokens consumed</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">tokens_output</td>
              <td className="py-2">Output tokens consumed</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">success_rate</td>
              <td className="py-2">Success rate percentage</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">avg_response_time</td>
              <td className="py-2">Average response time in seconds</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="export-limits">Export Limits</h2>
      <ul>
        <li><strong>Maximum range:</strong> 365 days per export</li>
        <li><strong>File size limit:</strong> 50MB uncompressed</li>
        <li><strong>Daily limit:</strong> 10 exports per organization per day</li>
        <li><strong>Retention:</strong> Generated export files are available for 24 hours</li>
      </ul>

      <h2 id="large-exports">Large Exports</h2>
      <p>
        Exports covering more than 90 days of daily data are processed asynchronously:
      </p>
      <ol>
        <li>Click Export with your selected range</li>
        <li>A notification confirms the export is being generated</li>
        <li>When ready, you receive an email with the download link</li>
        <li>The link expires after 24 hours</li>
      </ol>

      <DocCallout variant="tip" icon={Clock} title="Scheduled exports">
        For regular reporting, set up scheduled exports in <strong>Settings → Integrations</strong>. Configure weekly or monthly exports to be sent to your email or a webhook endpoint.
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
          icon={Calendar}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Date Ranges"
          href="/docs/date-ranges"
        />
        <DocNextStepCard
          icon={Download}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Audit Logs"
          href="/docs/audit-logs"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Token Tracking"
          href="/docs/token-tracking"
        />
      </DocCardGrid>
    </DocContent>
  )
}
