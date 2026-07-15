import { generateText, streamText, jsonSchema } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'

export class AnthropicProvider implements AIProvider {
  id = 'anthropic'
  name = 'Anthropic'

  private getClient(apiKey?: string) {
    return createAnthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY })
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const sysMsg = params.messages.find(m => m.role === 'system')
    const chatMessages = params.messages.filter(m => m.role !== 'system')
    const result = await generateText({
      model: this.getClient(params.apiKey)(params.model),
      messages: chatMessages,
      ...(sysMsg && { instructions: sysMsg.content }),
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
  }

  async *stream(params: GenerateParams): AsyncIterable<StreamChunk> {
    const sysMsg = params.messages.find(m => m.role === 'system')
    const chatMessages = params.messages.filter(m => m.role !== 'system')

    const tools = params.tools?.reduce((acc: any, t) => {
      acc[t.name] = { description: t.description, inputSchema: jsonSchema(t.parameters as any) }
      return acc
    }, {} as any)

    const result = streamText({
      model: this.getClient(params.apiKey)(params.model),
      messages: chatMessages,
      ...(sysMsg && { instructions: sysMsg.content }),
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
  }

  async embed(_text: string): Promise<number[]> {
    throw new Error('Anthropic does not support embeddings')
  }

  async moderate(_text: string): Promise<ModerationResult> {
    return {
      flagged: false,
      categories: {},
    }
  }

  async listModels(): Promise<Model[]> {
    return [
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'anthropic',
        maxTokens: 200000,
        supportsTools: true,
        supportsStreaming: true,
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'anthropic',
        maxTokens: 200000,
        supportsTools: true,
        supportsStreaming: true,
      },
    ]
  }
}
