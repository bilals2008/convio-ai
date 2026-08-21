import type { AIProvider } from '../index.js'
import { OpenAIProvider } from './openai.js'
import { AnthropicProvider } from './anthropic.js'
import { GoogleProvider } from './google.js'
import { GroqProvider } from './groq.js'
import { LocalProvider } from './local.js'
import { OpenCodeProvider } from './opencode.js'
import { OpenRouterProvider } from './openrouter.js'
import { OpenAICompatibleProvider } from './openai-compatible.js'

export const openaiProvider = new OpenAIProvider()
export const anthropicProvider = new AnthropicProvider()
export const googleProvider = new GoogleProvider()
export const groqProvider = new GroqProvider()
export const localProvider = new LocalProvider()
export const opencodeProvider = new OpenCodeProvider()
export const openrouterProvider = new OpenRouterProvider()
export const mistralProvider = new OpenAICompatibleProvider({ id: 'mistral', name: 'Mistral', baseURL: 'https://api.mistral.ai/v1' })
export const togetherProvider = new OpenAICompatibleProvider({ id: 'together', name: 'Together', baseURL: 'https://api.together.xyz/v1' })
export const deepseekProvider = new OpenAICompatibleProvider({ id: 'deepseek', name: 'DeepSeek', baseURL: 'https://api.deepseek.com' })
export const perplexityProvider = new OpenAICompatibleProvider({ id: 'perplexity', name: 'Perplexity', baseURL: 'https://api.perplexity.ai' })
export const agnesProvider = new OpenAICompatibleProvider({ id: 'agnes', name: 'Agnes AI', baseURL: 'https://apihub.agnes-ai.com/v1' })

export const allProviders: AIProvider[] = [
  openaiProvider,
  anthropicProvider,
  googleProvider,
  groqProvider,
  localProvider,
  opencodeProvider,
  openrouterProvider,
  mistralProvider,
  togetherProvider,
  deepseekProvider,
  perplexityProvider,
  agnesProvider,
]

export function getProviderById(id: string): AIProvider | undefined {
  return allProviders.find(p => p.id === id)
}

const OFFICIAL_MODELS = new Set([
  'gpt-4o', 'gpt-4o-mini',
  'claude-3-5-sonnet', 'claude-3-haiku',
  'gemini-1.5-pro', 'gemini-1.5-flash',
])

const OPENCODE_MODEL_PREFIXES = ['opencode/']
const LOCAL_MODEL_PREFIXES = ['auto/', 'ddgw/', 'aug/', 'tllm/', 'pepper/', 'mcode/', 'veo-free/', 'veoaifree-web/', 'no-think/']

export function getProviderForModel(model: string, providerHint?: string): AIProvider {
  // When the caller knows which provider key the agent uses, trust that key —
  // it's the only reliable way to tell two `/`-vendored providers (e.g. Together
  // vs OpenRouter) apart, and it auto-handles new models without prefix lists.
  if (providerHint) {
    const hinted = getProviderById(providerHint)
    if (hinted) return hinted
  }
  if (OFFICIAL_MODELS.has(model)) {
    if (model.startsWith('gpt-')) return openaiProvider
    if (model.startsWith('claude-')) return anthropicProvider
    if (model.startsWith('gemini-')) return googleProvider
  }
  if (model.startsWith('gemini-')) return googleProvider
  if (model.startsWith('llama-') || model.startsWith('mixtral-')) return groqProvider
  if (OPENCODE_MODEL_PREFIXES.some(p => model.startsWith(p))) return opencodeProvider
  if (LOCAL_MODEL_PREFIXES.some(p => model.startsWith(p))) return localProvider
  if (model.startsWith('deepseek-')) return deepseekProvider
  if (model.startsWith('agnes-')) return agnesProvider
  if (model.startsWith('mistral-') || model.startsWith('open-mistral-') || model.startsWith('codestral-') || model.startsWith('ministral-')) return mistralProvider
  if (model.toLowerCase().startsWith('sonar')) return perplexityProvider
  // OpenRouter models use the format: provider/model-name
  if (model.includes('/') && !model.startsWith('auto/') && !model.startsWith('no-think/')) return openrouterProvider
  throw new Error(`No provider found for model: ${model}`)
}
