import { Clock, Trash2, Database, AlertTriangle, Shield, Download } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocFeatureCard, DocCardGrid, DocNextStepCard } from '@/components/docs'

export default function DataRetentionPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Data Retention & Deletion' },
        ]}
        title="Data Retention & Deletion"
        description="How long data is kept, how to delete it, and what permanent deletion means."
      />

      <h2 id="overview">Data Retention Overview</h2>
      <p>
        Convio retains data only as long as necessary to provide the service and meet compliance requirements. You control your data lifecycle through retention settings and manual deletion.
      </p>

      <h2 id="retention-periods">Retention Periods</h2>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Data Type</th>
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Default Retention</th>
              <th className="text-left py-2 font-heading font-semibold text-foreground">Configurable?</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Conversations</td>
              <td className="py-2">90 days</td>
              <td className="py-2">Yes — 30, 60, 90, 180, 365 days, or indefinite</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Documents</td>
              <td className="py-2">Until deleted</td>
              <td className="py-2">No — retained until manually deleted</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Audit logs</td>
              <td className="py-2">30 days (Free), 1 year (Pro)</td>
              <td className="py-2">No — per plan limits</td>
            </tr>
            <tr className="border-b border-border/50">
              <td className="py-2 pr-4 font-medium text-foreground">Analytics data</td>
              <td className="py-2">1 year</td>
              <td className="py-2">No</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 font-medium text-foreground">Account data</td>
              <td className="py-2">Until account deletion</td>
              <td className="py-2">No</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="deleting-conversations">Deleting Conversations</h2>
      <p>
        Delete individual conversations or bulk-delete by date range:
      </p>
      <ol>
        <li>Go to <strong>Conversations</strong>.</li>
        <li>Select one or more conversations.</li>
        <li>Click <strong>Delete</strong> and confirm.</li>
      </ol>

      <p>
        Deleted conversations are removed from the database immediately and are not recoverable. Analytics derived from these conversations (message counts, response times) are retained.
      </p>

      <h2 id="deleting-documents">Deleting Documents</h2>
      <ol>
        <li>Go to <strong>Knowledge Base</strong> and select a knowledge base.</li>
        <li>Select the documents to delete.</li>
        <li>Click <strong>Delete</strong> and confirm.</li>
      </ol>

      <DocCallout variant="warning" icon={AlertTriangle} title="Document deletion removes chunks">
        Deleting a document also removes all its vector embeddings. Agents referencing this knowledge base will no longer find information from deleted documents.
      </DocCallout>

      <h2 id="permanent-deletion">Permanent Deletion</h2>
      <p>
        Permanent deletion removes data from all storage layers, including backups:
      </p>
      <ul>
        <li>Primary database records</li>
        <li>Vector embeddings and search indexes</li>
        <li>Object storage files (documents, uploads)</li>
        <li>Backup copies (within 30 days of backup creation)</li>
      </ul>

      <DocCallout variant="destructive" icon={Trash2} title="Permanent deletion cannot be undone">
        Once permanent deletion is initiated, data cannot be recovered. Export any data you need before confirming permanent deletion.
      </DocCallout>

      <h2 id="auto-retention">Automatic Retention Policies</h2>
      <p>
        Set automatic retention to prevent unbounded data growth:
      </p>
      <ol>
        <li>Go to <strong>Settings</strong> → <strong>Data Retention</strong>.</li>
        <li>Set a retention period for conversations.</li>
        <li>Choose whether to auto-delete or notify before deletion.</li>
        <li>Save changes.</li>
      </ol>

      <p>
        When auto-retention is enabled, conversations older than the retention period are automatically deleted during off-peak hours.
      </p>

      <h2 id="next-steps">Next Steps</h2>
      <DocCardGrid columns={2}>
        <DocNextStepCard
          icon={Database}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Data Management Center"
          href="/docs/data-management"
        />
        <DocNextStepCard
          icon={Shield}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Security Overview"
          href="/docs/security"
        />
      </DocCardGrid>
    </DocContent>
  )
}
