import { generateText, streamText, jsonSchema } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'
import { toProviderError } from './errors.js'
import { fetchOpenAICompatibleModels, getCachedModels, modelCacheKey } from './model-cache.js'

export class GroqProvider implements AIProvider {
  id = 'groq'
  name = 'Groq'

  private getClient(apiKey?: string) {
    return createOpenAICompatible({
      baseURL: 'https://api.groq.com/openai/v1',
      name: 'groq',
      apiKey: apiKey || process.env.GROQ_API_KEY,
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
        abortSignal: params.signal,
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
      throw toProviderError(error, 'Groq')
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
        ...(tools && Object.keys(tools).length > 0 && { tools }),
        abortSignal: params.signal,
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
      throw toProviderError(error, 'Groq')
    }
  }

  async embed(_text: string): Promise<number[]> {
    throw new Error('Groq does not support embeddings')
  }

  async moderate(_text: string): Promise<ModerationResult> {
    return { flagged: false, categories: {} }
  }

  async listModels(apiKey?: string): Promise<Model[]> {
    const fallback: Model[] = [
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', provider: 'groq', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'groq', maxTokens: 32768, supportsTools: false, supportsStreaming: true },
    ]
    try {
      return await getCachedModels(modelCacheKey(this.id, apiKey), 10 * 60 * 1000, () =>
        fetchOpenAICompatibleModels('https://api.groq.com/openai/v1', this.id, apiKey || process.env.GROQ_API_KEY),
      )
    } catch {
      return fallback
    }
  }
}
