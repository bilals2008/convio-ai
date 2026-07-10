import { generateText, streamText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'

export class AnthropicProvider implements AIProvider {
  id = 'anthropic'
  name = 'Anthropic'

  private getClient(apiKey?: string) {
    return createAnthropic({ apiKey: apiKey || process.env.ANTHROPIC_API_KEY })
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const result = await generateText({
      model: this.getClient(params.apiKey)(params.model),
      messages: params.messages,
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
    const result = streamText({
      model: this.getClient(params.apiKey)(params.model),
      messages: params.messages,
      temperature: params.temperature,
      maxOutputTokens: params.maxTokens,
    })

    for await (const chunk of result.textStream) {
      yield { type: 'text', content: chunk }
    }

    yield { type: 'done' }
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
