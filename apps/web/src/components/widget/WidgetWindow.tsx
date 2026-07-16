import { cn } from '@/lib/utils'
import { useWidgetState } from './WidgetState'
import { WidgetHeader } from './WidgetHeader'
import { WidgetWelcome } from './WidgetWelcome'
import { WidgetMessages } from './WidgetMessages'
import { WidgetInput } from './WidgetInput'

export function WidgetWindow() {
  const { isOpen, isMinimized, entering, exiting, position, error, dismissError } = useWidgetState()

  if (!isOpen && !exiting) return null

  return (
    <div
      className={cn(
        'convio-window fixed z-[9998] flex flex-col overflow-hidden',
        'max-sm:inset-0 max-sm:w-screen max-sm:h-screen max-sm:rounded-none max-sm:animate-widget-enter',
        'sm:bottom-20 sm:w-[380px] sm:max-h-[540px] sm:h-[540px]',
        position === 'bottom-left' ? 'sm:left-5' : 'sm:right-5',
        isMinimized && 'sm:!h-auto',
        entering && 'animate-widget-enter',
        exiting && 'animate-widget-exit',
        !exiting && 'rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.06]'
      )}
      style={{ backgroundColor: `hsl(var(--widget-bg))` }}
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
