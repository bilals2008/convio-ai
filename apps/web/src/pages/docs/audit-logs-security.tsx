import { FileText, Search, Download, Clock, Shield, AlertTriangle } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AuditLogsSecurityPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Audit Logs (Security Focus)' },
        ]}
        title="Audit Logs (Security Focus)"
        description="Use audit logs to investigate security incidents, track suspicious activity, and maintain compliance."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Audit logs record every significant action in your organization: logins, API key changes, agent modifications, moderation events, and data access. These logs are immutable and provide a complete trail for security investigations and compliance audits.
      </p>

      <h2 id="investigations">Using Audit Logs for Investigations</h2>
      <p>
        When investigating a security incident, audit logs help you answer:
      </p>
      <ul>
        <li><strong>Who did what?</strong> Every log entry includes the user identity and IP address.</li>
        <li><strong>When?</strong> Precise timestamps for every action.</li>
        <li><strong>What changed?</strong> Before/after values for modifications.</li>
        <li><strong>Was access authorized?</strong> Correlate actions with role assignments.</li>
      </ul>

      <h3 id="common-investigations">Common Investigation Scenarios</h3>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Search}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Unauthorized Access"
          description="Check login logs for unfamiliar IP addresses, unusual login times, or failed authentication attempts."
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Data Breach Assessment"
          description="Trace document access, API calls, and data exports during the suspected breach window."
        />
        <DocFeatureCard
          icon={AlertTriangle}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Policy Violations"
          description="Identify who created, modified, or deleted agents, knowledge bases, or moderation rules."
        />
        <DocFeatureCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Insider Threats"
          description="Monitor privileged actions by admins: key rotations, member changes, data exports."
        />
      </DocCardGrid>

      <h2 id="suspicious-activity">Tracking Suspicious Activity</h2>
      <p>
        Watch for these patterns in audit logs:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Signal</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">What to Check</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Risk Level</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Logins from new locations</td>
              <td className="py-2">IP address, geographic location, user agent</td>
              <td className="py-2">Medium</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Bulk data exports</td>
              <td className="py-2">Export actions, volume, timing</td>
              <td className="py-2">High</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Rapid key rotations</td>
              <td className="py-2">API key create/delete patterns</td>
              <td className="py-2">Medium</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Privilege escalation</td>
              <td className="py-2">Role changes, admin grants</td>
              <td className="py-2">High</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Moderation bypass attempts</td>
              <td className="py-2">Repeated blocked messages from same user</td>
              <td className="py-2">Low-Medium</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="exporting">Exporting Logs</h2>
      <p>
        Export audit logs for external analysis, compliance reporting, or archival:
      </p>
      <ol>
        <li>Go to <strong>Settings</strong> → <strong>Audit Logs</strong>.</li>
        <li>Set date range and filters (event type, user, action).</li>
        <li>Click <strong>Export</strong> and choose format (JSON or CSV).</li>
        <li>Download the exported file.</li>
      </ol>

      <DocCallout variant="tip" icon={Download} title="API export for automation">
        Use the Audit Logs API endpoint to automate log exports. Schedule daily exports to your SIEM or log management system for centralized monitoring.
      </DocCallout>

      <h2 id="retention">Retention Policy</h2>
      <p>
        Audit log retention varies by plan:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Plan</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Retention</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Free</td>
              <td className="py-2">30 days</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Pro</td>
              <td className="py-2">1 year</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Enterprise</td>
              <td className="py-2">Custom (up to 7 years)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <DocCallout variant="warning" icon={Clock} title="Export before deletion">
        Once audit logs are deleted after the retention period, they cannot be recovered. If you need logs beyond the default retention, export them or contact sales for extended retention.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Data Retention & Deletion"
          href="/docs/data-retention"
        />
        <DocNextStepCard
          icon={FileText}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Data Management Center"
          href="/docs/data-management"
        />
      </DocCardGrid>
    </DocContent>
  )
}
