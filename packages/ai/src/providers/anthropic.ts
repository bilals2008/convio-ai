import { generateText, streamText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'

export class AnthropicProvider implements AIProvider {
  id = 'anthropic'
  name = 'Anthropic'

  private getClient() {
    return createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const result = await generateText({
      model: this.getClient()(params.model),
      messages: params.messages,
      temperature: params.temperature,
      maxTokens: params.maxTokens,
    })

    return {
      content: result.text,
      usage: {
        promptTokens: result.usage.promptTokens,
        completionTokens: result.usage.completionTokens,
        totalTokens: result.usage.totalTokens,
      },
    }
  }

  async *stream(params: GenerateParams): AsyncIterable<StreamChunk> {
    const result = streamText({
      model: this.getClient()(params.model),
      messages: params.messages,
      temperature: params.temperature,
      maxTokens: params.maxTokens,
    })

    for await (const chunk of result.textStream) {
      yield { type: 'text', content: chunk }
    }

    yield { type: 'done' }
  }

  async embed(text: string): Promise<number[]> {
    throw new Error('Anthropic does not support embeddings')
  }

  async moderate(text: string): Promise<ModerationResult> {
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
