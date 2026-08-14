import { generateText, streamText, embed, jsonSchema } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'
import { toProviderError } from './errors.js'
import { getCachedModels, modelCacheKey } from './model-cache.js'

export class GoogleProvider implements AIProvider {
  id = 'google'
  name = 'Google'

  private getClient(apiKey?: string) {
    return createGoogleGenerativeAI({ apiKey: apiKey || process.env.GOOGLE_API_KEY })
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    try {
      const result = await generateText({
        model: this.getClient(params.apiKey)(params.model),
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
      throw toProviderError(error, 'Google')
    }
  }

  async *stream(params: GenerateParams): AsyncIterable<StreamChunk> {
    const tools = params.tools?.reduce((acc: any, t) => {
      acc[t.name] = { description: t.description, inputSchema: jsonSchema(t.parameters as any) }
      return acc
    }, {} as any)

    try {
      const result = streamText({
        model: this.getClient(params.apiKey)(params.model),
        messages: params.messages,
        allowSystemInMessages: true,
        temperature: params.temperature,
        maxOutputTokens: params.maxTokens,
        ...(tools && Object.keys(tools).length > 0 && { tools }),
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
            usage: u ? {
              promptTokens: u.inputTokens ?? 0,
              completionTokens: u.outputTokens ?? 0,
              totalTokens: u.totalTokens ?? 0,
            } : undefined,
          }
        }
      }
    } catch (error) {
      throw toProviderError(error, 'Google')
    }
  }

  async embed(text: string): Promise<number[]> {
    try {
      const result = await embed({
        model: this.getClient().textEmbeddingModel('text-embedding-004'),
        value: text,
      })
      return result.embedding
    } catch (error) {
      throw toProviderError(error, 'Google')
    }
  }

  async moderate(_text: string): Promise<ModerationResult> {
    return { flagged: false, categories: {} }
  }

  async listModels(apiKey?: string): Promise<Model[]> {
    const fallback: Model[] = [
      { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'google', maxTokens: 65536, supportsTools: true, supportsStreaming: true },
      { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'google', maxTokens: 65536, supportsTools: true, supportsStreaming: true },
      { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite', provider: 'google', maxTokens: 65536, supportsTools: true, supportsStreaming: true },
      { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Preview)', provider: 'google', maxTokens: 65536, supportsTools: true, supportsStreaming: true },
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Preview)', provider: 'google', maxTokens: 65536, supportsTools: true, supportsStreaming: true },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google', maxTokens: 65536, supportsTools: true, supportsStreaming: true },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', provider: 'google', maxTokens: 65536, supportsTools: true, supportsStreaming: true },
    ]
    try {
      return await getCachedModels(modelCacheKey(this.id, apiKey), 10 * 60 * 1000, async () => {
        const key = apiKey || process.env.GOOGLE_API_KEY
        if (!key) return fallback
        const res = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key),
          { signal: AbortSignal.timeout(10000) },
        )
        if (!res.ok) throw new Error(`Models API returned ${res.status}`)
        const body = await res.json() as { models: Array<{
          name: string
          displayName?: string
          outputTokenLimit?: number
          inputTokenLimit?: number
          supportedGenerationMethods?: string[]
        }> }
        if (!body?.models?.length) throw new Error('No models in response')
        return body.models
          .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m) => ({
            id: m.name.replace('models/', ''),
            name: m.displayName || m.name.replace('models/', ''),
            provider: 'google' as const,
            maxTokens: m.outputTokenLimit || m.inputTokenLimit || 65536,
            supportsTools: true,
            supportsStreaming: true,
          }))
      })
    } catch {
      return fallback
    }
  }
}
