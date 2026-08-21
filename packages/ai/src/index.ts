// AI Provider interface
export interface AIProvider {
  id: string
  name: string
  generate(params: GenerateParams): Promise<GenerateResult>
  stream(params: GenerateParams): AsyncIterable<StreamChunk>
  embed(text: string): Promise<number[]>
  moderate(text: string): Promise<ModerationResult>
  listModels(apiKey?: string): Promise<Model[]>
}

// Types
export interface GenerateParams {
  model: string
  messages: Message[]
  tools?: Tool[]
  temperature?: number
  maxTokens?: number
  apiKey?: string
  signal?: AbortSignal
  reasoningEffort?: 'none' | 'low' | 'medium' | 'high' | 'xhigh'
  thinking?: boolean | { budget_tokens?: number }
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface Tool {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface GenerateResult {
  content: string
  toolCalls?: ToolCall[]
  usage: Usage
}

export interface StreamChunk {
  type: 'text' | 'reasoning' | 'tool_call' | 'tool_result' | 'done'
  content?: string
  toolCall?: ToolCall
  usage?: Usage
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
  result?: unknown
}

export interface Usage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export interface Model {
  id: string
  name: string
  provider: string
  maxTokens: number
  supportsTools: boolean
  supportsStreaming: boolean
}

export interface ModerationResult {
  flagged: boolean
  categories: Record<string, boolean>
}

// Provider registry
const providers = new Map<string, AIProvider>()

export function registerProvider(provider: AIProvider): void {
  providers.set(provider.id, provider)
}

export function getProvider(id: string): AIProvider | undefined {
  return providers.get(id)
}

export function getAllProviders(): AIProvider[] {
  return Array.from(providers.values())
}
