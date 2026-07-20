import { generateText, streamText, jsonSchema } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from '../index.js'

export class OpenRouterProvider implements AIProvider {
  id = 'openrouter'
  name = 'OpenRouter'

  private getClient(apiKey?: string) {
    return createOpenAICompatible({
      baseURL: 'https://openrouter.ai/api/v1',
      name: 'openrouter',
      apiKey: apiKey || process.env.OPENROUTER_API_KEY,
      headers: {
        'HTTP-Referer': 'https://convio.app',
        'X-Title': 'Convio',
      },
    })
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const result = await generateText({
      model: this.getClient(params.apiKey).chatModel(params.model),
      messages: params.messages,
      allowSystemInMessages: true,
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
    const tools = params.tools?.reduce((acc: any, t) => {
      acc[t.name] = { description: t.description, inputSchema: jsonSchema(t.parameters as any) }
      return acc
    }, {} as any)

    const result = streamText({
      model: this.getClient(params.apiKey).chatModel(params.model),
      messages: params.messages,
      allowSystemInMessages: true,
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
    throw new Error('OpenRouter does not support embeddings')
  }

  async moderate(_text: string): Promise<ModerationResult> {
    return { flagged: false, categories: {} }
  }

  async listModels(): Promise<Model[]> {
    return [
      { id: 'openai/gpt-4o', name: 'OpenAI GPT-4o', provider: 'openrouter', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
      { id: 'openai/gpt-4o-mini', name: 'OpenAI GPT-4o Mini', provider: 'openrouter', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
      { id: 'openai/o3-mini', name: 'OpenAI o3-mini', provider: 'openrouter', maxTokens: 200000, supportsTools: true, supportsStreaming: true },
      { id: 'openai/o1', name: 'OpenAI o1', provider: 'openrouter', maxTokens: 200000, supportsTools: false, supportsStreaming: false },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter', maxTokens: 200000, supportsTools: true, supportsStreaming: true },
      { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'openrouter', maxTokens: 200000, supportsTools: true, supportsStreaming: true },
      { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'openrouter', maxTokens: 200000, supportsTools: true, supportsStreaming: true },
      { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'openrouter', maxTokens: 1048576, supportsTools: true, supportsStreaming: true },
      { id: 'google/gemini-2.0-pro-exp-02-05', name: 'Gemini 2.0 Pro', provider: 'openrouter', maxTokens: 1048576, supportsTools: true, supportsStreaming: true },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'openrouter', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
      { id: 'mistralai/mistral-large-2411', name: 'Mistral Large', provider: 'openrouter', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'openrouter', maxTokens: 128000, supportsTools: false, supportsStreaming: true },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3', provider: 'openrouter', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
      { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'openrouter', maxTokens: 128000, supportsTools: true, supportsStreaming: true },
    ]
  }
}
