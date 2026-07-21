import { generateText, streamText, embed, jsonSchema } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'
import { toProviderError } from './errors.js'

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

  async listModels(): Promise<Model[]> {
    return [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        provider: 'google',
        maxTokens: 1000000,
        supportsTools: true,
        supportsStreaming: true,
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        provider: 'google',
        maxTokens: 1000000,
        supportsTools: true,
        supportsStreaming: true,
      },
    ]
  }
}
