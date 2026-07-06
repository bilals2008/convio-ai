import type { WidgetTheme } from '@/hooks/useWidget'

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = 0
  let g = 0
  let b = 0
  const clean = hex.replace('#', '')
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) / 255
    g = parseInt(clean[1] + clean[1], 16) / 255
    b = parseInt(clean[2] + clean[2], 16) / 255
  } else {
    r = parseInt(clean.substring(0, 2), 16) / 255
    g = parseInt(clean.substring(2, 4), 16) / 255
    b = parseInt(clean.substring(4, 6), 16) / 255
  }
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function getWidgetCSSVariables(theme: WidgetTheme): Record<string, string> {
  const primary = hexToHsl(theme.primaryColor)
  const bg = hexToHsl(theme.backgroundColor)
  const text = hexToHsl(theme.textColor)

  return {
    '--widget-primary': `${primary.h} ${primary.s}% ${primary.l}%`,
    '--widget-primary-foreground': '0 0% 100%',
    '--widget-bg': `${bg.h} ${bg.s}% ${bg.l}%`,
    '--widget-text': `${text.h} ${text.s}% ${text.l}%`,
    '--widget-muted': `${bg.h} ${bg.s * 0.3}% ${bg.l > 50 ? 93 : 15}%`,
    '--widget-muted-foreground': `${text.h} ${text.s * 0.3}% ${text.l > 50 ? 40 : 65}%`,
    '--widget-border': `${primary.h} ${primary.s * 0.3}% ${bg.l > 50 ? 88 : 18}%`,
  } as Record<string, string>
}

interface WidgetStylesProps {
  theme: WidgetTheme
}

export function WidgetStyles({ theme }: WidgetStylesProps) {
  const vars = getWidgetCSSVariables(theme)

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `.convio-widget { ${Object.entries(vars)
          .map(([k, v]) => `${k}: ${v};`)
          .join(' ')} }`,
      }}
    />
  )
}
