import type { FastifyInstance } from 'fastify'

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/auth/me', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    return reply.send({ user: request.user })
  })
}
