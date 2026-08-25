import { generateText, streamText, embed, jsonSchema } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'
import { toProviderError } from './errors.js'
import { fetchOpenAICompatibleModels, getCachedModels, modelCacheKey } from './model-cache.js'

export class OpenAIProvider implements AIProvider {
  id = 'openai'
  name = 'OpenAI'

  private getClient(apiKey?: string) {
    return createOpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY })
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    try {
      const result = await generateText({
        model: this.getClient(params.apiKey)(params.model),
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
      throw toProviderError(error, 'OpenAI')
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
      throw toProviderError(error, 'OpenAI')
    }
  }

  async embed(text: string): Promise<number[]> {
    try {
      const result = await embed({
        model: this.getClient().textEmbeddingModel('text-embedding-3-small'),
        value: text,
      })
      return result.embedding
    } catch (error) {
      throw toProviderError(error, 'OpenAI')
    }
  }

  async moderate(text: string, apiKey?: string): Promise<ModerationResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey || process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: text }),
      })
      const data = await response.json() as { results: Array<{ flagged: boolean; categories: Record<string, boolean> }> }
      const result = data.results[0]
      return {
        flagged: result.flagged,
        categories: result.categories,
      }
    } catch {
      return { flagged: false, categories: {} }
    }
  }

  async listModels(apiKey?: string): Promise<Model[]> {
    const fallback: Model[] = [
      { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
    ]
    try {
      return await getCachedModels(modelCacheKey(this.id, apiKey), 10 * 60 * 1000, () =>
        fetchOpenAICompatibleModels('https://api.openai.com/v1', this.id, apiKey || process.env.OPENAI_API_KEY),
      )
    } catch {
      return fallback
    }
  }
}
