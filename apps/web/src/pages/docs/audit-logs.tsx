import { Shield, ArrowRight, Users, Clock, Search, Filter, AlertTriangle, Lock } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function AuditLogsPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Audit Logs' },
        ]}
        title="Audit Logs"
        description="Full event history showing who did what, when, across your entire organization."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Audit logs provide a complete, immutable record of every significant action taken in your Convio organization. They are essential for compliance, debugging, and security investigations.
      </p>
      <p>
        Access audit logs from <strong>Settings → Audit Logs</strong>. Only organization admins can view audit logs.
      </p>

      <h2 id="what-is-logged">What Is Logged</h2>
      <DocCardGrid columns={2}>
        <DocFeatureCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="User Actions"
          description="Login, logout, role changes, member invitations, and account modifications."
        />
        <DocFeatureCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Agent Changes"
          description="Agent creation, deletion, configuration updates, system prompt changes, and model switches."
        />
        <DocFeatureCard
          icon={Lock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Security Events"
          description="Failed login attempts, password changes, API key creation and revocation, and permission changes."
        />
        <DocFeatureCard
          icon={AlertTriangle}
          iconBg="bg-warning/10"
          iconColor="text-warning"
          title="Data Events"
          description="Knowledge base uploads, document deletions, conversation exports, and data retention changes."
        />
      </DocCardGrid>

      <h2 id="event-format">Event Format</h2>
      <p>
        Each audit log entry contains:
      </p>
      <ul>
        <li><strong>Timestamp:</strong> When the action occurred (UTC)</li>
        <li><strong>Actor:</strong> Who performed the action (user ID and email)</li>
        <li><strong>Action:</strong> What was done (e.g., agent.created, member.invited)</li>
        <li><strong>Resource:</strong> The affected resource (agent ID, member ID, etc.)</li>
        <li><strong>Details:</strong> Additional context (old value, new value, IP address)</li>
      </ul>

      <h3 id="example-entry">Example Entry</h3>
      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Field</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Value</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Timestamp</td>
              <td className="py-2">2025-01-15T14:32:01Z</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Actor</td>
              <td className="py-2">admin@company.com (usr_abc123)</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Action</td>
              <td className="py-2">agent.system_prompt.updated</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4">Resource</td>
              <td className="py-2">agent_def456 (Support Bot)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Details</td>
              <td className="py-2">system_prompt changed from v12 to v13</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="organization-level">Organization-Level Logging</h2>
      <p>
        Audit logs are scoped to your organization. All actions by all members are logged, including:
      </p>
      <ul>
        <li>Organization settings changes</li>
        <li>Member role updates and removals</li>
        <li>Billing and subscription changes</li>
        <li>API key management</li>
        <li>Data export requests</li>
      </ul>

      <h2 id="filtering">Filtering and Search</h2>
      <p>
        Use the filter panel to narrow down audit log entries:
      </p>
      <ul>
        <li><strong>Date range:</strong> Filter by when the action occurred</li>
        <li><strong>Actor:</strong> Filter by who performed the action</li>
        <li><strong>Action type:</strong> Filter by category (user, agent, security, data)</li>
        <li><strong>Resource:</strong> Search by specific resource ID</li>
      </ul>

      <DocCallout variant="tip" icon={Search} title="Investigation workflow">
        Start with the date range of the incident, then filter by actor or resource type. Use the details field to trace the exact sequence of changes.
      </DocCallout>

      <h2 id="retention">Log Retention</h2>
      <p>
        Audit logs are retained for the lifetime of your organization. They are not affected by data retention policies applied to conversations or other data. Logs can be exported for external compliance storage.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Managing Members"
          href="/docs/managing-members"
        />
        <DocNextStepCard
          icon={ArrowRight}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Exporting Analytics"
          href="/docs/exporting-analytics"
        />
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Roles & Permissions"
          href="/docs/roles"
        />
        <DocNextStepCard
          icon={Lock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Login Activity"
          href="/docs/login-activity"
        />
      </DocCardGrid>
    </DocContent>
  )
}
