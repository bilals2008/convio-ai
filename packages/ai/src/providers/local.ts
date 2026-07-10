import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'

const LOCAL_BASE = process.env.LOCAL_API_URL || 'http://localhost:20128/v1'

export class LocalProvider implements AIProvider {
  id = 'local'
  name = 'OmniRoute'

  private buildBody(params: GenerateParams, stream?: boolean): Record<string, unknown> {
    const body: Record<string, unknown> = {
      model: params.model,
      messages: params.messages,
      temperature: params.temperature,
      max_tokens: params.maxTokens,
    }

    if (params.tools && params.tools.length > 0) {
      body.tools = params.tools.map(t => ({
        type: 'function',
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters,
        },
      }))
    }

    if (params.reasoningEffort) body.reasoning_effort = params.reasoningEffort
    if (params.thinking !== undefined) body.thinking = params.thinking
    if (stream) body.stream = true

    return body
  }

  private async fetchCompletions(body: Record<string, unknown>, apiKey?: string): Promise<Response> {
    return fetch(`${LOCAL_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
      },
      body: JSON.stringify(body),
    })
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const body = this.buildBody(params)
    const res = await this.fetchCompletions(body, params.apiKey)

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText)
      throw new Error(`OmniRoute API error (${res.status}): ${err}`)
    }

    const data = await res.json()
    const choice = data.choices?.[0]

    return {
      content: choice?.message?.content || choice?.message?.reasoning_content || '',
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    }
  }

  async *stream(params: GenerateParams): AsyncIterable<StreamChunk> {
    const body = this.buildBody(params, true)
    const res = await this.fetchCompletions(body, params.apiKey)

    if (!res.ok) {
      const err = await res.text().catch(() => res.statusText)
      throw new Error(`OmniRoute API error (${res.status}): ${err}`)
    }

    const reader = res.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data: ')) continue

        const payload = trimmed.slice(6)
        if (payload === '[DONE]') break

        try {
          const parsed = JSON.parse(payload)
          const delta = parsed.choices?.[0]?.delta
          if (delta?.content) yield { type: 'text', content: delta.content }
          if (delta?.reasoning_content) yield { type: 'text', content: delta.reasoning_content }
        } catch { /* skip malformed SSE */ }
      }
    }

    yield { type: 'done' }
  }

  async embed(_text: string): Promise<number[]> {
    throw new Error('OmniRoute does not support embeddings')
  }

  async moderate(_text: string): Promise<ModerationResult> {
    return { flagged: false, categories: {} }
  }

  async listModels(): Promise<Model[]> {
    const response = await fetch(`${LOCAL_BASE}/models`)
    if (!response.ok) return []

    const data = await response.json() as { data: Array<{ id: string }> }
    return (data.data || []).map((m) => ({
      id: m.id,
      name: m.id,
      provider: 'local',
      maxTokens: 1048576,
      supportsTools: true,
      supportsStreaming: true,
    }))
  }
}
