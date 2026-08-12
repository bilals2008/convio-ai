import { cn } from '@/lib/utils'
import { useWidgetState } from './WidgetState'
import { WidgetHeader } from './WidgetHeader'
import { WidgetWelcome } from './WidgetWelcome'
import { WidgetMessages } from './WidgetMessages'
import { WidgetInput } from './WidgetInput'

const WIDTH_MAP = {
  narrow: 'w-[260px] sm:w-[320px]',
  default: 'w-[320px] sm:w-[380px]',
  wide: 'w-[360px] sm:w-[440px]',
}
const RADIUS_MAP = { none: 'rounded-none', default: 'rounded-2xl', full: 'rounded-3xl' }
const DEFAULT_HEIGHT = 540

export function WidgetWindow() {
  const { isOpen, isMinimized, isEmbed, entering, exiting, position, error, dismissError, widgetWidth, borderRadius, widgetHeight } = useWidgetState()

  if (!isOpen && !exiting) return null

  return (
    <div
      className={cn(
        'convio-window fixed z-[9998] flex flex-col overflow-hidden',
        isEmbed
          ? 'inset-0 w-full h-full rounded-none animate-widget-enter'
          : cn(
              'bottom-20 h-[min(540px,calc(100dvh-90px))] max-w-[calc(100vw-24px)]',
              WIDTH_MAP[widgetWidth],
              position === 'bottom-left' ? 'left-3 sm:left-5' : 'right-3 sm:right-5',
            ),
        isMinimized && !isEmbed && '!h-auto',
        entering && 'animate-widget-enter',
        exiting && 'animate-widget-exit',
        !exiting && !isEmbed && cn('shadow-[0_8px_40px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.04]', RADIUS_MAP[borderRadius])
      )}
      style={{
        backgroundColor: `hsl(var(--widget-bg))`,
        ...(isEmbed || isMinimized ? {} : { height: widgetHeight ? `${widgetHeight}px` : `${DEFAULT_HEIGHT}px` }),
      }}
    >
      <WidgetHeader />
      {error && (
        <div className="mx-3 mt-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <span className="flex-1">{error}</span>
          <button onClick={() => dismissError()} className="shrink-0 text-destructive/60 hover:text-destructive">&times;</button>
        </div>
      )}
      {!isMinimized && (
        <>
          <WidgetWelcome />
          <WidgetMessages />
          <WidgetInput />
        </>
      )}
    </div>
  )
}
