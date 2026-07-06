import type { FastifyInstance } from 'fastify'

export default async function authRoutes(fastify: FastifyInstance) {
  // Better Auth handles its own endpoints at /api/auth/*
  // These routes are for session management

  fastify.get('/auth/session', async (request) => {
    return request.session ?? { user: null }
  })

  fastify.post('/auth/sign-out', async (request, reply) => {
    reply.code(200).send({ message: 'Signed out' })
  })
}
