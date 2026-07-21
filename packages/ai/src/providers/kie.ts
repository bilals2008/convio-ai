import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'
import { toProviderError } from './errors.js'

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

  private getHeaders(apiKey?: string) {
    return {
      'Authorization': `Bearer ${apiKey || process.env.KIE_API_KEY}`,
      'Content-Type': 'application/json',
    }
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    try {
    const response = await fetch(`${KIE_BASE}/${params.model}/v1/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(params.apiKey),
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature,
        max_tokens: params.maxTokens,
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => null)
      throw new Error(err?.error?.message || `KIE API error: ${response.status}`)
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
    } catch (error) {
      throw toProviderError(error, 'KIE')
    }
  }

  async *stream(params: GenerateParams): AsyncIterable<StreamChunk> {
    const body: Record<string, unknown> = {
      model: params.model,
      messages: params.messages,
      temperature: params.temperature,
      max_tokens: params.maxTokens,
      stream: true,
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

    const response = await fetch(`${KIE_BASE}/${params.model}/v1/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(params.apiKey),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => null)
      throw toProviderError(new Error(err?.error?.message || `KIE API error: ${response.status}`), 'KIE')
    }

    const reader = response.body?.getReader()
    if (!reader) throw toProviderError(new Error('No response body'), 'KIE')

    const decoder = new TextDecoder()
    let buffer = ''
    const toolCallAccum: Record<number, { id: string; name: string; arguments: string }> = {}
    let usage: { promptTokens: number; completionTokens: number; totalTokens: number } | undefined

    // Emit any accumulated tool calls. Must run before yielding `done` so tool
    // calls aren't dropped when the stream terminates with `[DONE]`.
    const flushToolCalls = function* (): Generator<StreamChunk> {
      for (const tc of Object.values(toolCallAccum)) {
        if (!tc.name) continue
        let args: Record<string, unknown> = {}
        try {
          args = tc.arguments ? JSON.parse(tc.arguments) as Record<string, unknown> : {}
        } catch { /* keep empty args for malformed tool call JSON */ }
        yield {
          type: 'tool_call',
          toolCall: { id: tc.id, name: tc.name, arguments: args },
        }
      }
    }

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
            yield* flushToolCalls()
            yield { type: 'done', usage }
            return
          }
          try {
            const parsed = JSON.parse(data) as {
              choices: Array<{ delta: { content?: string; tool_calls?: Array<{ index: number; id?: string; type?: string; function?: { name?: string; arguments?: string } }> } }>
              usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }
            }
            if (parsed.usage) {
              usage = {
                promptTokens: parsed.usage.prompt_tokens ?? 0,
                completionTokens: parsed.usage.completion_tokens ?? 0,
                totalTokens: parsed.usage.total_tokens ?? 0,
              }
            }
            const delta = parsed.choices[0]?.delta
            if (delta?.content) {
              yield { type: 'text', content: delta.content }
            }
            if (delta?.tool_calls) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index
                if (tc.id || !toolCallAccum[idx]) {
                  toolCallAccum[idx] = {
                    id: tc.id || toolCallAccum[idx]?.id || `call_${idx}`,
                    name: tc.function?.name || toolCallAccum[idx]?.name || '',
                    arguments: (toolCallAccum[idx]?.arguments || '') + (tc.function?.arguments || ''),
                  }
                } else {
                  if (tc.function?.name) toolCallAccum[idx].name = tc.function.name
                  toolCallAccum[idx].arguments += tc.function?.arguments || ''
                }
              }
            }
          } catch { /* skip parse errors */ }
        }
      }
    }

    // Stream ended without an explicit `[DONE]` marker.
    yield* flushToolCalls()
    yield { type: 'done', usage }
  }

  async embed(_text: string): Promise<number[]> {
    throw toProviderError(new Error('KIE does not support embeddings'), 'KIE')
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
