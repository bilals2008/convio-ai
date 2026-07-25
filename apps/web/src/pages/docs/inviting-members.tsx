import { Mail, Link2, RefreshCw, XCircle, Shield } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout } from '@/components/docs'

export default function InvitingMembersPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Inviting Members' },
        ]}
        title="Inviting Team Members"
        description="Invite collaborators to your organization via email or shareable invite links. You need Owner or Admin role to send invitations."
      />

      <h2 id="email-invitations">Email Invitations</h2>
      <p>
        The primary way to add members is by sending an email invitation. Go to <strong>Settings → Members</strong>, click "Invite Member," and enter their email address.
      </p>
      <ol>
        <li>Navigate to your organization's Settings page.</li>
        <li>Select the <strong>Members</strong> tab.</li>
        <li>Click <strong>Invite Member</strong>.</li>
        <li>Enter the email address and select a role (Member is the default).</li>
        <li>Click <strong>Send Invitation</strong>.</li>
      </ol>
      <p>
        The recipient receives an email with a link to join your organization. They need to create a Convio account if they don't already have one. Once they accept, they appear in your members list with the role you assigned.
      </p>

      <DocCallout variant="info" icon={Mail} title="Invitations expire after 7 days">
        Unaccepted invitations are automatically revoked after 7 days. You can resend an expired invitation or generate a new one.
      </DocCallout>

      <h2 id="invite-links">Invite Links</h2>
      <p>
        Instead of inviting specific emails, you can generate a shareable invite link. Anyone with the link can join your organization with a single click.
      </p>
      <ol>
        <li>Go to <strong>Settings → Members</strong>.</li>
        <li>Click <strong>Create Invite Link</strong>.</li>
        <li>Set the default role and optional expiration.</li>
        <li>Copy the link and share it with your team.</li>
      </ol>

      <DocCallout variant="warning" icon={Link2} title="Treat invite links carefully">
        Anyone who obtains the link can join your organization. Avoid posting invite links in public channels. Revoke the link when you no longer need it.
      </DocCallout>

      <h2 id="resending">Resending Invitations</h2>
      <p>
        If a member hasn't accepted yet, you can resend the invitation from the same members list. Find the pending invitation, click the actions menu, and select <strong>Resend</strong>. This generates a fresh email with a new expiration date.
      </p>

      <h2 id="revoking">Revoking Invitations</h2>
      <p>
        To cancel a pending invitation before it's accepted, find it in the members list and click <strong>Revoke</strong>. The invitation link immediately stops working. If the person already created a Convio account, they won't gain access until you send a new invitation.
      </p>

      <DocCallout variant="destructive" icon={XCircle} title="Revoking is instant">
        Once revoked, the invitation cannot be restored. You'll need to create a new invitation if you change your mind.
      </DocCallout>

      <h2 id="who-can-invite">Who Can Invite</h2>
      <p>
        Both <strong>Owners</strong> and <strong>Admins</strong> can invite members. The role you assign during invitation cannot exceed your own — an Admin cannot invite someone as an Owner.
      </p>
    </DocContent>
  )
}
