export interface ReasoningOption {
  value: string
  label: string
}

const LABELS: Record<string, string> = {
  none: "None",
  minimal: "Minimal",
  low: "Low",
  medium: "Medium",
  high: "High",
  xhigh: "Extra High",
  max: "Max",
}

function options(values: string[]): ReasoningOption[] {
  return values.map((value) => ({ value, label: LABELS[value] ?? value }))
}

/**
 * Returns the reasoning-effort options a given model actually supports,
 * or null when reasoning effort is not configurable for that model.
 *
 * Source of truth: provider docs (OpenAI reasoning_effort, DeepSeek built-in
 * vs V4 high/max, xAI Grok-4.5 low/med/high, Gemini thinking_level, etc.).
 */
export function getReasoningEfforts(model: { id: string; provider?: string }): ReasoningOption[] | null {
  const id = (model.id || "").toLowerCase()
  const provider = (model.provider || id.split("/")[0] || "").toLowerCase()

  switch (provider) {
    case "openai":
      if (/(^|\/)(o1|o3|o4)/.test(id)) return options(["low", "medium", "high"])
      return options(["none", "low", "medium", "high", "xhigh"])
    case "xai":
      return /grok-?4\.5/.test(id) ? options(["low", "medium", "high"]) : null
    case "google":
      return /gemini/.test(id) ? options(["minimal", "low", "medium", "high"]) : null
    case "deepseek":
      if (/(r1|reasoner)/.test(id)) return null
      if (/v4/.test(id)) return options(["high", "max"])
      return null
    case "opencode":
      if (/deepseek-v4/.test(id)) return options(["high", "max"])
      return null
    case "anthropic":
      return options(["low", "medium", "high"])
    case "local":
      return options(["none", "low", "medium", "high", "xhigh"])
    default:
      return /(reasoning|o1|o3|o4|r1|qwq|deepseek-r1)/.test(id)
        ? options(["low", "medium", "high"])
        : null
  }
}

export function supportsReasoningEffort(model: { id: string; provider?: string }): boolean {
  return getReasoningEfforts(model) !== null
}
