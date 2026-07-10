import { generateText, streamText, embed } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'

export class GoogleProvider implements AIProvider {
  id = 'google'
  name = 'Google'

  private getClient(apiKey?: string) {
    return createGoogleGenerativeAI({ apiKey: apiKey || process.env.GOOGLE_API_KEY })
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
    const result = streamText({
      model: this.getClient(params.apiKey)(params.model),
      messages: chatMessages,
      ...(sysMsg && { instructions: sysMsg.content }),
      temperature: params.temperature,
      maxOutputTokens: params.maxTokens,
    })

    for await (const chunk of result.textStream) {
      yield { type: 'text', content: chunk }
    }

    yield { type: 'done' }
  }

  async embed(text: string): Promise<number[]> {
    const result = await embed({
      model: this.getClient().textEmbeddingModel('text-embedding-004'),
      value: text,
    })
    return result.embedding
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
