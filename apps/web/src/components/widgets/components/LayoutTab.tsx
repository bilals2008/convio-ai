import { Move, MessageCircle, Sparkles, MessageSquareText, Headphones, Bot, HelpCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { SectionCard } from './SectionCard'
import { LAUNCHER_ICON_OPTIONS, type LauncherIcon } from '../constants'

const HEIGHT_OPTIONS = [
  { label: 'Compact', value: 400 },
  { label: 'Default', value: 540 },
  { label: 'Tall', value: 640 },
] as const

const WIDTH_OPTIONS = [
  { label: 'Narrow', value: 'narrow' as const },
  { label: 'Default', value: 'default' as const },
  { label: 'Wide', value: 'wide' as const },
] as const

const LAUNCHER_SIZE_OPTIONS = [
  { label: 'Small', value: 'small' as const },
  { label: 'Default', value: 'default' as const },
  { label: 'Large', value: 'large' as const },
] as const

const BORDER_RADIUS_OPTIONS = [
  { label: 'Sharp', value: 'none' as const },
  { label: 'Rounded', value: 'default' as const },
  { label: 'Full', value: 'full' as const },
] as const

const LAUNCHER_ICON_COMPONENTS: Record<string, typeof MessageCircle> = {
  chat: MessageCircle,
  sparkle: Sparkles,
  message: MessageSquareText,
  headphones: Headphones,
  bot: Bot,
  help: HelpCircle,
}

interface LayoutTabProps {
  position: 'bottom-right' | 'bottom-left'
  onPositionChange: (value: 'bottom-right' | 'bottom-left') => void
  widgetHeight: number
  onWidgetHeightChange: (value: number) => void
  widgetWidth: 'narrow' | 'default' | 'wide'
  onWidgetWidthChange: (value: 'narrow' | 'default' | 'wide') => void
  launcherSize: 'small' | 'default' | 'large'
  onLauncherSizeChange: (value: 'small' | 'default' | 'large') => void
  borderRadius: 'none' | 'default' | 'full'
  onBorderRadiusChange: (value: 'none' | 'default' | 'full') => void
  launcherIcon: LauncherIcon
  onLauncherIconChange: (value: LauncherIcon) => void
  launcherLabel: string
  onLauncherLabelChange: (value: string) => void
}

export function LayoutTab({
  position,
  onPositionChange,
  widgetHeight,
  onWidgetHeightChange,
  widgetWidth,
  onWidgetWidthChange,
  launcherSize,
  onLauncherSizeChange,
  borderRadius,
  onBorderRadiusChange,
  launcherIcon,
  onLauncherIconChange,
  launcherLabel,
  onLauncherLabelChange,
}: LayoutTabProps) {
  return (
    <div className="space-y-5">
      <SectionCard
        icon={<Move className="size-3.5" />}
        title="Launcher"
        description="Icon and optional label for the chat trigger."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Icon</p>
            <div className="grid grid-cols-3 gap-1.5">
              {LAUNCHER_ICON_OPTIONS.map((opt) => {
                const IconComp = LAUNCHER_ICON_COMPONENTS[opt.value]
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={launcherIcon === opt.value}
                    onClick={() => onLauncherIconChange(opt.value)}
                    className={cn(
                      'flex items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                      launcherIcon === opt.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                    )}
                  >
                    <IconComp className="size-3.5" />
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Label</p>
            <Input
              value={launcherLabel}
              onChange={(e) => onLauncherLabelChange(e.target.value)}
              placeholder="Chat with us"
              className="h-9 text-sm"
              maxLength={50}
            />
            <p className="text-[11px] text-muted-foreground">Optional text shown next to the icon</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={<Move className="size-3.5" />}
        title="Widget"
        description="Position, size and shape of the widget window."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Position</p>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5" role="radiogroup">
              {(['bottom-right', 'bottom-left'] as const).map((pos) => (
                <button
                  key={pos}
                  role="radio"
                  aria-checked={position === pos}
                  onClick={() => onPositionChange(pos)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    position === pos
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {pos === 'bottom-right' ? 'Right' : 'Left'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Height</p>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5" role="radiogroup">
              {HEIGHT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  role="radio"
                  aria-checked={widgetHeight === opt.value}
                  onClick={() => onWidgetHeightChange(opt.value)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    widgetHeight === opt.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Width</p>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5" role="radiogroup">
              {WIDTH_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  role="radio"
                  aria-checked={widgetWidth === opt.value}
                  onClick={() => onWidgetWidthChange(opt.value)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    widgetWidth === opt.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Launcher size</p>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5" role="radiogroup">
              {LAUNCHER_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  role="radio"
                  aria-checked={launcherSize === opt.value}
                  onClick={() => onLauncherSizeChange(opt.value)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    launcherSize === opt.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Corner radius</p>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5" role="radiogroup">
              {BORDER_RADIUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  role="radio"
                  aria-checked={borderRadius === opt.value}
                  onClick={() => onBorderRadiusChange(opt.value)}
                  className={cn(
                    'rounded-md px-4 py-1.5 text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    borderRadius === opt.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
