import { ArrowRightLeft, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout } from '@/components/docs'

export default function TransferringOwnershipPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Transferring Ownership' },
        ]}
        title="Transferring Ownership"
        description="Transfer full control of your organization to another member. Only the current Owner can initiate a transfer."
      />

      <h2 id="overview">Overview</h2>
      <p>
        Ownership transfer hands over complete control of an organization to another member. This is useful when you're stepping away from a project, leaving a company, or restructuring team leadership.
      </p>

      <h2 id="prerequisites">Prerequisites</h2>
      <p>
        Before transferring ownership, the following conditions must be met:
      </p>
      <ul>
        <li>You are the current <strong>Owner</strong> of the organization.</li>
        <li>The recipient is already a <strong>member</strong> of the organization.</li>
        <li>The recipient has an <strong>active Convio account</strong> in good standing.</li>
        <li>No <strong>pending ownership transfers</strong> are in progress.</li>
      </ul>

      <DocCallout variant="info" icon={CheckCircle2} title="The recipient must be a member first">
        If the person you want to transfer to isn't in the org yet, invite them first and set their role to Member or Admin. You can transfer ownership once they accept.
      </DocCallout>

      <h2 id="how-to-transfer">How to Transfer</h2>
      <ol>
        <li>Go to <strong>Settings → Organization</strong>.</li>
        <li>Scroll to the <strong>Ownership</strong> section.</li>
        <li>Click <strong>Transfer Ownership</strong>.</li>
        <li>Select the new owner from the member list.</li>
        <li>Confirm by typing the organization name.</li>
      </ol>
      <p>
        The new owner receives a notification. Your role automatically changes to <strong>Admin</strong> — you retain full access except billing management and org deletion.
      </p>

      <DocCallout variant="warning" icon={AlertTriangle} title="This action cannot be undone">
        Once transferred, you cannot reclaim ownership yourself. The new owner must transfer it back to you if needed. Choose the recipient carefully.
      </DocCallout>

      <h2 id="what-changes">What Changes After Transfer</h2>
      <ul>
        <li><strong>New Owner</strong> gains all Owner-level permissions: billing, role changes, org deletion.</li>
        <li><strong>Previous Owner</strong> is demoted to Admin. All other access remains intact.</li>
        <li><strong>Billing</strong> — the new owner becomes the billing contact. Payment method and subscription stay active.</li>
        <li><strong>API keys</strong> — existing keys continue working. The new owner can revoke or rotate them.</li>
        <li><strong>Integrations</strong> — all connected channels (web widget, WhatsApp, etc.) remain active.</li>
      </ul>

      <h2 id="multiple-owners">Can There Be Multiple Owners?</h2>
      <p>
        Yes. The current Owner can promote another member to Owner at any time. Both retain full Owner-level access. This is useful for shared leadership or as a backup in case one owner is unavailable.
      </p>

      <h2 id="canceling">Canceling a Pending Transfer</h2>
      <p>
        If a transfer is initiated but not yet confirmed by the recipient, the current Owner can cancel it from the same Ownership section in Settings.
      </p>
    </DocContent>
  )
}
