import type { AIProvider } from '../index.js'
import { OpenAIProvider } from './openai.js'
import { AnthropicProvider } from './anthropic.js'
import { GoogleProvider } from './google.js'
import { GroqProvider } from './groq.js'
import { KIEProvider } from './kie.js'

export const openaiProvider = new OpenAIProvider()
export const anthropicProvider = new AnthropicProvider()
export const googleProvider = new GoogleProvider()
export const groqProvider = new GroqProvider()
export const kieProvider = new KIEProvider()

export const allProviders: AIProvider[] = [
  openaiProvider,
  anthropicProvider,
  googleProvider,
  groqProvider,
  kieProvider,
]

export function getProviderById(id: string): AIProvider | undefined {
  return allProviders.find(p => p.id === id)
}

const OFFICIAL_MODELS = new Set([
  'gpt-4o', 'gpt-4o-mini',
  'claude-3-5-sonnet', 'claude-3-haiku',
  'gemini-1.5-pro', 'gemini-1.5-flash',
])

const KIE_MODEL_PREFIXES = ['gpt-5-', 'gpt-codex', 'claude-opus-4-', 'claude-sonnet-4-', 'claude-sonnet-5', 'claude-haiku-4-', 'claude-fable-5', 'gemini-2-5-', 'gemini-3-']

export function getProviderForModel(model: string): AIProvider {
  if (OFFICIAL_MODELS.has(model)) {
    if (model.startsWith('gpt-')) return openaiProvider
    if (model.startsWith('claude-')) return anthropicProvider
    if (model.startsWith('gemini-')) return googleProvider
  }
  if (KIE_MODEL_PREFIXES.some(p => model.startsWith(p))) return kieProvider
  if (model.startsWith('llama-') || model.startsWith('mixtral-')) return groqProvider
  throw new Error(`No provider found for model: ${model}`)
}
