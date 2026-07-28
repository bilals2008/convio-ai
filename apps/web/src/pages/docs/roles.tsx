import { Shield, Crown, UserCheck, Eye, Lock } from 'lucide-react'
import { DocContent, DocPageHeader, DocCallout, DocCardGrid, DocFeatureCard } from '@/components/docs'

const roles = [
  {
    icon: Crown,
    name: 'Owner',
    description: 'Full control over the organization. Can manage billing, delete the org, and assign any role.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: Shield,
    name: 'Admin',
    description: 'Can manage members, agents, knowledge bases, and org settings. Cannot access billing or delete the org.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: UserCheck,
    name: 'Member',
    description: 'Can create agents, manage knowledge bases, and view conversations. Cannot manage members or settings.',
    color: 'text-info',
    bg: 'bg-info/10',
  },
  {
    icon: Eye,
    name: 'Viewer',
    description: 'Read-only access. Can view agents, knowledge bases, and conversations but cannot make changes.',
    color: 'text-success',
    bg: 'bg-success/10',
  },
]

const permissions = [
  { action: 'Create agents', owner: true, admin: true, member: true, viewer: false },
  { action: 'Delete agents', owner: true, admin: true, member: false, viewer: false },
  { action: 'Create knowledge bases', owner: true, admin: true, member: true, viewer: false },
  { action: 'Upload documents', owner: true, admin: true, member: true, viewer: false },
  { action: 'View conversations', owner: true, admin: true, member: true, viewer: true },
  { action: 'Manage members', owner: true, admin: true, member: false, viewer: false },
  { action: 'Change member roles', owner: true, admin: false, member: false, viewer: false },
  { action: 'Update org settings', owner: true, admin: true, member: false, viewer: false },
  { action: 'Manage billing', owner: true, admin: false, member: false, viewer: false },
  { action: 'Delete organization', owner: true, admin: false, member: false, viewer: false },
  { action: 'Transfer ownership', owner: true, admin: false, member: false, viewer: false },
]

export default function RolesPage() {
  return (
    <DocContent>
      <DocPageHeader
        breadcrumb={[
          { label: 'Documentation', href: '/docs' },
          { label: 'Roles & Permissions' },
        ]}
        title="Understanding Roles & Permissions"
        description="Convio uses a role-based access model to control what members can do within an organization."
      />

      <h2 id="roles-overview">Roles Overview</h2>
      <p>
        Every member in an organization has exactly one role. Roles determine what actions a member can take. There are four roles, ordered from most to least privileged.
      </p>

      <DocCardGrid columns={2}>
        {roles.map((role) => (
          <DocFeatureCard
            key={role.name}
            icon={role.icon}
            iconBg={role.bg}
            iconColor={role.color}
            title={role.name}
            description={role.description}
            href="#permissions-table"
          />
        ))}
      </DocCardGrid>

      <h2 id="permissions-table">Permissions Matrix</h2>
      <p>
        The table below shows what each role can do. If you need a capability outside your current role, ask your Owner or Admin to upgrade your permissions.
      </p>

      <div className="overflow-x-auto my-6">
        <table className="w-full text-[12px] leading-[1.5]">
          <thead>
            <tr className="border-b border-border/60">
              <th className="text-left py-2 pr-4 font-heading font-semibold text-foreground">Action</th>
              <th className="text-center py-2 px-3 font-heading font-semibold text-foreground">Owner</th>
              <th className="text-center py-2 px-3 font-heading font-semibold text-foreground">Admin</th>
              <th className="text-center py-2 px-3 font-heading font-semibold text-foreground">Member</th>
              <th className="text-center py-2 px-3 font-heading font-semibold text-foreground">Viewer</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((row) => (
              <tr key={row.action} className="border-b border-border/30">
                <td className="py-2 pr-4 text-foreground">{row.action}</td>
                <td className="text-center py-2 px-3 text-foreground/70">{row.owner ? 'Yes' : '—'}</td>
                <td className="text-center py-2 px-3 text-foreground/70">{row.admin ? 'Yes' : '—'}</td>
                <td className="text-center py-2 px-3 text-foreground/70">{row.member ? 'Yes' : '—'}</td>
                <td className="text-center py-2 px-3 text-foreground/70">{row.viewer ? 'Yes' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DocCallout variant="warning" icon={Lock} title="Only Owners can change roles">
        Admins can invite and remove members, but only the Owner (or another Owner) can promote someone to Admin or demote an Admin. This prevents privilege escalation.
      </DocCallout>

      <h2 id="default-role">Default Role for New Members</h2>
      <p>
        When you invite someone to your organization, they receive the <strong>Member</strong> role by default. You can specify a different role during the invitation, or change it after they join.
      </p>

      <h2 id="multiple-orgs">Roles Across Organizations</h2>
      <p>
        A user can have different roles in different organizations. Being a Viewer in your company's org does not prevent you from being the Owner of your personal org. Roles are always scoped to a single organization.
      </p>
    </DocContent>
  )
}
