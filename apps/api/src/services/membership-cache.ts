import { prisma } from '@convio/database'
import type { MembershipRole } from '@convio/database'

interface CacheEntry {
  role: MembershipRole
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const TTL_MS = 60_000

function key(userId: string, orgId: string): string {
  return `${userId}:${orgId}`
}

export async function getMembership(userId: string, orgId: string): Promise<{ role: MembershipRole }> {
  const k = key(userId, orgId)
  const cached = cache.get(k)
  if (cached && cached.expiresAt > Date.now()) {
    return { role: cached.role }
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  })

  if (!membership) {
    throw Object.assign(new Error('You do not belong to this organization'), { statusCode: 403, code: 'FORBIDDEN' })
  }

  cache.set(k, { role: membership.role as MembershipRole, expiresAt: Date.now() + TTL_MS })
  return { role: membership.role as MembershipRole }
}

export function invalidate(userId: string, orgId: string): void {
  cache.delete(key(userId, orgId))
}

export function invalidateAll(): void {
  cache.clear()
}
