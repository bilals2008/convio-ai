import { useEffect, useState } from 'react'
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

export function getWidgetCSSVariables(theme: WidgetTheme, isDark: boolean): Record<string, string> {
  const primary = hexToHsl(theme.primaryColor)
  const bg = hexToHsl(theme.backgroundColor)
  const text = hexToHsl(theme.textColor)
  const promptBg = theme.promptBgColor ? hexToHsl(theme.promptBgColor) : null
  const headerStart = theme.headerGradientStart ? hexToHsl(theme.headerGradientStart) : primary
  const headerEnd = theme.headerGradientEnd ? hexToHsl(theme.headerGradientEnd) : primary
  const border = theme.borderColor ? hexToHsl(theme.borderColor) : null
  const inputBg = theme.inputBgColor ? hexToHsl(theme.inputBgColor) : null
  const sendBtn = theme.sendBtnColor ? hexToHsl(theme.sendBtnColor) : null

  const bgL = isDark ? Math.min(bg.l, 18) : bg.l
  const textL = isDark ? Math.max(text.l, 85) : text.l

  const vars: Record<string, string> = {
    '--widget-primary': `${primary.h} ${primary.s}% ${primary.l}%`,
    '--widget-primary-foreground': '0 0% 100%',
    '--widget-bg': `${bg.h} ${Math.max(bg.s, 5)}% ${bgL}%`,
    '--widget-text': `${text.h} ${Math.max(text.s, 5)}% ${textL}%`,
    '--widget-muted': `${bg.h} 8% ${isDark ? 22 : 93}%`,
    '--widget-muted-foreground': `${text.h} 8% ${isDark ? 55 : 40}%`,
    '--widget-border': border
      ? `${border.h} ${border.s}% ${border.l}%`
      : `${primary.h} ${Math.max(primary.s * 0.2, 3)}% ${isDark ? 25 : 88}%`,
    '--widget-header-start': `${headerStart.h} ${headerStart.s}% ${headerStart.l}%`,
    '--widget-header-end': `${headerEnd.h} ${headerEnd.s}% ${headerEnd.l}%`,
    '--widget-header-direction': `${(theme.headerGradientDirection || '135').toString().replace(/deg$/i, '')}deg`,
    '--widget-prompt-bg': promptBg
      ? `${promptBg.h} ${promptBg.s}% ${promptBg.l}%`
      : `${bg.h} ${Math.max(bg.s, 5)}% ${isDark ? 22 : 93}%`,
    '--widget-input-bg': inputBg
      ? `${inputBg.h} ${inputBg.s}% ${inputBg.l}%`
      : `${bg.h} ${Math.max(bg.s, 5)}% ${bgL}%`,
    '--widget-send-btn': sendBtn
      ? `${sendBtn.h} ${sendBtn.s}% ${sendBtn.l}%`
      : `${primary.h} ${primary.s}% ${primary.l}%`,
  }

  return vars
}

function matchDark(): boolean {
  if (typeof window === 'undefined') return false

  const widget = document.querySelector('.convio-widget')
  if (widget && (widget.closest('[data-widget-preview]') || widget.closest('.convio-widget-preview'))) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  if (document.documentElement.classList.contains('dark')) return true
  if (document.documentElement.classList.contains('light')) return false

  const dataTheme = document.documentElement.getAttribute('data-theme')
  if (dataTheme === 'dark') return true
  if (dataTheme === 'light') return false

  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function useEffectiveDark(themeMode: 'auto' | 'light' | 'dark'): boolean {
  const [isDark, setIsDark] = useState(() =>
    themeMode === 'auto' ? matchDark() : themeMode === 'dark'
  )

  useEffect(() => {
    if (themeMode !== 'auto') {
      setIsDark(themeMode === 'dark')
      return
    }

    setIsDark(matchDark())

    const isPreview = !!document.querySelector('.convio-widget')?.closest('[data-widget-preview]')

    if (!isPreview) {
      const observer = new MutationObserver(() => setIsDark(matchDark()))
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme'],
      })
      var cleanupObserver = () => observer.disconnect()
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onMqChange = () => {
      if (isPreview) {
        setIsDark(mq.matches)
      } else if (!document.documentElement.classList.contains('dark') &&
          !document.documentElement.classList.contains('light') &&
          !document.documentElement.getAttribute('data-theme')) {
        setIsDark(mq.matches)
      }
    }
    mq.addEventListener('change', onMqChange)

    return () => {
      if (cleanupObserver) cleanupObserver()
      mq.removeEventListener('change', onMqChange)
    }
  }, [themeMode])

  return isDark
}

interface WidgetStylesProps {
  theme: WidgetTheme
  themeMode?: 'auto' | 'light' | 'dark'
}

export function WidgetStyles({ theme, themeMode = 'auto' }: WidgetStylesProps) {
  const isDark = useEffectiveDark(themeMode)
  const vars = getWidgetCSSVariables(theme, isDark)

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
