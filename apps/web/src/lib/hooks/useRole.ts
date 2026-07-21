import { useOrg } from '@/lib/org-context'

const ROLE_HIERARCHY: Record<string, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
}

const PERMISSIONS: Record<string, string[]> = {
  'org.read': ['viewer', 'member', 'admin', 'owner'],
  'org.update': ['admin', 'owner'],
  'org.delete': ['owner'],
  'member.read': ['viewer', 'member', 'admin', 'owner'],
  'member.invite': ['admin', 'owner'],
  'member.role.change': ['owner'],
  'agent.create': ['member', 'admin', 'owner'],
  'agent.update': ['admin', 'owner'],
  'agent.delete': ['admin', 'owner'],
  'widget.create': ['admin', 'owner'],
  'widget.update': ['admin', 'owner'],
  'provider-key.manage': ['admin', 'owner'],
  'mcp-server.manage': ['admin', 'owner'],
  'data.delete': ['admin', 'owner'],
  'data.wipe': ['owner'],
}

export function useRole() {
  const { org } = useOrg()
  return org?.role ?? null
}

export function useCan(permission: string): boolean {
  const role = useRole()
  if (!role) return false
  const allowed = PERMISSIONS[permission]
  if (!allowed) return false
  return allowed.includes(role)
}

export function useRoleAtLeast(minimumRole: string): boolean {
  const role = useRole()
  if (!role) return false
  return (ROLE_HIERARCHY[role] ?? -1) >= (ROLE_HIERARCHY[minimumRole] ?? Infinity)
}
