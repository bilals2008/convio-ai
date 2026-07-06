import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'

const KIE_BASE = 'https://api.kie.ai'

const KIE_MODELS: Model[] = [
  { id: 'gpt-5-2', name: 'GPT 5.2', provider: 'kie', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
  { id: 'gpt-5-4', name: 'GPT 5.4', provider: 'kie', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
  { id: 'gpt-5-5', name: 'GPT 5.5', provider: 'kie', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
  { id: 'gpt-codex', name: 'GPT Codex', provider: 'kie', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
  { id: 'claude-opus-4-7', name: 'Claude Opus 4.7', provider: 'kie', maxTokens: 200000, supportsTools: true, supportsStreaming: true },
  { id: 'claude-opus-4-8', name: 'Claude Opus 4.8', provider: 'kie', maxTokens: 200000, supportsTools: true, supportsStreaming: true },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'kie', maxTokens: 200000, supportsTools: true, supportsStreaming: true },
  { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', provider: 'kie', maxTokens: 200000, supportsTools: true, supportsStreaming: true },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', provider: 'kie', maxTokens: 200000, supportsTools: true, supportsStreaming: true },
  { id: 'claude-fable-5', name: 'Claude Fable 5', provider: 'kie', maxTokens: 200000, supportsTools: true, supportsStreaming: true },
  { id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro', provider: 'kie', maxTokens: 1000000, supportsTools: true, supportsStreaming: true },
  { id: 'gemini-2-5-flash', name: 'Gemini 2.5 Flash', provider: 'kie', maxTokens: 1000000, supportsTools: true, supportsStreaming: true },
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', provider: 'kie', maxTokens: 1000000, supportsTools: true, supportsStreaming: true },
  { id: 'gemini-3-flash', name: 'Gemini 3 Flash', provider: 'kie', maxTokens: 1000000, supportsTools: true, supportsStreaming: true },
  { id: 'gemini-3-1-pro', name: 'Gemini 3.1 Pro', provider: 'kie', maxTokens: 1000000, supportsTools: true, supportsStreaming: true },
  { id: 'gemini-3-5-flash', name: 'Gemini 3.5 Flash', provider: 'kie', maxTokens: 1000000, supportsTools: true, supportsStreaming: true },
]

export class KIEProvider implements AIProvider {
  id = 'kie'
  name = 'KIE AI'

  private getHeaders() {
    return {
      'Authorization': `Bearer ${process.env.KIE_API_KEY}`,
      'Content-Type': 'application/json',
    }
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const response = await fetch(`${KIE_BASE}/${params.model}/v1/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature,
        max_tokens: params.maxTokens,
      }),
    })

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
    const response = await fetch(`${KIE_BASE}/${params.model}/v1/chat/completions`, {
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
    throw new Error('KIE API does not support embeddings')
  }

  async moderate(_text: string): Promise<ModerationResult> {
    return { flagged: false, categories: {} }
  }

  async listModels(): Promise<Model[]> {
    return KIE_MODELS
  }
}

export function getKieModels(): Model[] {
  return KIE_MODELS
}
