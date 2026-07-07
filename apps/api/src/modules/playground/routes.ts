import type { FastifyInstance } from 'fastify'

interface PlaygroundTestRequest {
  provider: string
  apiKey: string
  model?: string
  message: string
}

const PROVIDER_BASE_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  google: 'https://generativelanguage.googleapis.com/v1beta',
  groq: 'https://api.groq.com/openai/v1',
  kie: 'https://api.kie.ai/v1',
}

// Fallback models if API fetch fails
const FALLBACK_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash'],
  groq: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  kie: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'],
}

async function fetchOpenAIModels(apiKey: string): Promise<string[]> {
  const res = await fetch(`${PROVIDER_BASE_URLS.openai}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return FALLBACK_MODELS.openai
  const data = await res.json()
  return (data.data || [])
    .map((m: any) => m.id)
    .filter((id: string) => id.startsWith('gpt'))
    .sort()
}

async function fetchAnthropicModels(): Promise<string[]> {
  // Anthropic has no models API — return known list
  return FALLBACK_MODELS.anthropic
}

async function fetchGoogleModels(apiKey: string): Promise<string[]> {
  const res = await fetch(
    `${PROVIDER_BASE_URLS.google}/models?key=${apiKey}&pageSize=100`
  )
  if (!res.ok) return FALLBACK_MODELS.google
  const data = await res.json()
  return (data.models || [])
    .map((m: any) => m.name.replace('models/', ''))
    .filter((name: string) => name.startsWith('gemini'))
    .sort()
}

async function fetchGroqModels(apiKey: string): Promise<string[]> {
  const res = await fetch(`${PROVIDER_BASE_URLS.groq}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return FALLBACK_MODELS.groq
  const data = await res.json()
  return (data.data || [])
    .map((m: any) => m.id)
    .filter((id: string) => !id.includes('whisper') && !id.includes('tts') && !id.includes('distil'))
    .sort()
}

async function fetchKIEModels(apiKey: string): Promise<string[]> {
  const res = await fetch(`${PROVIDER_BASE_URLS.kie}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return FALLBACK_MODELS.kie
  const data = await res.json()
  return (data.data || [])
    .map((m: any) => m.id)
    .sort()
}

async function testOpenAI(apiKey: string, model: string, message: string) {
  const res = await fetch(`${PROVIDER_BASE_URLS.openai}/chat/completions`, {
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
  const res = await fetch(`${PROVIDER_BASE_URLS.anthropic}/messages`, {
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
    `${PROVIDER_BASE_URLS.google}/models/${model}:generateContent?key=${apiKey}`,
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
  const res = await fetch(`${PROVIDER_BASE_URLS.groq}/chat/completions`, {
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
  const res = await fetch(`${PROVIDER_BASE_URLS.kie}/chat/completions`, {
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
  // Fetch models dynamically from provider API using the user's key
  fastify.post('/playground/models', async (request, reply) => {
    const { provider, apiKey } = request.body as { provider: string; apiKey: string }

    if (!provider || !apiKey) {
      return reply.status(400).send({ error: 'provider and apiKey are required' })
    }

    try {
      let models: string[]

      switch (provider) {
        case 'openai':
          models = await fetchOpenAIModels(apiKey)
          break
        case 'anthropic':
          models = await fetchAnthropicModels()
          break
        case 'google':
          models = await fetchGoogleModels(apiKey)
          break
        case 'groq':
          models = await fetchGroqModels(apiKey)
          break
        case 'kie':
          models = await fetchKIEModels(apiKey)
          break
        default:
          return reply.status(400).send({ error: `Unknown provider: ${provider}` })
      }

      return { models }
    } catch {
      return { models: FALLBACK_MODELS[provider] || [] }
    }
  })

  // Test an API key with a chat message
  fastify.post('/playground/test', async (request, reply) => {
    const { provider, apiKey, model, message } = request.body as PlaygroundTestRequest

    if (!provider || !apiKey || !message) {
      return reply.status(400).send({ error: 'provider, apiKey, and message are required' })
    }

    const baseUrl = PROVIDER_BASE_URLS[provider]
    if (!baseUrl) {
      return reply.status(400).send({ error: `Unknown provider: ${provider}` })
    }

    const fallbackModels = FALLBACK_MODELS[provider] || []
    const testModel = model || fallbackModels[0]
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
