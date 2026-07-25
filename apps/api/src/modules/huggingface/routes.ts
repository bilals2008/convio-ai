import type { FastifyInstance } from 'fastify'
import { AppError } from '../../plugins/error.js'
import { z } from 'zod'

const HF_API_BASE = 'https://router.huggingface.co/hf-inference/models'

const generateSchema = z.object({
  prompt: z.string().min(1).max(1000),
  model: z.string().default('stabilityai/stable-diffusion-3-medium-diffusers'),
  negativePrompt: z.string().max(500).optional(),
  width: z.number().int().min(64).max(1024).default(512),
  height: z.number().int().min(64).max(1024).default(512),
})

export default async function huggingfaceRoutes(fastify: FastifyInstance) {
  fastify.post('/organizations/:orgId/huggingface/generate', {
    preHandler: [fastify.authenticate],
  }, async (request) => {
    const { orgId } = request.params as { orgId: string }
    await fastify.ensureOwner(request.userId!, orgId)

    const apiKey = fastify.config.HUGGINGFACE_API_KEY
    if (!apiKey) {
      throw new AppError(500, 'Hugging Face API key not configured. Add HUGGINGFACE_API_KEY to .env')
    }

    const { prompt, model, negativePrompt, width, height } = generateSchema.parse(request.body)

    const res = await fetch(`${HF_API_BASE}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
          width,
          height,
        },
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      if (res.status === 503 && text.includes('loading')) {
        throw new AppError(503, 'Model is loading. Please try again in 20-30 seconds.')
      }
      throw new AppError(res.status, `Hugging Face error: ${text.slice(0, 200)}`)
    }

    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mime = res.headers.get('content-type') || 'image/webp'

    return { data: { image: `data:${mime};base64,${base64}`, model } }
  })
}
