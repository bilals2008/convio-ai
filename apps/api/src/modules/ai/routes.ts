import type { FastifyInstance } from 'fastify'
import { prisma } from '@convio/database'
import { getProviderForModel, allProviders } from '@convio/ai/providers'

export default async function aiRoutes(fastify: FastifyInstance) {
  fastify.post('/chat/stream', {
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { agentId, messages } = request.body as {
      agentId: string
      messages: { role: 'user' | 'assistant' | 'system'; content: string }[]
    }

    const agent = await prisma.agent.findUnique({ where: { id: agentId } })
    if (!agent) {
      return reply.code(404).send({ error: 'Agent not found' })
    }

    let provider
    try {
      provider = getProviderForModel(agent.model)
    } catch {
      return reply.code(400).send({ error: `No provider configured for model: ${agent.model}` })
    }

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    })

    const systemMessages = [
      { role: 'system' as const, content: agent.systemPrompt },
      ...messages,
    ]

    try {
      const stream = provider.stream({
        model: agent.model,
        messages: systemMessages,
        temperature: agent.temperature ?? 0.7,
        maxTokens: agent.maxTokens ?? 2048,
      })

      for await (const chunk of stream) {
        reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Streaming error'
      reply.raw.write(`data: ${JSON.stringify({ type: 'error', content: errorMessage })}\n\n`)
    } finally {
      reply.raw.end()
    }
  })

  fastify.get('/chat/models', {
    preHandler: [fastify.authenticate],
  }, async () => {
    const keyMap: Record<string, string> = {
      openai: 'OPENAI_API_KEY',
      anthropic: 'ANTHROPIC_API_KEY',
      google: 'GOOGLE_API_KEY',
      groq: 'GROQ_API_KEY',
      kie: 'KIE_API_KEY',
    }

    const models = await Promise.all(
      allProviders
        .filter((p) => !!process.env[keyMap[p.id]])
        .map(async (p) => {
          try {
            return await p.listModels()
          } catch {
            return []
          }
        }),
    )

    return { data: models.flat() }
  })
}
