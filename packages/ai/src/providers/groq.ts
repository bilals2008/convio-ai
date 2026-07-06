import type { AIProvider, GenerateParams, GenerateResult, StreamChunk, Model, ModerationResult } from './index'

export class GroqProvider implements AIProvider {
  id = 'groq'
  name = 'Groq'

  async generate(params: GenerateParams): Promise<GenerateResult> {
    // Groq uses OpenAI-compatible API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature,
        max_tokens: params.maxTokens,
      }),
    })

    const data = await response.json()
    const choice = data.choices[0]

    return {
      content: choice.message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    }
  }

  async *stream(params: GenerateParams): AsyncIterable<StreamChunk> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature,
        max_tokens: params.maxTokens,
        stream: true,
      }),
    })

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') {
            yield { type: 'done' }
            return
          }
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content
            if (content) {
              yield { type: 'text', content }
            }
          } catch {}
        }
      }
    }

    yield { type: 'done' }
  }

  async embed(text: string): Promise<number[]> {
    throw new Error('Groq does not support embeddings')
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
