import { useEffect, useRef, useState } from 'react'
import { ChatWidget, chatWidgetPropsFromConfig } from '@/components/widget'
import { cn } from '@/lib/utils'
import { WIDTH_OPTIONS } from '../constants'
import type { WidgetConfig, WidgetDetail } from '../types'

// Breathing room around the widget window inside the frame. The frame keeps the
// same size in both states, so closing the widget never resizes it — it just
// reveals the launcher in the corner, the way it would on a real page.
const MARGIN_X = 24
const MARGIN_Y = 24

// WidgetWindow normally clears the launcher (80px above the bottom edge). The
// preview hides the launcher while the window is open, so it can sit flush and
// leave no dead strip underneath.
const PREVIEW_WINDOW_BOTTOM = 12

const MAX_FRAME_HEIGHT = 640
const MOBILE_FRAME_WIDTH = 300

interface WidgetPreviewPanelProps {
  widget: WidgetDetail
  config: WidgetConfig
  device: 'desktop' | 'mobile'
}

/**
 * Renders the *real* widget (the same component the embed ships) inside a
 * contained, scaled device frame — so width, height, radius, launcher shape and
 * theme can never drift from production.
 *
 * Two details make the containment work:
 *  - the inner box is both the portal target and a transformed element, and a
 *    transform turns an element into the containing block for `position: fixed`
 *    descendants — which is how the widget positions itself;
 *  - scaling that box scales the widget and its fixed offsets together.
 */
export function WidgetPreviewPanel({ widget, config, device }: WidgetPreviewPanelProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [availableWidth, setAvailableWidth] = useState(0)
  const [portalTarget, setPortalTarget] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = wrapperRef.current
    if (!el) return
    setAvailableWidth(el.clientWidth)
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width
      if (width) setAvailableWidth(width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const presetWidth =
    WIDTH_OPTIONS.find((option) => option.value === (config.widgetWidth ?? 'default'))?.width ?? 380
  const windowWidth =
    config.customWidth && config.customWidth > 0
      ? Math.min(Math.max(config.customWidth, 300), 500)
      : presetWidth
  const windowHeight =
    config.customHeight && config.customHeight > 0
      ? Math.min(Math.max(config.customHeight, 300), 1200)
      : (config.widgetHeight ?? 540)

  const contentWidth = windowWidth + MARGIN_X
  const contentHeight = windowHeight + MARGIN_Y
  const targetWidth = device === 'mobile' ? Math.min(availableWidth, MOBILE_FRAME_WIDTH) : availableWidth
  const scale =
    targetWidth > 0 ? Math.min(1, targetWidth / contentWidth, MAX_FRAME_HEIGHT / contentHeight) : 1

  return (
    <div ref={wrapperRef} className="w-full">
      <div
        data-widget-preview
        className={cn(
          'relative mx-auto overflow-hidden rounded-2xl border border-border/40 bg-muted/30 shadow-sm',
          'transition-[width,height] duration-200 ease-out',
        )}
        style={{ width: contentWidth * scale, height: contentHeight * scale }}
      >
        <div
          ref={setPortalTarget}
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: contentWidth,
            height: contentHeight,
            transform: `scale(${scale})`,
          }}
        />
        {portalTarget && (
          <ChatWidget
            {...chatWidgetPropsFromConfig(
              { config, agent: widget.agent },
              { agentId: widget.agent.id, publicKey: widget.publicKey, preview: true },
            )}
            portalContainer={portalTarget}
            windowBottomOffset={PREVIEW_WINDOW_BOTTOM}
            defaultOpen
          />
        )}
      </div>
    </div>
  )
}
