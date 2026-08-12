import { generateText, streamText, jsonSchema } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'
import { toProviderError } from './errors.js'
import { fetchOpenAICompatibleModels, getCachedModels, modelCacheKey } from './model-cache.js'

/**
 * One class for the providers that expose a plain OpenAI-compatible API
 * (Mistral, Together, DeepSeek, Perplexity, ...). No curated model list here —
 * models are always fetched live so new ones show up as providers ship them.
 * ponytail: single implementation, config-driven; add a new BYOK provider here
 * and register it in index.ts instead of copying a whole provider file.
 */
export class OpenAICompatibleProvider implements AIProvider {
  id: string
  name: string
  private baseURL: string
  private envKey: string

  constructor(config: { id: string; name: string; baseURL: string; envKey?: string }) {
    this.id = config.id
    this.name = config.name
    this.baseURL = config.baseURL
    this.envKey = config.envKey || `${config.id.toUpperCase()}_API_KEY`
  }

  private getClient(apiKey?: string) {
    return createOpenAICompatible({
      baseURL: this.baseURL,
      name: this.id,
      apiKey: apiKey || process.env[this.envKey],
    })
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    try {
      const result = await generateText({
        model: this.getClient(params.apiKey).chatModel(params.model),
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
      throw toProviderError(error, this.name)
    }
  }

  async *stream(params: GenerateParams): AsyncIterable<StreamChunk> {
    const tools = params.tools?.reduce((acc: any, t) => {
      acc[t.name] = { description: t.description, inputSchema: jsonSchema(t.parameters as any) }
      return acc
    }, {} as any)

    try {
      const result = streamText({
        model: this.getClient(params.apiKey).chatModel(params.model),
        messages: params.messages,
        allowSystemInMessages: true,
        temperature: params.temperature,
        maxOutputTokens: params.maxTokens,
        ...(tools && Object.keys(tools).length > 0 ? { tools } : {}),
      })

      for await (const chunk of result.fullStream) {
        if (chunk.type === 'error') throw chunk.error
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
            usage: u
              ? {
                  promptTokens: u.inputTokens ?? 0,
                  completionTokens: u.outputTokens ?? 0,
                  totalTokens: u.totalTokens ?? 0,
                }
              : undefined,
          }
        }
      }
    } catch (error) {
      throw toProviderError(error, this.name)
    }
  }

  async embed(_text: string): Promise<number[]> {
    throw new Error(`${this.name} does not support embeddings`)
  }

  async moderate(_text: string): Promise<ModerationResult> {
    return { flagged: false, categories: {} }
  }

  async listModels(apiKey?: string): Promise<Model[]> {
    try {
      return await getCachedModels(modelCacheKey(this.id, apiKey), 10 * 60 * 1000, () =>
        fetchOpenAICompatibleModels(this.baseURL, this.id, apiKey || process.env[this.envKey]),
      )
    } catch {
      return []
    }
  }
}
