import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  Brain,
  Activity,
  Flag,
  ScrollText,
  CreditCard,
  Shield,
  Megaphone,
  ThumbsUp,
  type LucideIcon,
} from 'lucide-react'

export type NavPermission =
  | 'admin.access'
  | 'admin.users.read'
  | 'admin.orgs.read'
  | 'admin.analytics.read'
  | 'admin.agents.read'
  | 'admin.system.read'
  | 'admin.moderation.read'
  | 'admin.audit.read'
  | 'admin.billing.read'
  | 'admin.providers.read'
  | 'admin.announcements.read'
  | 'admin.docs-feedback.read'

export interface NavItem {
  icon: LucideIcon
  label: string
  href: string
  exact?: boolean
  permission: NavPermission
  badge?: string | number
}

export interface NavGroup {
  group: string
  items: NavItem[]
}

export const adminNavGroups: NavGroup[] = [
  {
    group: 'Admin',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', exact: true, permission: 'admin.access' },
      { icon: Users, label: 'Users', href: '/admin/users', permission: 'admin.users.read' },
      { icon: Building2, label: 'Organizations', href: '/admin/organizations', permission: 'admin.orgs.read' },
      { icon: BarChart3, label: 'Analytics', href: '/admin/analytics', permission: 'admin.analytics.read' },
    ],
  },
  {
    group: 'Monitor',
    items: [
      { icon: Brain, label: 'Agents', href: '/admin/agents', permission: 'admin.agents.read' },
      { icon: Activity, label: 'System Health', href: '/admin/system', permission: 'admin.system.read' },
      { icon: Flag, label: 'Moderation', href: '/admin/moderation', permission: 'admin.moderation.read' },
      { icon: ThumbsUp, label: 'Docs Feedback', href: '/admin/docs-feedback', permission: 'admin.docs-feedback.read' },
    ],
  },
  {
    group: 'System',
    items: [
      { icon: ScrollText, label: 'Audit Logs', href: '/admin/audit-logs', permission: 'admin.audit.read' },
      { icon: CreditCard, label: 'Billing', href: '/admin/billing', permission: 'admin.billing.read' },
      { icon: Shield, label: 'Providers', href: '/admin/providers', permission: 'admin.providers.read' },
      { icon: Megaphone, label: 'Announcements', href: '/admin/announcements', permission: 'admin.announcements.read' },
    ],
  },
]

export const fullAdminPermissions: NavPermission[] = [
  'admin.access',
  'admin.users.read',
  'admin.orgs.read',
  'admin.analytics.read',
  'admin.agents.read',
  'admin.system.read',
  'admin.moderation.read',
  'admin.audit.read',
  'admin.billing.read',
  'admin.providers.read',
  'admin.announcements.read',
  'admin.docs-feedback.read',
]
