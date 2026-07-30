import { useMemo } from 'react'
import { adminNavGroups, type NavPermission } from './admin-nav-items'
import type { NavGroup } from './admin-nav-items'

const defaultPermissions: NavPermission[] = [
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
]

export function useAdminNav(userPermissions?: NavPermission[]) {
  return useMemo(() => {
    const perms = userPermissions ?? defaultPermissions
    const permSet = new Set(perms)

    return adminNavGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => permSet.has(item.permission)),
      }))
      .filter((group) => group.items.length > 0)
  }, [userPermissions])
}

export type { NavGroup, NavItem, NavPermission } from './admin-nav-items'
