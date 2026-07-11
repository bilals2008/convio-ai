import { useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface DirectionHoverProps {
  title: string
  /** Resting text color — use a semantic token, e.g. var(--muted-foreground). */
  textColor?: string
  /** Accent color revealed on hover — e.g. var(--foreground) or var(--primary). */
  hoverColor?: string
  className?: string
  /** Font size in px; the effect trims to cap height automatically. */
  fontSize?: number
  /** Vertical gap between the resting and accent copies, 0–20. */
  gap?: number
  /** Slide duration in seconds. */
  duration?: number
}

/**
 * Direction-aware text swap (adapted from the Originkit "Direction Hover"
 * component). The label swaps to an accent copy that slides in from whichever
 * edge the cursor entered, and slides back out on leave.
 */
export function DirectionHover({
  title,
  textColor = 'var(--muted-foreground)',
  hoverColor = 'var(--foreground)',
  className,
  fontSize = 13,
  gap = 6,
  duration = 0.3,
}: DirectionHoverProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [dir, setDir] = useState<'none' | 'top' | 'bottom'>('none')

  const onEnter = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const y = e.clientY - rect.top
    setDir(y < rect.height / 2 ? 'top' : 'bottom')
  }
  const onLeave = () => setDir('none')

  const lineHeight = fontSize * 1.2
  const gapPx = gap * 3
  const step = lineHeight + gapPx
  const yByDir = { none: -step, top: 0, bottom: -2 * step }

  const labelStyle: React.CSSProperties = {
    margin: 0,
    whiteSpace: 'pre',
    lineHeight: 1,
    height: lineHeight,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    fontSize,
    fontWeight: 'inherit',
    fontFamily: 'inherit',
    letterSpacing: 'inherit',
  }

  return (
    <span
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn('relative inline-block overflow-hidden select-none', className)}
      style={{ height: lineHeight, cursor: 'pointer' }}
    >
      <span
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: gapPx,
          transform: `translateY(${yByDir[dir]}px)`,
          transition: `transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      >
        <span style={{ ...labelStyle, color: hoverColor }}>{title}</span>
        <span style={{ ...labelStyle, color: textColor }}>{title}</span>
        <span style={{ ...labelStyle, color: hoverColor }}>{title}</span>
      </span>
    </span>
  )
}
