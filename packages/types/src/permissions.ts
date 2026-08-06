import type { MembershipRole } from './index.js'

export const ROLE_HIERARCHY: Record<MembershipRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
}

export type Permission =
  | 'org.read'
  | 'org.update'
  | 'org.delete'
  | 'member.read'
  | 'member.invite'
  | 'member.remove'
  | 'member.role.change'
  | 'agent.create'
  | 'agent.read'
  | 'agent.update'
  | 'agent.delete'
  | 'agent.test'
  | 'conversation.read'
  | 'conversation.delete'
  | 'knowledge.create'
  | 'knowledge.read'
  | 'knowledge.update'
  | 'knowledge.delete'
  | 'document.create'
  | 'document.update'
  | 'document.delete'
  | 'tool.create'
  | 'tool.update'
  | 'tool.delete'
  | 'widget.create'
  | 'widget.update'
  | 'widget.delete'
  | 'deployment.create'
  | 'deployment.update'
  | 'deployment.delete'
  | 'provider-key.manage'
  | 'mcp-server.manage'
  | 'analytics.read'
  | 'billing.read'
  | 'billing.manage'
  | 'audit-log.read'
  | 'data.export'
  | 'data.delete'
  | 'data.wipe'
  | 'notification.read'
  | 'notification.manage'

export const PERMISSIONS: Record<Permission, MembershipRole[]> = {
  'org.read': ['viewer', 'member', 'admin', 'owner'],
  'org.update': ['admin', 'owner'],
  'org.delete': ['owner'],
  'member.read': ['viewer', 'member', 'admin', 'owner'],
  'member.invite': ['admin', 'owner'],
  'member.remove': ['admin', 'owner'],
  'member.role.change': ['owner'],
  'agent.create': ['member', 'admin', 'owner'],
  'agent.read': ['viewer', 'member', 'admin', 'owner'],
  'agent.update': ['admin', 'owner'],
  'agent.delete': ['admin', 'owner'],
  'agent.test': ['member', 'admin', 'owner'],
  'conversation.read': ['viewer', 'member', 'admin', 'owner'],
  'conversation.delete': ['admin', 'owner'],
  'knowledge.create': ['member', 'admin', 'owner'],
  'knowledge.read': ['viewer', 'member', 'admin', 'owner'],
  'knowledge.update': ['admin', 'owner'],
  'knowledge.delete': ['admin', 'owner'],
  'document.create': ['member', 'admin', 'owner'],
  'document.update': ['admin', 'owner'],
  'document.delete': ['admin', 'owner'],
  'tool.create': ['admin', 'owner'],
  'tool.update': ['admin', 'owner'],
  'tool.delete': ['admin', 'owner'],
  'widget.create': ['admin', 'owner'],
  'widget.update': ['admin', 'owner'],
  'widget.delete': ['admin', 'owner'],
  'deployment.create': ['member', 'admin', 'owner'],
  'deployment.update': ['admin', 'owner'],
  'deployment.delete': ['admin', 'owner'],
  'provider-key.manage': ['admin', 'owner'],
  'mcp-server.manage': ['admin', 'owner'],
  'analytics.read': ['viewer', 'member', 'admin', 'owner'],
  'billing.read': ['viewer', 'member', 'admin', 'owner'],
  'billing.manage': ['admin', 'owner'],
  'audit-log.read': ['admin', 'owner'],
  'data.export': ['member', 'admin', 'owner'],
  'data.delete': ['admin', 'owner'],
  'data.wipe': ['owner'],
  'notification.read': ['viewer', 'member', 'admin', 'owner'],
  'notification.manage': ['viewer', 'member', 'admin', 'owner'],
}

export function canAccess(role: MembershipRole, permission: Permission): boolean {
  const allowed = PERMISSIONS[permission]
  if (!allowed) return false
  return allowed.includes(role)
}

export function roleAtLeast(role: MembershipRole, minimum: MembershipRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimum]
}
