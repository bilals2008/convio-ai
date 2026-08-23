import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { prisma } from '@convio/database'

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string
    user?: {
      id: string
      name: string | null
      email: string
      avatar: string | null
    }
  }
  interface FastifyInstance {
    supabase: SupabaseClient
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
    optionalAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
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

  async function verifyToken(request: FastifyRequest) {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return null

    const token = authHeader.slice(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null

    return {
      id: user.id,
      email: user.email ?? '',
      emailVerified: !!user.email_confirmed_at || !!user.confirmed_at,
      meta: (user.user_metadata ?? {}) as Record<string, unknown>,
    }
  }

  // ponytail: self-heals OAuth signups where no DB trigger synced auth.users -> profiles;
  // remove once a reliable trigger exists
  async function ensureProfile(authUser: NonNullable<Awaited<ReturnType<typeof verifyToken>>>) {
    let profile = await prisma.profile.findUnique({ where: { id: authUser.id } })
    if (!profile && authUser.email) {
      const meta = authUser.meta as {
        name?: string; full_name?: string; avatar_url?: string; picture?: string
      }
      profile = await prisma.profile.upsert({
        where: { id: authUser.id },
        update: {},
        create: {
          id: authUser.id,
          email: authUser.email,
          name: meta.full_name ?? meta.name ?? null,
          avatar: meta.avatar_url ?? meta.picture ?? null,
          emailVerified: authUser.emailVerified,
        },
      }).catch(() => null)
    }
    return profile
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

    request.userId = authUser.id
    request.user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
    }
  })

  fastify.decorate('optionalAuth', async (request: FastifyRequest, _reply: FastifyReply) => {
    const authUser = await verifyToken(request)
    if (!authUser) return

    const profile = await ensureProfile(authUser)
    if (!profile) return

    request.userId = authUser.id
    request.user = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
    }
  })
}, {
  name: 'auth',
})
