import type { MembershipRole } from '@convio/database'
import { canAccess as sharedCanAccess, roleAtLeast as sharedRoleAtLeast } from '@convio/types'

export function hasPermission(role: MembershipRole, permission: string): boolean {
  return sharedCanAccess(role, permission as any)
}

export function isAtLeast(role: MembershipRole, minimum: MembershipRole): boolean {
  return sharedRoleAtLeast(role, minimum)
}

export function isAdminOrAbove(role: MembershipRole): boolean {
  return isAtLeast(role, 'admin')
}

export function isOwner(role: MembershipRole): boolean {
  return role === 'owner'
}
