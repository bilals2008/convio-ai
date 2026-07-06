import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { createUserSchema, updateUserSchema } from '@convio/validation'
import { AppError } from '../../plugins/error.js'

export default async function usersRoutes(fastify: FastifyInstance) {
  fastify.get('/users/me', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const user = await prisma.user.findUnique({ where: { id: request.userId } })
    if (!user) throw new AppError(404, 'User not found')
    return { data: user }
  })

  fastify.patch('/users/me', {
    preHandler: [fastify.authenticate, validate({ body: updateUserSchema })],
  }, async (request) => {
    const user = await prisma.user.update({
      where: { id: request.userId },
      data: request.body as any,
    })
    return { data: user }
  })

  fastify.delete('/users/me', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    await prisma.user.delete({ where: { id: request.userId } })
    reply.code(204).send()
  })
}
