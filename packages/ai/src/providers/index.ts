import type { AIProvider } from '../index'
import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'
import { GoogleProvider } from './google'
import { GroqProvider } from './groq'

// Provider instances
export const openaiProvider = new OpenAIProvider()
export const anthropicProvider = new AnthropicProvider()
export const googleProvider = new GoogleProvider()
export const groqProvider = new GroqProvider()

// All providers
export const allProviders: AIProvider[] = [
  openaiProvider,
  anthropicProvider,
  googleProvider,
  groqProvider,
]

// Get provider by ID
export function getProviderById(id: string): AIProvider | undefined {
  return allProviders.find(p => p.id === id)
}

// Get provider for model
export function getProviderForModel(model: string): AIProvider {
  if (model.startsWith('gpt-')) return openaiProvider
  if (model.startsWith('claude-')) return anthropicProvider
  if (model.startsWith('gemini-')) return googleProvider
  if (model.startsWith('llama-') || model.startsWith('mixtral-')) return groqProvider
  throw new Error(`No provider found for model: ${model}`)
}
