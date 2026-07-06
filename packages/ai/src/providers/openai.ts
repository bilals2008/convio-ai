import { generateText, streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from './index'

export class OpenAIProvider implements AIProvider {
  id = 'openai'
  name = 'OpenAI'

  private getClient() {
    return openai(process.env.OPENAI_API_KEY)
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
    const result = await this.getClient().embed({
      model: 'text-embedding-3-small',
      value: text,
    })
    return result.embedding
  }

  async moderate(text: string): Promise<ModerationResult> {
    const result = await this.getClient().moderations.create({
      input: text,
    })

    const moderation = result.results[0]
    return {
      flagged: moderation.flagged,
      categories: moderation.categories as Record<string, boolean>,
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
