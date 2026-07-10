import { generateText, streamText } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { LanguageModelV1 } from '@ai-sdk/provider'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'

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
    const result = await generateText({
      model: this.getClient(params.apiKey).chatModel(params.model) as unknown as LanguageModelV1,
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
      model: this.getClient(params.apiKey).chatModel(params.model) as unknown as LanguageModelV1,
      messages: params.messages,
      temperature: params.temperature,
      maxTokens: params.maxTokens,
    })

    for await (const chunk of result.textStream) {
      yield { type: 'text', content: chunk }
    }

    yield { type: 'done' }
  }

  async embed(_text: string): Promise<number[]> {
    throw new Error('Groq does not support embeddings')
  }

  async moderate(_text: string): Promise<ModerationResult> {
    return { flagged: false, categories: {} }
  }

  async listModels(): Promise<Model[]> {
    return [
      {
        id: 'llama-3.1-70b-versatile',
        name: 'Llama 3.1 70B',
        provider: 'groq',
        maxTokens: 128000,
        supportsTools: true,
        supportsStreaming: true,
      },
      {
        id: 'mixtral-8x7b-32768',
        name: 'Mixtral 8x7B',
        provider: 'groq',
        maxTokens: 32768,
        supportsTools: false,
        supportsStreaming: true,
      },
    ]
  }
}
