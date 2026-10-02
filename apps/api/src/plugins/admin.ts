import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma, getPrisma } from '@convio/database'
import { AppError } from './error.js'

declare module 'fastify' {
  interface FastifyInstance {
    ensurePlatformAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

function getAdminEmails(): Set<string> {
  const raw = process.env.PLATFORM_ADMIN_EMAILS || ''
  return new Set(raw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean))
}

/**
 * Whether the Auth server has confirmed this user's email address.
 *
 * Platform admin is granted by email string, so an unconfirmed account that
 * merely *claims* an allowlisted address must not inherit admin access —
 * anyone can sign up with an address they do not own when email confirmation
 * is disabled. Fails closed on any database error.
 */
async function isEmailConfirmed(userId: string): Promise<boolean> {
  try {
    const rows = await getPrisma().$queryRaw<{ email_confirmed_at: Date | null }[]>`
      select email_confirmed_at from auth.users where id = ${userId}::uuid limit 1
    `
    return !!rows[0]?.email_confirmed_at
  } catch {
    return false
  }
}

/**
 * @param userId When provided, the matched email must also be confirmed in
 *   auth.users. Always pass it for request-time checks.
 */
export async function isPlatformAdmin(email: string, userId?: string): Promise<boolean> {
  const normalized = email.toLowerCase()

  const adminEmails = getAdminEmails()
  const listed =
    (adminEmails.size > 0 && adminEmails.has(normalized)) ||
    !!(await prisma.adminGrant.findFirst({
      where: { email: normalized, expiresAt: { gt: new Date() } },
    }))

  if (!listed) return false
  if (userId && !(await isEmailConfirmed(userId))) return false
  return true
}

export default fp(async function adminPlugin(fastify: FastifyInstance) {
  fastify.decorate('ensurePlatformAdmin', async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      throw new AppError(401, 'Authentication required', 'UNAUTHORIZED')
    }

    if (!(await isPlatformAdmin(request.user.email, request.userId))) {
      // Distinguish the two failure modes so ops can tell a revoked grant apart
      // from an admin account whose email was never confirmed.
      if (await isPlatformAdmin(request.user.email)) {
        request.log.warn(
          { userId: request.userId },
          'Platform admin denied: the account email is not confirmed in auth.users',
        )
      }
      throw new AppError(403, 'Platform admin access required', 'FORBIDDEN')
    }
  })
}, {
  name: 'admin',
  dependencies: ['auth'],
})