import fp from 'fastify-plugin'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { createClient } from '@supabase/supabase-js'
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
    supabase: ReturnType<typeof createClient>
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

  async function verifyToken(request: FastifyRequest): Promise<string | null> {
    const authHeader = request.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) return null

    const token = authHeader.slice(7)
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null

    return user.id
  }

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = await verifyToken(request)
    if (!userId) {
      reply.code(401).send({ statusCode: 401, error: 'Unauthorized', message: 'Invalid or expired session' })
      return
    }

    request.userId = userId

    const profile = await prisma.profile.findUnique({ where: { id: userId } })
    if (profile) {
      request.user = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
      }
    }
  })

  fastify.decorate('optionalAuth', async (request: FastifyRequest, _reply: FastifyReply) => {
    const userId = await verifyToken(request)
    if (!userId) return

    request.userId = userId

    const profile = await prisma.profile.findUnique({ where: { id: userId } })
    if (profile) {
      request.user = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        avatar: profile.avatar,
      }
    }
  })
}, {
  name: 'auth',
})
