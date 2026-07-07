import type { FastifyInstance } from 'fastify'

interface PlaygroundTestRequest {
  provider: string
  apiKey: string
  model?: string
  message: string
}

const PROVIDER_CONFIG: Record<string, { baseUrl: string; models: string[] }> = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com/v1',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
  },
  google: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash'],
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  },
  kie: {
    baseUrl: 'https://api.kie.ai/v1',
    models: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'],
  },
}

async function testOpenAI(apiKey: string, model: string, message: string) {
  const res = await fetch(`${PROVIDER_CONFIG.openai.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: message }],
      max_tokens: 256,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
  return {
    response: data.choices?.[0]?.message?.content || '',
    model: data.model,
    usage: data.usage,
  }
}

async function testAnthropic(apiKey: string, model: string, message: string) {
  const res = await fetch(`${PROVIDER_CONFIG.anthropic.baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 256,
      messages: [{ role: 'user', content: message }],
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
  return {
    response: data.content?.[0]?.text || '',
    model: data.model,
    usage: data.usage,
  }
}

async function testGoogle(apiKey: string, model: string, message: string) {
  const res = await fetch(
    `${PROVIDER_CONFIG.google.baseUrl}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 256 },
      }),
    }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
  return {
    response: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    model,
    usage: data.usageMetadata,
  }
}

async function testGroq(apiKey: string, model: string, message: string) {
  const res = await fetch(`${PROVIDER_CONFIG.groq.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: message }],
      max_tokens: 256,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
  return {
    response: data.choices?.[0]?.message?.content || '',
    model: data.model,
    usage: data.usage,
  }
}

async function testKIE(apiKey: string, model: string, message: string) {
  const res = await fetch(`${PROVIDER_CONFIG.kie.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: message }],
      max_tokens: 256,
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
  return {
    response: data.choices?.[0]?.message?.content || '',
    model: data.model,
    usage: data.usage,
  }
}

export default async function playgroundRoutes(fastify: FastifyInstance) {
  // Get available models for a provider
  fastify.get('/playground/models/:provider', async (request, reply) => {
    const { provider } = request.params as { provider: string }
    const config = PROVIDER_CONFIG[provider]
    if (!config) {
      return reply.status(400).send({ error: `Unknown provider: ${provider}` })
    }
    return { models: config.models }
  })

  // Test an API key with a chat message
  fastify.post('/playground/test', async (request, reply) => {
    const { provider, apiKey, model, message } = request.body as PlaygroundTestRequest

    if (!provider || !apiKey || !message) {
      return reply.status(400).send({ error: 'provider, apiKey, and message are required' })
    }

    const config = PROVIDER_CONFIG[provider]
    if (!config) {
      return reply.status(400).send({ error: `Unknown provider: ${provider}` })
    }

    const testModel = model || config.models[0]
    const startTime = Date.now()

    try {
      let result: { response: string; model: string; usage?: any }

      switch (provider) {
        case 'openai':
          result = await testOpenAI(apiKey, testModel, message)
          break
        case 'anthropic':
          result = await testAnthropic(apiKey, testModel, message)
          break
        case 'google':
          result = await testGoogle(apiKey, testModel, message)
          break
        case 'groq':
          result = await testGroq(apiKey, testModel, message)
          break
        case 'kie':
          result = await testKIE(apiKey, testModel, message)
          break
        default:
          return reply.status(400).send({ error: `Unsupported provider: ${provider}` })
      }

      const latencyMs = Date.now() - startTime

      return {
        success: true,
        ...result,
        latencyMs,
        provider,
      }
    } catch (error: any) {
      const latencyMs = Date.now() - startTime
      return {
        success: false,
        error: error.message || 'Unknown error',
        latencyMs,
        provider,
        model: testModel,
      }
    }
  })
}
