import { Palette } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { SectionCard } from './SectionCard'
import { ColorField } from './ColorField'
import { primaryPresets, bgPresets, textPresets } from '../constants'
import { getContrastText } from '../helpers'

interface AppearanceTabProps {
  agentName: string
  onAgentNameChange: (value: string) => void
  agentAvatar: string
  onAgentAvatarChange: (value: string) => void
  primaryColor: string
  onPrimaryColorChange: (value: string) => void
  backgroundColor: string
  onBackgroundColorChange: (value: string) => void
  textColor: string
  onTextColorChange: (value: string) => void
  position: 'bottom-right' | 'bottom-left'
  onPositionChange: (value: 'bottom-right' | 'bottom-left') => void
}

export function AppearanceTab({
  agentName,
  onAgentNameChange,
  agentAvatar,
  onAgentAvatarChange,
  primaryColor,
  onPrimaryColorChange,
  backgroundColor,
  onBackgroundColorChange,
  textColor,
  onTextColorChange,
  position,
  onPositionChange,
}: AppearanceTabProps) {
  const initials = (agentName || 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 1)
    .join('')
    .toUpperCase()

  return (
    <>
      <SectionCard
        icon={<Palette className="size-3.5" aria-hidden="true" />}
        title="Appearance"
        description="Customize how the widget looks on your site."
      >
        <div className="space-y-7">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agentName" className="text-sm font-medium text-foreground">
                Agent name
              </Label>
              <Input
                id="agentName"
                value={agentName}
                onChange={(e) => onAgentNameChange(e.target.value)}
                placeholder="Assistant"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agentAvatar" className="text-sm font-medium text-foreground">
                Avatar URL
              </Label>
              <div className="flex items-center gap-2.5">
                <Input
                  id="agentAvatar"
                  value={agentAvatar}
                  onChange={(e) => onAgentAvatarChange(e.target.value)}
                  placeholder="https://…"
                  className="h-9 flex-1 text-sm"
                />
                <div
                  className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-foreground/10 transition-all duration-200"
                  style={
                    agentAvatar
                      ? undefined
                      : {
                          background: `linear-gradient(135deg, ${primaryColor}, color-mix(in srgb, ${primaryColor} 80%, black))`,
                          boxShadow: `0 0 0 2px ${primaryColor}`,
                        }
                  }
                  aria-label="Avatar preview"
                >
                  {agentAvatar ? (
                    <img
                      src={agentAvatar}
                      alt="Agent avatar preview"
                      className="size-full rounded-full object-cover"
                    />
                  ) : (
                    <span
                      className="text-xs font-bold"
                      style={{ color: getContrastText(primaryColor) }}
                    >
                      {initials}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 border-t border-border/60 pt-6">
            <ColorField
              label="Primary color"
              hint="Accent for the launcher button and user bubbles"
              value={primaryColor}
              onChange={onPrimaryColorChange}
              presets={primaryPresets}
            />

            <ColorField
              label="Background color"
              hint="Main background of the widget window"
              value={backgroundColor}
              onChange={onBackgroundColorChange}
              presets={bgPresets}
            />

            <ColorField
              label="Text color"
              hint="Color of message text and labels"
              value={textColor}
              onChange={onTextColorChange}
              presets={textPresets}
            />
          </div>
        </div>
      </SectionCard>

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <div className="flex items-start justify-between gap-4 border-b border-border/60 bg-card px-6 py-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Launcher position</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Where the floating launcher appears on the page.
            </p>
          </div>
          <div
            className="flex shrink-0 items-center rounded-lg border border-border bg-muted/30 p-0.5"
            role="radiogroup"
            aria-label="Launcher position"
          >
            {(['bottom-right', 'bottom-left'] as const).map((pos) => (
              <button
                key={pos}
                role="radio"
                aria-checked={position === pos}
                onClick={() => onPositionChange(pos)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                  position === pos
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'relative size-3.5 rounded-sm border',
                    position === pos ? 'border-primary-foreground/40' : 'border-current/40',
                  )}
                  aria-hidden="true"
                >
                  <span
                    className={cn(
                      'absolute size-1.5 rounded-full',
                      pos === 'bottom-right' ? 'bottom-0 right-0' : 'bottom-0 left-0',
                      position === pos ? 'bg-primary-foreground' : 'bg-current',
                    )}
                  />
                </span>
                {pos === 'bottom-right' ? 'Right' : 'Left'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
