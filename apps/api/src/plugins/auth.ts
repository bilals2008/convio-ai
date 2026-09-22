import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getPrisma } from '@convio/database'
import { isAsymmetricMode, verifySupabaseJwt } from '../lib/jwt-verify.js'

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string
    user?: {
      id: string
      name: string | null
      email: string
      avatar: string | null
    }
    sessionId?: string
    aal?: string
    isAnonymous?: boolean
    // Which path verified this request. 'legacy' means the Auth server already
    // validated the token, so per-route session checks are redundant.
    authMethod?: 'jwks' | 'legacy'
  }
  interface FastifyInstance {
    supabase: SupabaseClient
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    optionalAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

interface AuthUser {
  id: string
  email: string
  // Unknown when the token was verified locally — JWTs carry no confirmation
  // state, so it is resolved from auth.users only when a profile must be created.
  emailVerified?: boolean
  meta: Record<string, unknown>
  sessionId?: string
  aal?: string
  isAnonymous: boolean
  authMethod: 'jwks' | 'legacy'
}

export default fp(async function authPlugin(fastify: FastifyInstance) {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  )

  fastify.decorate('supabase', supabase)
  fastify.decorateRequest('userId', undefined)
  fastify.decorateRequest('user', undefined)
  fastify.decorateRequest('sessionId', undefined)
  fastify.decorateRequest('aal', undefined)
  fastify.decorateRequest('isAnonymous', undefined)
  fastify.decorateRequest('authMethod', undefined)

  function extractToken(request: FastifyRequest): string | null {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return null
    return authHeader.slice(7)
  }

  async function verifyToken(request: FastifyRequest): Promise<AuthUser | null> {
    const token = extractToken(request)
    if (!token) return null

    if (await isAsymmetricMode()) {
      // Verified locally against the project JWKS — no Auth server round-trip.
      // A failure here is final: there is deliberately no fallback to
      // getUser(), which would pay a network call on attacker-supplied garbage.
      const claims = await verifySupabaseJwt(token)
      if (!claims) return null

      return {
        id: claims.sub,
        email: claims.email ?? '',
        meta: (claims.user_metadata ?? {}) as Record<string, unknown>,
        sessionId: claims.session_id,
        aal: claims.aal,
        isAnonymous: !!claims.is_anonymous,
        authMethod: 'jwks',
      }
    }

    // Legacy shared-secret (HS256) projects expose no JWKS, so the Auth server
    // remains the only source of truth.
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null

    return {
      id: user.id,
      email: user.email ?? '',
      emailVerified: !!user.email_confirmed_at || !!user.confirmed_at,
      meta: (user.user_metadata ?? {}) as Record<string, unknown>,
      isAnonymous: false,
      authMethod: 'legacy',
    }
  }

  async function readEmailConfirmedAt(userId: string): Promise<boolean> {
    try {
      const rows = await getPrisma().$queryRaw<{ email_confirmed_at: Date | null }[]>`
        select email_confirmed_at from auth.users where id = ${userId}::uuid limit 1
      `
      return !!rows[0]?.email_confirmed_at
    } catch {
      return false
    }
  }

  // ponytail: self-heals OAuth signups where no DB trigger synced auth.users -> profiles;
  // remove once a reliable trigger exists
  async function ensureProfile(authUser: AuthUser) {
    const db = getPrisma()
    let profile = await db.profile.findUnique({ where: { id: authUser.id } })
    if (!profile && authUser.email) {
      const meta = authUser.meta as {
        name?: string; full_name?: string; avatar_url?: string; picture?: string
      }
      profile = await db.profile.upsert({
        where: { id: authUser.id },
        update: {},
        create: {
          id: authUser.id,
          email: authUser.email,
          name: meta.full_name ?? meta.name ?? null,
          avatar: meta.avatar_url ?? meta.picture ?? null,
          emailVerified: authUser.emailVerified ?? await readEmailConfirmedAt(authUser.id),
        },
      }).catch(() => null)
    }
    return profile
  }

  function applyUser(request: FastifyRequest, authUser: AuthUser, profile: NonNullable<Awaited<ReturnType<typeof ensureProfile>>>) {
    request.userId = authUser.id
    request.sessionId = authUser.sessionId
    request.aal = authUser.aal
    request.isAnonymous = authUser.isAnonymous
    request.authMethod = authUser.authMethod
    request.user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
    }
  }

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    const authUser = await verifyToken(request)
    if (!authUser) {
      reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid or expired session' })
      return
    }

    const profile = await ensureProfile(authUser)
    if (!profile) {
      reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'User not found' })
      return
    }

    applyUser(request, authUser, profile)
  })

  fastify.decorate('optionalAuth', async (request: FastifyRequest, _reply: FastifyReply) => {
    const authUser = await verifyToken(request)
    if (!authUser) return

    const profile = await ensureProfile(authUser)
    if (!profile) return

    applyUser(request, authUser, profile)
  })

  // Surfaced at boot so ops can tell at a glance whether local verification is
  // active or the project is still on the legacy shared secret.
  isAsymmetricMode().then((asymmetric) => {
    fastify.log.info(asymmetric
      ? 'Auth: verifying Supabase JWTs locally via JWKS'
      : 'Auth: project has no asymmetric signing keys — falling back to Supabase Auth getUser() per request'
    )
  }).catch(() => {})
}, {
  name: 'auth',
})
