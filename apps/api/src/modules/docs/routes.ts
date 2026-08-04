import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { validate } from '../../plugins/validate.js'
import { z } from 'zod'

const paramsSchema = z.object({ orgId: z.string().uuid() })

const feedbackBodySchema = z.object({
  slug: z.string().min(1).max(200),
  helpful: z.boolean(),
  comment: z.string().max(1000).optional(),
})

const summaryQuerySchema = z.object({
  slug: z.string().min(1).max(200),
})

export default async function docsRoutes(fastify: FastifyInstance) {
  fastify.get('/organizations/:orgId/docs/feedback', {
    preHandler: [fastify.authenticate, fastify.requireMembership, validate({ params: paramsSchema, query: summaryQuerySchema })],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { slug } = request.query as { slug: string }

    const [myVote, helpful, notHelpful] = await Promise.all([
      prisma.docFeedback.findUnique({
        where: { slug_userId_organizationId: { slug, userId: request.userId!, organizationId: orgId } },
        select: { helpful: true, comment: true },
      }),
      prisma.docFeedback.count({ where: { organizationId: orgId, slug, helpful: true } }),
      prisma.docFeedback.count({ where: { organizationId: orgId, slug, helpful: false } }),
    ])

    return { data: { myVote: myVote ?? null, helpful, notHelpful } }
  })

  fastify.post('/organizations/:orgId/docs/feedback', {
    preHandler: [fastify.authenticate, fastify.requireMembership, validate({ params: paramsSchema, body: feedbackBodySchema })],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    const { slug, helpful, comment } = request.body as { slug: string; helpful: boolean; comment?: string }

    const vote = await prisma.docFeedback.upsert({
      where: { slug_userId_organizationId: { slug, userId: request.userId!, organizationId: orgId } },
      create: { slug, helpful, comment, userId: request.userId!, organizationId: orgId },
      update: { helpful, comment },
    })

    return { data: { helpful: vote.helpful } }
  })
}
