export type ModelBadgeTone = "fast" | "vision" | "reasoning" | "free" | "paid"

export interface ModelBadge {
  label: string
  tone: ModelBadgeTone
}

export const BADGE_CLASSES: Record<ModelBadgeTone, string> = {
  fast: "bg-info/10 text-info border-info/20",
  vision: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  reasoning: "bg-warning/10 text-warning border-warning/20",
  free: "bg-success/10 text-success border-success/20",
  paid: "bg-muted text-muted-foreground border-border",
}

export function getModelBadges(model: { id: string; name: string; provider?: string }): ModelBadge[] {
  const haystack = `${model.id} ${model.name}`.toLowerCase()
  const badges: ModelBadge[] = []

  if (/(mini|nano|flash|haiku|lite|small|instant|\b(8b|3b|2b|1b|7b)\b)/.test(haystack)) {
    badges.push({ label: "Fast", tone: "fast" })
  }
  if (/vision/.test(haystack)) {
    badges.push({ label: "Vision", tone: "vision" })
  }
  if (/(o1|o3|o4|r1|reasoning|thinking|qwq|deepseek-r1|deepseek-v4)/.test(haystack)) {
    badges.push({ label: "Reasoning", tone: "reasoning" })
  }

  const isFree = model.provider === "local" || /free/.test(haystack)
  badges.push(isFree ? { label: "Free", tone: "free" } : { label: "Paid", tone: "paid" })

  return badges
}

const LOGO_LABELS: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google AI",
  groq: "Groq",
  kie: "KIE AI",
  openrouter: "OpenRouter",
  opencode: "OpenCode Zen",
  mistral: "Mistral",
  together: "Together",
  deepseek: "DeepSeek",
  perplexity: "Perplexity",
  meta: "Meta",
  xai: "xAI",
  local: "Local",
}

export function providerLabel(provider?: string): string {
  if (!provider) return "Other"
  return LOGO_LABELS[provider] ?? provider.charAt(0).toUpperCase() + provider.slice(1)
}
