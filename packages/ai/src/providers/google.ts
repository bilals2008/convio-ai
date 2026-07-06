import { generateText, streamText } from 'ai'
import { google } from '@ai-sdk/google'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from './index'

export class GoogleProvider implements AIProvider {
  id = 'google'
  name = 'Google'

  private getClient() {
    return google(process.env.GOOGLE_API_KEY)
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const result = await generateText({
      model: this.getClient().model(params.model),
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
      model: this.getClient().model(params.model),
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
    throw new Error('Google embeddings not implemented yet')
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
