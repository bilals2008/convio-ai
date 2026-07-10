import { generateText, streamText, embed } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'

export class OpenAIProvider implements AIProvider {
  id = 'openai'
  name = 'OpenAI'

  private getClient(apiKey?: string) {
    return createOpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY })
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
      model: this.getClient().textEmbeddingModel('text-embedding-3-small'),
      value: text,
    })
    return result.embedding
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
