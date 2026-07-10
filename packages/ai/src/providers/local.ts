import { generateText, streamText } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { LanguageModelV1 } from '@ai-sdk/provider'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'

const LOCAL_BASE = process.env.LOCAL_API_URL || 'http://localhost:20128/v1'

export class LocalProvider implements AIProvider {
  id = 'local'
  name = 'OmniRoute'

  private getClient() {
    return createOpenAICompatible({
      baseURL: LOCAL_BASE,
      name: 'omniroute',
    })
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const result = await generateText({
      model: this.getClient().chatModel(params.model) as unknown as LanguageModelV1,
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
      model: this.getClient().chatModel(params.model) as unknown as LanguageModelV1,
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
    throw new Error('OmniRoute does not support embeddings')
  }

  async moderate(_text: string): Promise<ModerationResult> {
    return { flagged: false, categories: {} }
  }

  async listModels(): Promise<Model[]> {
    const response = await fetch(`${LOCAL_BASE}/models`)
    if (!response.ok) return []

    const data = await response.json() as { data: Array<{ id: string }> }
    return (data.data || []).map((m) => ({
      id: m.id,
      name: m.id,
      provider: 'local',
      maxTokens: 1048576,
      supportsTools: true,
      supportsStreaming: true,
    }))
  }
}
