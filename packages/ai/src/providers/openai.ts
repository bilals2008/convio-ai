import { generateText, streamText, embed } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import type { EmbeddingModelV1 } from '@ai-sdk/provider'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'

export class OpenAIProvider implements AIProvider {
  id = 'openai'
  name = 'OpenAI'

  private getClient() {
    return createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
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
    const result = await embed({
      model: this.getClient().textEmbeddingModel('text-embedding-3-small') as EmbeddingModelV1<string>,
      value: text,
    })
    return result.embedding
  }

  async moderate(text: string): Promise<ModerationResult> {
    try {
      const response = await fetch('https://api.openai.com/v1/moderations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
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

  async listModels(): Promise<Model[]> {
    return [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'openai',
        maxTokens: 128000,
        supportsTools: true,
        supportsStreaming: true,
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'openai',
        maxTokens: 128000,
        supportsTools: true,
        supportsStreaming: true,
      },
    ]
  }
}
