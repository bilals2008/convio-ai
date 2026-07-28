import { Users, ArrowUpDown, Trash2, UserX } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout } from '@/components/docs'

export default function ManagingMembersPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Managing Members' },
        ]}
        title="Managing Members"
        description="View your organization's members, change their roles, and remove people who no longer need access."
      />

      <h2 id="viewing-members">Viewing Members</h2>
      <p>
        Open <strong>Settings → Members</strong> to see every member in your organization. The list shows each person's name, email, role, and when they joined. You can filter by role or search by name.
      </p>
      <p>
        Members who were invited but haven't accepted yet appear in a separate <strong>Pending</strong> section with their invitation status and expiration date.
      </p>

      <h2 id="changing-roles">Changing Roles</h2>
      <p>
        To change a member's role, find them in the list and click the role dropdown. Select the new role — the change takes effect immediately.
      </p>
      <ul>
        <li><strong>Owners</strong> can change any role, including promoting others to Owner.</li>
        <li><strong>Admins</strong> can change Members to Viewers and vice versa, but cannot promote to Admin or Owner.</li>
        <li>You cannot change your own role if you are the only Owner.</li>
      </ul>

      <DocCallout variant="warning" icon={ArrowUpDown} title="Role changes are immediate">
        When you promote a Member to Admin, they instantly gain access to all Admin capabilities. Make sure the person is aware of their new responsibilities.
      </DocCallout>

      <h2 id="removing-members">Removing Members</h2>
      <p>
        To remove a member, click the actions menu next to their name and select <strong>Remove</strong>. You'll be asked to confirm the action.
      </p>
      <p>
        Removed members lose access to the organization immediately. They cannot view agents, knowledge bases, or conversations until re-invited.
      </p>

      <DocCallout variant="destructive" icon={Trash2} title="Removing a member is permanent">
        Their role assignment and access are deleted. If they need access again later, you must send a new invitation.
      </DocCallout>

      <h2 id="data-after-removal">What Happens to Removed Member's Data</h2>
      <p>
        When a member is removed, their personal data is handled as follows:
      </p>
      <ul>
        <li><strong>Conversations</strong> — any conversations they started remain in the org. Other members can still view them.</li>
        <li><strong>Agents</strong> — agents they created stay in the org. Ownership transfers to the org owner.</li>
        <li><strong>Knowledge base content</strong> — documents they uploaded remain available to the org.</li>
        <li><strong>Personal settings</strong> — their API keys, preferences, and profile data are deleted from the org scope.</li>
      </ul>
      <p>
        The removed person keeps their Convio account. They can still use their personal org or join other organizations.
      </p>

      <h2 id="activity-log">Member Activity</h2>
      <p>
        The members page includes a last-active timestamp for each person. Use this to identify inactive accounts that might need cleanup.
      </p>

      <DocCallout variant="tip" icon={UserX} title="Tip: deactivate before removing">
        If you're unsure about permanently removing a member, consider downgrading them to Viewer first. This revokes write access while preserving their ability to view content.
      </DocCallout>
    </DocContent>
  )
}
