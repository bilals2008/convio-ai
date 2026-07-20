import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
})

export default async function contactRoutes(fastify: FastifyInstance) {
  fastify.post('/contact', async (request, reply) => {
    const parsed = contactSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Validation failed', details: parsed.error.flatten() })
    }

    const { name, email, subject, message } = parsed.data

    if (!fastify.email) {
      return reply.code(503).send({ error: 'Email service not configured' })
    }

    try {
      await fastify.email.sendContact({ name, email, subject, message })
      return reply.send({ success: true })
    } catch (err) {
      fastify.log.error(err, 'Failed to send contact email')
      return reply.code(500).send({ error: 'Failed to send message' })
    }
  })
}
