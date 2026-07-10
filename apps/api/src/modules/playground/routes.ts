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
  openrouter: 'https://openrouter.ai/api/v1',
  opencode: 'https://opencode.ai/zen/v1',
  mistral: 'https://api.mistral.ai/v1',
  together: 'https://api.together.xyz/v1',
  deepseek: 'https://api.deepseek.com/v1',
  perplexity: 'https://api.perplexity.ai',
  local: 'http://localhost:20128/v1',
}

// Fallback models if API fetch fails
const FALLBACK_MODELS: Record<string, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash'],
  groq: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  kie: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'],
  openrouter: ['openai/gpt-4o', 'anthropic/claude-3-5-sonnet', 'google/gemini-2.0-flash', 'meta-llama/llama-3.3-70b-instruct'],
  opencode: ['deepseek-v4-flash-free', 'mimo-v2.5-free', 'qwen3.6-plus-free', 'minimax-m3-free', 'nemotron-3-ultra-free', 'north-mini-code-free', 'big-pickle'],
  mistral: ['mistral-large-latest', 'mistral-small-latest', 'pixtral-large-latest'],
  together: ['meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo', 'mistralai/Mixtral-8x7B-Instruct-v0.1', 'Qwen/Qwen2.5-72B-Instruct-Turbo'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  perplexity: ['sonar-pro', 'sonar', 'llama-3.1-sonar-large-128k-online'],
  local: ['auto/best-coding', 'auto/best-reasoning', 'auto/best-fast', 'auto/best-vision', 'auto/best-chat', 'auto/pro-coding', 'auto/coding', 'auto/fast', 'auto/chat'],
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

async function fetchOpenRouterModels(apiKey: string): Promise<string[]> {
  const res = await fetch(`${PROVIDER_BASE_URLS.openrouter}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return FALLBACK_MODELS.openrouter
  const data = await res.json()
  return (data.data || [])
    .map((m: any) => m.id)
    .filter((id: string) => !id.includes(':free'))
    .sort()
}

async function fetchMistralModels(apiKey: string): Promise<string[]> {
  const res = await fetch(`${PROVIDER_BASE_URLS.mistral}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return FALLBACK_MODELS.mistral
  const data = await res.json()
  return (data.data || [])
    .map((m: any) => m.id)
    .sort()
}

async function fetchTogetherModels(apiKey: string): Promise<string[]> {
  const res = await fetch(`${PROVIDER_BASE_URLS.together}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return FALLBACK_MODELS.together
  const data = await res.json()
  return (data || [])
    .map((m: any) => m.id)
    .filter((id: string) => !id.includes('embed') && !id.includes('rerank'))
    .sort()
    .slice(0, 40)
}

async function fetchDeepSeekModels(apiKey: string): Promise<string[]> {
  const res = await fetch(`${PROVIDER_BASE_URLS.deepseek}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return FALLBACK_MODELS.deepseek
  const data = await res.json()
  return (data.data || [])
    .map((m: any) => m.id)
    .sort()
}

async function fetchPerplexityModels(_apiKey: string): Promise<string[]> {
  return FALLBACK_MODELS.perplexity
}

async function fetchOpenCodeModels(apiKey: string): Promise<string[]> {
  const res = await fetch(`${PROVIDER_BASE_URLS.opencode}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return FALLBACK_MODELS.opencode
  const data = await res.json()
  return (data.data || [])
    .map((m: any) => m.id)
    .filter((id: string) => id.includes('free') || id === 'big-pickle')
    .sort()
}

async function fetchLocalModels(): Promise<string[]> {
  try {
    const res = await fetch(`${PROVIDER_BASE_URLS.local}/models`)
    if (!res.ok) return FALLBACK_MODELS.local
    const data = await res.json()
    return (data.data || [])
      .filter((m: any) => !m.id.startsWith('no-think/'))
      .map((m: any) => m.id)
      .sort()
  } catch {
    return FALLBACK_MODELS.local
  }
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

async function testOpenAICompat(baseUrl: string, apiKey: string, model: string, message: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (apiKey && apiKey !== 'no-key-needed') {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: message }],
      max_tokens: 256,
    }),
  })

  const rawText = await res.text()

  if (!res.ok) {
    try {
      const errData = JSON.parse(rawText)
      throw new Error(errData.error?.message || `HTTP ${res.status}`)
    } catch (e) {
      if (e instanceof SyntaxError) throw new Error(`HTTP ${res.status}: ${rawText.slice(0, 200)}`)
      throw e
    }
  }

  try {
    const data = JSON.parse(rawText)
    return {
      response: data.choices?.[0]?.message?.content || '',
      model: data.model,
      usage: data.usage,
    }
  } catch {
    // Response might be SSE format — extract content from stream chunks
    const chunks: string[] = []
    for (const line of rawText.split('\n')) {
      if (line.startsWith('data: ') && line.slice(6) !== '[DONE]') {
        try {
          const parsed = JSON.parse(line.slice(6))
          const content = parsed.choices?.[0]?.delta?.content
          if (content) chunks.push(content)
        } catch { /* skip */ }
      }
    }
    if (chunks.length > 0) {
      return { response: chunks.join(''), model, usage: undefined }
    }
    throw new Error(`Unexpected response format: ${rawText.slice(0, 200)}`)
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
        case 'openrouter':
          models = await fetchOpenRouterModels(apiKey)
          break
        case 'mistral':
          models = await fetchMistralModels(apiKey)
          break
        case 'together':
          models = await fetchTogetherModels(apiKey)
          break
        case 'deepseek':
          models = await fetchDeepSeekModels(apiKey)
          break
        case 'perplexity':
          models = await fetchPerplexityModels(apiKey)
          break
        case 'opencode':
          models = await fetchOpenCodeModels(apiKey)
          break
        case 'local':
          models = await fetchLocalModels()
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

    if (!provider || !message) {
      return reply.status(400).send({ error: 'provider and message are required' })
    }

    if (provider !== 'local' && !apiKey) {
      return reply.status(400).send({ error: 'apiKey is required for this provider' })
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
        case 'openrouter':
        case 'mistral':
        case 'together':
        case 'deepseek':
          result = await testOpenAICompat(PROVIDER_BASE_URLS[provider], apiKey, testModel, message)
          break
        case 'perplexity':
          result = await testOpenAICompat(PROVIDER_BASE_URLS.perplexity, apiKey, testModel, message)
          break
        case 'opencode':
          result = await testOpenAICompat(PROVIDER_BASE_URLS.opencode, apiKey, testModel, message)
          break
        case 'local':
          result = await testOpenAICompat(PROVIDER_BASE_URLS.local, apiKey, testModel, message)
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
