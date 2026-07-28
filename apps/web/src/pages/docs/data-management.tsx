import { Database, Download, Trash2, AlertTriangle, Shield, FileText } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function DataManagementPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Data Management Center' },
        ]}
        title="Data Management Center"
        description="View, export, and delete your organization's data from a single dashboard."
      />

      <h2 id="overview">Overview</h2>
      <p>
        The Data Management Center gives you visibility and control over all data stored in your Convio organization. View summaries, export data for compliance, perform bulk deletions, or wipe everything when needed.
      </p>

      <h2 id="viewing">Viewing Data Summary</h2>
      <p>
        Access the Data Management Center from <strong>Settings</strong> → <strong>Data Management</strong>. The summary shows:
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Category</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">What's Included</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Size</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Conversations</td>
              <td className="py-2">All chat messages, metadata, and attachments</td>
              <td className="py-2">Shown in MB/GB</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Documents</td>
              <td className="py-2">Uploaded files and their vector embeddings</td>
              <td className="py-2">Shown in MB/GB</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Users</td>
              <td className="py-2">Member profiles and authentication data</td>
              <td className="py-2">Count</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Audit Logs</td>
              <td className="py-2">Activity logs and event records</td>
              <td className="py-2">Shown in MB</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="bulk-deletion">Bulk Deletion</h2>
      <p>
        Delete large amounts of data at once:
      </p>
      <ol>
        <li>Go to <strong>Settings</strong> → <strong>Data Management</strong>.</li>
        <li>Click <strong>Bulk Delete</strong>.</li>
        <li>Select the data type (conversations, documents, or logs).</li>
        <li>Set filters (date range, agent, status).</li>
        <li>Preview the count of affected records.</li>
        <li>Confirm the deletion.</li>
      </ol>

      <DocCallout variant="warning" icon={AlertTriangle} title="Preview before deleting">
        The bulk delete preview shows exactly how many records will be affected. Review this carefully — bulk deletions cannot be undone.
      </DocCallout>

      <h2 id="org-wipe">Full Organization Wipe</h2>
      <p>
        For complete data removal (e.g., when decommissioning a Convio deployment), use the organization wipe:
      </p>
      <ol>
        <li>Go to <strong>Settings</strong> → <strong>Data Management</strong>.</li>
        <li>Click <strong>Organization Wipe</strong>.</li>
        <li>Type your organization name to confirm.</li>
        <li>Click <strong>Wipe Organization</strong>.</li>
      </ol>

      <p>
        This permanently deletes:
      </p>
      <ul>
        <li>All conversations and messages</li>
        <li>All documents and vector embeddings</li>
        <li>All agent configurations</li>
        <li>All API keys</li>
        <li>All member accounts and sessions</li>
        <li>All audit logs and analytics</li>
      </ul>

      <DocCallout variant="destructive" icon={Trash2} title="Organization wipe is irreversible">
        This action permanently deletes all organization data. There is no recovery path. Export your data first if you need it.
      </DocCallout>

      <h2 id="data-export">Data Export</h2>
      <p>
        Export your data for compliance, migration, or backup:
      </p>
      <ol>
        <li>Go to <strong>Settings</strong> → <strong>Data Management</strong>.</li>
        <li>Click <strong>Export Data</strong>.</li>
        <li>Select data types to include.</li>
        <li>Choose format (JSON or CSV).</li>
        <li>Click <strong>Generate Export</strong>.</li>
        <li>Download the export file when ready.</li>
      </ol>

      <DocCallout variant="tip" icon={Download} title="Exports include metadata">
        Exports include conversation timestamps, user identifiers, and agent associations — not just raw message content. This provides context for compliance reviews.
      </DocCallout>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Clock}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Data Retention & Deletion"
          href="/docs/data-retention"
        />
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Audit Logs (Security Focus)"
          href="/docs/audit-logs-security"
        />
      </DocCardGrid>
    </DocContent>
  )
}
