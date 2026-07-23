import { generateText, streamText, jsonSchema } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'
import { toProviderError, isUpstreamFailure, sleep } from './errors.js'

const ZEN_API_BASE = 'https://opencode.ai/zen/v1'

interface ZenModel {
  id: string
  object: string
  created: number
  owned_by: string
}

function toPrefixedId(raw: string): string {
  return `opencode/${raw}`
}

function stripPrefix(prefixed: string): string {
  return prefixed.startsWith('opencode/') ? prefixed.slice(9) : prefixed
}

export class OpenCodeProvider implements AIProvider {
  id = 'opencode'
  name = 'OpenCode Zen'

  private getClient(apiKey?: string) {
    return createOpenAICompatible({
      baseURL: ZEN_API_BASE,
      name: 'opencode',
      apiKey: apiKey || process.env.OPENCODE_API_KEY,
    })
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const maxRetries = 2
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await generateText({
          model: this.getClient(params.apiKey).chatModel(stripPrefix(params.model)),
          messages: params.messages,
          allowSystemInMessages: true,
          temperature: params.temperature,
          maxOutputTokens: params.maxTokens,
        })

        return {
          content: result.text,
          usage: {
            promptTokens: result.usage.inputTokens ?? 0,
            completionTokens: result.usage.outputTokens ?? 0,
            totalTokens: result.usage.totalTokens ?? 0,
          },
        }
      } catch (error) {
        if (attempt < maxRetries && isUpstreamFailure(error)) {
          await sleep(1000 * attempt)
          continue
        }
        throw toProviderError(error, 'OpenCode')
      }
    }
    throw new Error('Unreachable')
  }

  async *stream(params: GenerateParams): AsyncIterable<StreamChunk> {
    const tools = params.tools?.reduce((acc: any, t) => {
      acc[t.name] = { description: t.description, inputSchema: jsonSchema(t.parameters as any) }
      return acc
    }, {} as any)

    const maxRetries = 2
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = streamText({
          model: this.getClient(params.apiKey).chatModel(stripPrefix(params.model)),
          messages: params.messages,
          allowSystemInMessages: true,
          temperature: params.temperature,
          maxOutputTokens: params.maxTokens,
          ...(tools && Object.keys(tools).length > 0 && { tools }),
        })

        for await (const chunk of result.fullStream) {
          if (chunk.type === 'text-delta' && chunk.text) {
            yield { type: 'text', content: chunk.text }
          }
          if (chunk.type === 'reasoning-delta' && chunk.text) {
            yield { type: 'reasoning', content: chunk.text }
          }
          if (chunk.type === 'tool-call') {
            yield {
              type: 'tool_call',
              toolCall: {
                id: chunk.toolCallId,
                name: chunk.toolName,
                arguments: chunk.input as Record<string, unknown>,
              },
            }
          }
          if (chunk.type === 'finish') {
            const u = chunk.totalUsage
            yield {
              type: 'done',
              usage: u ? {
                promptTokens: u.inputTokens ?? 0,
                completionTokens: u.outputTokens ?? 0,
                totalTokens: u.totalTokens ?? 0,
              } : undefined,
            }
          }
        }
        return
      } catch (error) {
        if (attempt < maxRetries && isUpstreamFailure(error)) {
          await sleep(1000 * attempt)
          continue
        }
        throw toProviderError(error, 'OpenCode')
      }
    }
  }

  async embed(_text: string): Promise<number[]> {
    throw new Error('OpenCode Zen does not support embeddings')
  }

  async moderate(_text: string): Promise<ModerationResult> {
    return { flagged: false, categories: {} }
  }

  async listModels(): Promise<Model[]> {
    try {
      const res = await fetch(`${ZEN_API_BASE}/models`)
      if (!res.ok) throw new Error(`Zen API returned ${res.status}`)
      const body = await res.json() as { data: ZenModel[] }
      if (!body?.data?.length) throw new Error('No models in response')

      return body.data
        .filter((m: ZenModel) => m.id.endsWith('-free'))
        .map((m: ZenModel) => ({
          id: toPrefixedId(m.id),
          name: m.id.replace(/-free$/i, ''),
          provider: 'opencode',
          maxTokens: 128000,
          supportsTools: m.id.includes('codex') || !m.id.includes('nano'),
          supportsStreaming: true,
        }))
    } catch {
      return [
        { id: 'opencode/deepseek-v4-flash-free', name: 'DeepSeek V4 Flash', provider: 'opencode', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
        { id: 'opencode/mimo-v2.5-free', name: 'Mimo 2.5', provider: 'opencode', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
        { id: 'opencode/nemotron-3-ultra-free', name: 'Nemotron 3 Ultra', provider: 'opencode', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
        { id: 'opencode/north-mini-code-free', name: 'North Mini Code', provider: 'opencode', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
        { id: 'opencode/laguna-s-2.1-free', name: 'Laguna S 2.1', provider: 'opencode', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
      ]
    }
  }
}
