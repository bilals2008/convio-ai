export function checkRolePermission(
  userRoles: string[] | undefined,
  allowedRoles: string[] | undefined
): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true
  if (!userRoles || userRoles.length === 0) return false
  return userRoles.some((r) => allowedRoles.includes(r))
}
