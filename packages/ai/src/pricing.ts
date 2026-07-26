import { calcCost as llmCalcCost, getModel } from 'llm-prices'

const CUSTOM_PRICING: Record<string, Record<string, { input: number; output: number }>> = {
  kie: {
    'gpt-5-2': { input: 1.75, output: 14.00 },
    'gpt-5-4': { input: 2.50, output: 15.00 },
    'gpt-5-5': { input: 5.00, output: 30.00 },
    'gpt-codex': { input: 1.25, output: 10.00 },
    'claude-opus-4-7': { input: 5.00, output: 25.00 },
    'claude-opus-4-8': { input: 5.00, output: 25.00 },
    'claude-sonnet-4-6': { input: 3.00, output: 15.00 },
    'claude-sonnet-5': { input: 2.00, output: 10.00 },
    'claude-haiku-4-5': { input: 1.00, output: 5.00 },
    'claude-fable-5': { input: 10.00, output: 50.00 },
    'gemini-2-5-pro': { input: 1.25, output: 10.00 },
    'gemini-2-5-flash': { input: 0.30, output: 2.50 },
    'gemini-3-pro': { input: 2.00, output: 12.00 },
    'gemini-3-flash': { input: 0.50, output: 3.00 },
    'gemini-3-1-pro': { input: 2.00, output: 12.00 },
    'gemini-3-5-flash': { input: 1.50, output: 9.00 },
  },
  opencode: {},
  local: {},
}

export function computeCost(model: string, inputTokens: number, outputTokens: number): number | null {
  if (inputTokens <= 0 && outputTokens <= 0) return null

  const result = llmCalcCost(model, { input: inputTokens, output: outputTokens })
  if (result) return Math.round(result.total * 100_000) / 100_000

  // Try with provider:model format (OpenRouter style)
  if (model.includes('/')) {
    const short = model.split('/').pop()!
    const result2 = llmCalcCost(short, { input: inputTokens, output: outputTokens })
    if (result2) return Math.round(result2.total * 100_000) / 100_000
  }

  // Check custom pricing (KIE, OpenCode, Local)
  for (const [, models] of Object.entries(CUSTOM_PRICING)) {
    const price = models[model]
    if (price) {
      const total = (inputTokens * price.input + outputTokens * price.output) / 1_000_000
      return Math.round(total * 100_000) / 100_000
    }
  }

  return null
}
