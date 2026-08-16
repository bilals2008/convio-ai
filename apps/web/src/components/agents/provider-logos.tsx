import { cn } from "@/lib/utils"
import { providerLabel } from "./model-meta"

export interface ProviderLogoProps {
  provider?: string
  className?: string
}

const CDN = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons"

type LogoConfig =
  | { light: string; dark: string }
  | { img: string; invertDark?: boolean }

const LOGO_MAP: Record<string, LogoConfig> = {
  openai: { light: `${CDN}/openai/light.svg`, dark: `${CDN}/openai/dark.svg` },
  anthropic: { light: `${CDN}/anthropic/light.svg`, dark: `${CDN}/anthropic/dark.svg` },
  google: { img: `${CDN}/google/default.svg` },
  groq: { img: `${CDN}/groq/default.svg` },
  mistral: { img: `${CDN}/mistral/color.svg` },
  deepseek: { img: `${CDN}/deepseek/default.svg` },
  perplexity: { img: `${CDN}/perplexity/default.svg` },
  meta: { img: `${CDN}/meta/default.svg` },
  openrouter: { light: `${CDN}/openrouter/mono.svg`, dark: `${CDN}/openrouter/default.svg` },
  xai: { img: `${CDN}/x-ai/default.svg`, invertDark: true },
}

const CHIP_COLORS: Record<string, { bg: string; fg: string }> = {
  opencode: { bg: "#fafafa", fg: "#09090b" },
  together: { bg: "#00814d", fg: "#ffffff" },
  local: { bg: "#71717a", fg: "#ffffff" },
}

function LogoImage({ src, invertDark, className }: { src: string; invertDark?: boolean; className?: string }) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={cn("size-full object-contain", invertDark && "dark:invert", className)}
    />
  )
}

export function ProviderLogo({ provider, className }: ProviderLogoProps) {
  const key = (provider || "other").toLowerCase()
  const config = LOGO_MAP[key]

  if (config) {
    return (
      <span className={cn("flex shrink-0 items-center justify-center", className)} aria-hidden="true">
        {"light" in config ? (
          <>
            <LogoImage src={config.light} className="block dark:hidden" />
            <LogoImage src={config.dark} className="hidden dark:block" />
          </>
        ) : (
          <LogoImage src={config.img} invertDark={config.invertDark} />
        )}
      </span>
    )
  }

  const color = CHIP_COLORS[key] ?? { bg: "#71717a", fg: "#ffffff" }
  const initial = (providerLabel(key)[0] ?? "?").toUpperCase()

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-[5px] text-[10px] font-semibold leading-none",
        className
      )}
      style={{ backgroundColor: color.bg, color: color.fg }}
      aria-hidden="true"
    >
      {initial}
    </span>
  )
}
