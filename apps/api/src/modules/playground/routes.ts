import type { FastifyInstance } from 'fastify'

interface PlaygroundTestRequest {
  provider: string
  apiKey: string
  model?: string
  message: string
  tools?: any[]
}

interface CompareProviderConfig {
  provider: string
  apiKey: string
  model?: string
}

interface ToolDemoRequest {
  provider: string
  apiKey: string
  model?: string
  message: string
}

interface CompareRequest {
  providers: CompareProviderConfig[]
  message: string
  tools?: any[]
}

const PROVIDER_BASE_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1',
  anthropic: 'https://api.anthropic.com/v1',
  google: 'https://generativelanguage.googleapis.com/v1beta',
  groq: 'https://api.groq.com/openai/v1',
  kie: 'https://api.kie.ai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
  opencode: 'https://opencode.ai/zen/v1',
  agentrouter: 'https://agentrouter.org/v1',
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
  agentrouter: ['claude-sonnet-4-5-20250929', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307', 'gpt-4o', 'gpt-4o-mini'],
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

async function fetchAgentRouterModels(apiKey: string): Promise<string[]> {
  try {
    const res = await fetch(`${PROVIDER_BASE_URLS.agentrouter}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) return FALLBACK_MODELS.agentrouter
    const data = await res.json()
    return (data.data || [])
      .map((m: any) => m.id)
      .sort()
  } catch {
    return FALLBACK_MODELS.agentrouter
  }
}

async function fetchOpenCodeModels(apiKey: string): Promise<string[]> {
  const res = await fetch(`${PROVIDER_BASE_URLS.opencode}/models`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  if (!res.ok) return FALLBACK_MODELS.opencode
  const data = await res.json()
  const allModels: string[] = (data.data || []).map((m: any) => m.id)
  const freeModels = allModels.filter((id: string) => id.includes('free') || id === 'big-pickle')
  if (freeModels.length === 0) {
    return FALLBACK_MODELS.opencode
  }
  return freeModels.sort()
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

async function testOpenAI(apiKey: string, model: string, message: string, tools?: any[]) {
  const body: any = {
    model,
    messages: [{ role: 'user', content: message }],
    max_tokens: 256,
  }
  if (tools && tools.length > 0) body.tools = tools
  const res = await fetch(`${PROVIDER_BASE_URLS.openai}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
  return {
    response: extractContent(data.choices?.[0]) || '',
    toolCalls: extractToolCalls(data.choices?.[0]),
    model: data.model,
    usage: data.usage,
  }
}

async function testAnthropic(apiKey: string, model: string, message: string, tools?: any[]) {
  const body: any = {
    model,
    max_tokens: 256,
    messages: [{ role: 'user', content: message }],
  }
  if (tools && tools.length > 0) body.tools = tools
  const res = await fetch(`${PROVIDER_BASE_URLS.anthropic}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
  const toolUseBlocks = data.content?.filter((c: any) => c.type === 'tool_use') || []
  return {
    response: data.content?.[0]?.text || '',
    toolCalls: toolUseBlocks.map((t: any) => ({ name: t.name, args: t.input })),
    model: data.model,
    usage: data.usage,
  }
}

async function testGoogle(apiKey: string, model: string, message: string, tools?: any[]) {
  const body: any = {
    contents: [{ parts: [{ text: message }] }],
    generationConfig: { maxOutputTokens: 256 },
  }
  if (tools && tools.length > 0) {
    body.tools = tools.map((t) => ({
      functionDeclarations: [{
        name: t.function?.name || t.name,
        description: t.function?.description || t.description,
        parameters: t.function?.parameters || t.parameters,
      }],
    }))
  }
  const res = await fetch(
    `${PROVIDER_BASE_URLS.google}/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
  return {
    response: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
    toolCalls: (data.candidates?.[0]?.content?.parts || [])
      .filter((p: any) => p.functionCall)
      .map((p: any) => ({ name: p.functionCall.name, args: p.functionCall.args })),
    model,
    usage: data.usageMetadata,
  }
}

async function testGroq(apiKey: string, model: string, message: string, tools?: any[]) {
  const body: any = {
    model,
    messages: [{ role: 'user', content: message }],
    max_tokens: 256,
  }
  if (tools && tools.length > 0) body.tools = tools
  const res = await fetch(`${PROVIDER_BASE_URLS.groq}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
  return {
    response: extractContent(data.choices?.[0]) || '',
    toolCalls: extractToolCalls(data.choices?.[0]),
    model: data.model,
    usage: data.usage,
  }
}

async function testKIE(apiKey: string, model: string, message: string, tools?: any[]) {
  const body: any = {
    model,
    messages: [{ role: 'user', content: message }],
    max_tokens: 256,
  }
  if (tools && tools.length > 0) body.tools = tools
  const res = await fetch(`${PROVIDER_BASE_URLS.kie}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`)
  return {
    response: extractContent(data.choices?.[0]) || '',
    toolCalls: extractToolCalls(data.choices?.[0]),
    model: data.model,
    usage: data.usage,
  }
}

function extractContent(choice: any): string {
  const msg = choice?.message || choice?.delta || {}
  if (msg.content) return msg.content
  if (Array.isArray(msg.content)) {
    return msg.content.map((p: any) => p.text || '').join('')
  }
  if (choice?.text) return choice.text
  if (msg.reasoning_content) return msg.reasoning_content
  if (msg.reasoning) return msg.reasoning
  return ''
}

function extractToolCalls(choice: any): Array<{ name: string; args: any }> | undefined {
  const calls = choice?.message?.tool_calls
  if (!calls || calls.length === 0) return undefined
  return calls.map((tc: any) => ({
    id: tc.id,
    name: tc.function?.name || '',
    args: (() => {
      try { return JSON.parse(tc.function?.arguments || '{}') } catch { return tc.function?.arguments }
    })(),
  }))
}

async function testOpenAICompat(baseUrl: string, apiKey: string, model: string, message: string, tools?: any[]) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (apiKey && apiKey !== 'no-key-needed') {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  const body: any = {
    model,
    messages: [{ role: 'user', content: message }],
    max_tokens: 1024,
  }
  if (tools && tools.length > 0) body.tools = tools

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
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

  // Try JSON parse first
  try {
    const data = JSON.parse(rawText)
    if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error))
    }
    const choice = data.choices?.[0]
    const response = extractContent(choice)
    if (response) {
      return {
        response,
        model: data.model,
        usage: data.usage,
      }
    }
  } catch (e) {
    if (e instanceof Error && e.message !== rawText.slice(0, 100)) throw e
  }

  // SSE parsing — extract proper delta chunks
  const chunks: string[] = []
  let hasContent = false
  for (const line of rawText.split('\n')) {
    if (line.startsWith('data: ') && line.slice(6) !== '[DONE]') {
      try {
        const parsed = JSON.parse(line.slice(6))
        const content = extractContent(parsed.choices?.[0])
        if (content) {
          chunks.push(content)
          hasContent = true
        }
      } catch { /* skip malformed SSE lines */ }
    }
  }
  if (hasContent) {
    return { response: chunks.join(''), model, usage: undefined }
  }

  // Last resort: try all possible content fields
  try {
    const data = JSON.parse(rawText)
    const msg = data.choices?.[0]?.message || {}
    const text = msg.content
      || msg.reasoning_content
      || msg.reasoning
      || data.choices?.[0]?.text
      || data.response
      || data.content
      || data.candidates?.[0]?.content?.parts?.[0]?.text
      || data.message?.content
      || data.generated_text
      || data.output
      || data.result
    if (text && text !== message) {
      return { response: text, model: data.model || model, usage: data.usage }
    }
  } catch { /* ignore */ }

  throw new Error(`Provider returned: ${rawText.slice(0, 500)}`)
}

async function runSingleTest(
  provider: string,
  apiKey: string,
  model: string | undefined,
  message: string,
  tools?: any[]
): Promise<{
  success: boolean
  response?: string
  toolCalls?: Array<{ name: string; args: any }>
  model: string
  usage?: any
  latencyMs: number
  error?: string
}> {
  const baseUrl = PROVIDER_BASE_URLS[provider]
  const fallbackModels = FALLBACK_MODELS[provider] || []
  const testModel = model || fallbackModels[0]
  const startTime = Date.now()

  try {
    let result: { response: string; model: string; usage?: any; toolCalls?: Array<{ name: string; args: any }> }

    switch (provider) {
      case 'openai':
        result = await testOpenAI(apiKey, testModel, message, tools)
        break
      case 'anthropic':
        result = await testAnthropic(apiKey, testModel, message, tools)
        break
      case 'google':
        result = await testGoogle(apiKey, testModel, message, tools)
        break
      case 'groq':
        result = await testGroq(apiKey, testModel, message, tools)
        break
      case 'kie':
        result = await testKIE(apiKey, testModel, message, tools)
        break
      case 'openrouter':
      case 'mistral':
      case 'together':
      case 'deepseek':
      case 'agentrouter':
        result = await testOpenAICompat(PROVIDER_BASE_URLS[provider], apiKey, testModel, message, tools)
        break
      case 'perplexity':
        result = await testOpenAICompat(PROVIDER_BASE_URLS.perplexity, apiKey, testModel, message, tools)
        break
      case 'opencode':
        result = await testOpenAICompat(PROVIDER_BASE_URLS.opencode, apiKey, testModel, message, tools)
        break
      case 'local':
        result = await testOpenAICompat(PROVIDER_BASE_URLS.local, apiKey, testModel, message, tools)
        break
      default:
        return { success: false, error: `Unsupported provider: ${provider}`, model: testModel, latencyMs: 0 }
    }

    return { success: true, ...result, model: result.model || testModel, latencyMs: Date.now() - startTime }
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error', model: testModel, latencyMs: Date.now() - startTime }
  }
}

// In-memory stores for demonstration
const DEMO_LEADS: Array<{ name: string; email: string; interest: string; savedAt: string }> = []
const DEMO_EMAILS: Array<{ to: string; subject: string; body: string; sentAt: string }> = []

const DEMO_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'saveLead',
      description: 'Save a lead with name, email, and interest. Only use this when the user explicitly asks to save or create a lead.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Lead name' },
          email: { type: 'string', description: 'Lead email' },
          interest: { type: 'string', description: 'What they are interested in' },
        },
        required: ['name', 'email', 'interest'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'sendEmail',
      description: 'Send an email to a recipient with a subject and body. Only use when the user explicitly asks to send an email.',
      parameters: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient email address' },
          subject: { type: 'string', description: 'Email subject line' },
          body: { type: 'string', description: 'Email body content' },
        },
        required: ['to', 'subject', 'body'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getCurrentTime',
      description: 'Get the current date and time',
      parameters: { type: 'object', properties: {} },
    },
  },
]

async function executeDemoTool(name: string, args: any): Promise<string> {
  if (name === 'saveLead') {
    const { name: leadName, email, interest } = args as { name: string; email: string; interest: string }
    DEMO_LEADS.push({ name: leadName, email, interest, savedAt: new Date().toISOString() })
    return JSON.stringify({ success: true, message: `Lead "${leadName}" saved successfully. Total leads: ${DEMO_LEADS.length}` })
  }
  if (name === 'sendEmail') {
    const { to, subject, body } = args as { to: string; subject: string; body: string }
    DEMO_EMAILS.push({ to, subject, body, sentAt: new Date().toISOString() })
    return JSON.stringify({ success: true, message: `Email sent to "${to}" with subject "${subject}". Total emails sent: ${DEMO_EMAILS.length}` })
  }
  if (name === 'getCurrentTime') {
    return JSON.stringify({ time: new Date().toLocaleString() })
  }
  return JSON.stringify({ error: `Unknown tool: ${name}` })
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
        case 'agentrouter':
          models = await fetchAgentRouterModels(apiKey)
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
    const { provider, apiKey, model, message, tools } = request.body as PlaygroundTestRequest

    if (!provider || !message) {
      return reply.status(400).send({ error: 'provider and message are required' })
    }

    if (provider !== 'local' && !apiKey) {
      return reply.status(400).send({ error: 'apiKey is required for this provider' })
    }

    const result = await runSingleTest(provider, apiKey, model, message, tools)
    return { provider, ...result }
  })

  // Compare multiple providers with the same message
  fastify.post('/playground/compare', async (request, reply) => {
    const { providers, message, tools } = request.body as CompareRequest

    if (!providers || providers.length === 0 || !message) {
      return reply.status(400).send({ error: 'providers (array) and message are required' })
    }

    const results = await Promise.allSettled(
      providers.map((p) => runSingleTest(p.provider, p.apiKey, p.model, message, tools))
    )

    return {
      results: providers.map((p, i) => {
        const r = results[i]
        if (r.status === 'fulfilled') {
          return {
            provider: p.provider,
            ...r.value,
            model: p.model || r.value.model || FALLBACK_MODELS[p.provider]?.[0] || '',
          }
        }
        return {
          provider: p.provider,
          success: false,
          error: r.reason?.message || 'Unknown error',
          latencyMs: 0,
          model: p.model || FALLBACK_MODELS[p.provider]?.[0] || '',
        }
      }),
    }
  })

  // Tool demo — full agentic loop with tool execution
  fastify.post('/playground/tool-demo', async (request, reply) => {
    const { provider, apiKey, model, message } = request.body as ToolDemoRequest

    if (!provider || !message) {
      return reply.status(400).send({ error: 'provider and message are required' })
    }

    const baseUrl = PROVIDER_BASE_URLS[provider]
    if (!baseUrl) return reply.status(400).send({ error: `Unknown provider: ${provider}` })

    const fallbackModels = FALLBACK_MODELS[provider] || []
    const testModel = model || fallbackModels[0]

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (apiKey && apiKey !== 'no-key-needed') {
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const trace: Array<{ role: string; content?: string; tool_calls?: any[]; tool_call_id?: string; name?: string }> = []
    const messages: Array<{ role: string; content?: string; tool_calls?: any[]; tool_call_id?: string; name?: string }> = [
      { role: 'user', content: message },
    ]

    const startTime = Date.now()
    let finalResponse = ''
    let totalUsage: any

    async function callAI(): Promise<{ choice: any; model: string; usage: any }> {
      const body: any = {
        model: testModel,
        messages,
        tools: DEMO_TOOLS,
        max_tokens: 1024,
      }
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const errText = await res.text().catch(() => res.statusText)
        throw new Error(`API error (${res.status}): ${errText}`)
      }
      const data = await res.json()
      return { choice: data.choices?.[0], model: data.model || testModel, usage: data.usage }
    }

    // Round 1: AI decides whether to use tools or reply directly
    const round1 = await callAI()
    const msg1 = round1.choice?.message || {}
    totalUsage = round1.usage
    trace.push({ role: 'assistant', content: msg1.content, tool_calls: msg1.tool_calls })

    if (msg1.tool_calls && msg1.tool_calls.length > 0) {
      messages.push({ role: 'assistant', content: msg1.content || null, tool_calls: msg1.tool_calls })

      for (const tc of msg1.tool_calls) {
        const name = tc.function?.name || ''
        const args = (() => { try { return JSON.parse(tc.function?.arguments || '{}') } catch { return {} } })()
        const result = await executeDemoTool(name, args)
        messages.push({ role: 'tool', tool_call_id: tc.id, name, content: result })
        trace.push({ role: 'tool', tool_call_id: tc.id, name, content: result })
      }

      // Round 2: AI uses tool results to form final answer
      const round2 = await callAI()
      const msg2 = round2.choice?.message || {}
      finalResponse = msg2.content || ''
      totalUsage = round2.usage
      if (msg2.tool_calls) {
        trace.push({ role: 'assistant', content: msg2.content, tool_calls: msg2.tool_calls })
      } else {
        trace.push({ role: 'assistant', content: msg2.content })
      }
    } else {
      finalResponse = msg1.content || ''
    }

    const latencyMs = Date.now() - startTime

    return {
      success: true,
      response: finalResponse,
      trace,
      model: round1.model,
      latencyMs,
      usage: totalUsage,
      totalLeads: DEMO_LEADS.length,
      leads: DEMO_LEADS,
      totalEmails: DEMO_EMAILS.length,
      emails: DEMO_EMAILS,
    }
  })
}
