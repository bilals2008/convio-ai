import { calcCost as llmCalcCost, getModel } from 'llm-prices'

const CUSTOM_PRICING: Record<string, Record<string, { input: number; output: number }>> = {
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

  // Check custom pricing (OpenCode, Local)
  for (const [, models] of Object.entries(CUSTOM_PRICING)) {
    const price = models[model]
    if (price) {
      const total = (inputTokens * price.input + outputTokens * price.output) / 1_000_000
      return Math.round(total * 100_000) / 100_000
    }
  }

  return null
}
