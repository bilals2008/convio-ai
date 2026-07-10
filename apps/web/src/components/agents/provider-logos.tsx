import { cn } from "@/lib/utils"
import { providerLabel } from "./model-meta"

export interface ProviderLogoProps {
  provider?: string
  className?: string
}

const BRAND_COLORS: Record<string, { bg: string; fg: string }> = {
  openai: { bg: "#10a37f", fg: "#ffffff" },
  anthropic: { bg: "#d97757", fg: "#ffffff" },
  google: { bg: "#4285f4", fg: "#ffffff" },
  groq: { bg: "#f55036", fg: "#ffffff" },
  mistral: { bg: "#ff7000", fg: "#ffffff" },
  deepseek: { bg: "#4d6bfe", fg: "#ffffff" },
  perplexity: { bg: "#20808d", fg: "#ffffff" },
  meta: { bg: "#0866ff", fg: "#ffffff" },
  xai: { bg: "#ffffff", fg: "#09090b" },
  together: { bg: "#00814d", fg: "#ffffff" },
  openrouter: { bg: "#ff6b4a", fg: "#ffffff" },
  local: { bg: "#71717a", fg: "#ffffff" },
  kie: { bg: "#fb923c", fg: "#09090b" },
  opencode: { bg: "#fafafa", fg: "#09090b" },
}

export function ProviderLogo({ provider, className }: ProviderLogoProps) {
  const key = (provider || "other").toLowerCase()
  const color = BRAND_COLORS[key] ?? { bg: "#71717a", fg: "#ffffff" }
  const initial = (providerLabel(key)[0] ?? "?").toUpperCase()

  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-[5px] text-[10px] font-semibold leading-none",
        className
      )}
      style={{ backgroundColor: color.bg, color: color.fg }}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
