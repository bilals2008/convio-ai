import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'

const LOCAL_BASE = process.env.LOCAL_API_URL || 'http://localhost:20128/v1'

export class LocalProvider implements AIProvider {
  id = 'local'
  name = 'Local API'

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
    }
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const response = await fetch(`${LOCAL_BASE}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature,
        max_tokens: params.maxTokens,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Local API error (${response.status}): ${error}`)
    }

    const data = await response.json() as {
      choices: Array<{ message: { content: string } }>
      usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }
    }

    return {
      content: data.choices[0]?.message?.content ?? '',
      usage: {
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
      },
    }
  }

  async *stream(params: GenerateParams): AsyncIterable<StreamChunk> {
    const response = await fetch(`${LOCAL_BASE}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature,
        max_tokens: params.maxTokens,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Local API error (${response.status}): ${error}`)
    }

    const reader = response.body?.getReader()
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
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            yield { type: 'done' }
            return
          }
          try {
            const parsed = JSON.parse(data) as {
              choices: Array<{ delta: { content?: string } }>
            }
            const content = parsed.choices[0]?.delta?.content
            if (content) {
              yield { type: 'text', content }
            }
          } catch { /* skip parse errors */ }
        }
      }
    }

    yield { type: 'done' }
  }

  async embed(_text: string): Promise<number[]> {
    throw new Error('Local API does not support embeddings')
  }

  async moderate(_text: string): Promise<ModerationResult> {
    return { flagged: false, categories: {} }
  }

  async listModels(): Promise<Model[]> {
    const response = await fetch(`${LOCAL_BASE}/models`, {
      headers: this.getHeaders(),
    })

    if (!response.ok) return []

    const data = await response.json() as {
      data: Array<{ id: string }>
    }

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
