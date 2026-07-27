import { Palette, PaintBucket } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SectionCard } from './SectionCard'
import { ColorField } from './ColorField'
import {
  primaryPresets,
  bgPresets,
  textPresets,
  promptBgPresets,
  headerStartPresets,
  headerEndPresets,
  borderColorPresets,
  inputBgPresets,
  sendBtnPresets,
} from '../constants'
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
  promptBgColor: string
  onPromptBgColorChange: (value: string) => void
  headerGradientStart: string
  onHeaderGradientStartChange: (value: string) => void
  headerGradientEnd: string
  onHeaderGradientEndChange: (value: string) => void
  headerGradientDirection: number
  onHeaderGradientDirectionChange: (value: number) => void
  borderColor: string
  onBorderColorChange: (value: string) => void
  inputBgColor: string
  onInputBgColorChange: (value: string) => void
  sendBtnColor: string
  onSendBtnColorChange: (value: string) => void
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
  promptBgColor,
  onPromptBgColorChange,
  headerGradientStart,
  onHeaderGradientStartChange,
  headerGradientEnd,
  onHeaderGradientEndChange,
  headerGradientDirection,
  onHeaderGradientDirectionChange,
  borderColor,
  onBorderColorChange,
  inputBgColor,
  onInputBgColorChange,
  sendBtnColor,
  onSendBtnColorChange,
}: AppearanceTabProps) {
  const initials = (agentName || 'A')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 1)
    .join('')
    .toUpperCase()

  return (
    <div className="space-y-5">
      <SectionCard
        icon={<Palette className="size-3.5" />}
        title="Appearance"
      >
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agentName" className="text-sm font-medium">
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
              <Label htmlFor="agentAvatar" className="text-sm font-medium">
                Avatar URL
              </Label>
              <div className="flex items-center gap-2.5">
                <Input
                  id="agentAvatar"
                  value={agentAvatar}
                  onChange={(e) => onAgentAvatarChange(e.target.value)}
                  placeholder="https://..."
                  className="h-9 flex-1 text-sm"
                />
                <div
                  className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-foreground/10"
                  style={
                    agentAvatar
                      ? undefined
                      : {
                          background: `linear-gradient(135deg, ${primaryColor}, color-mix(in srgb, ${primaryColor} 80%, black))`,
                        }
                  }
                >
                  {agentAvatar ? (
                    <img
                      src={agentAvatar}
                      alt=""
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

          <div className="space-y-4 border-t border-border/60 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label="Primary color"
                description="Accent for the launcher button and user bubbles"
                value={primaryColor}
                onChange={onPrimaryColorChange}
                presets={primaryPresets}
              />

              <ColorField
                label="Background color"
                description="Main background of the widget window"
                value={backgroundColor}
                onChange={onBackgroundColorChange}
                presets={bgPresets}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField
                label="Text color"
                description="Color of message text and labels"
                value={textColor}
                onChange={onTextColorChange}
                presets={textPresets}
              />

              <ColorField
                label="Prompt background"
                description="Background color for AI response bubbles"
                value={promptBgColor}
                onChange={onPromptBgColorChange}
                presets={promptBgPresets}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={<PaintBucket className="size-3.5" />}
        title="Header"
        description="Gradient background for the widget header"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              label="Gradient start"
              description="Starting color of the header gradient"
              value={headerGradientStart}
              onChange={onHeaderGradientStartChange}
              presets={headerStartPresets}
            />

            <ColorField
              label="Gradient end"
              description="Ending color of the header gradient"
              value={headerGradientEnd}
              onChange={onHeaderGradientEndChange}
              presets={headerEndPresets}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Direction</Label>
              <span className="text-xs text-muted-foreground tabular-nums">{headerGradientDirection}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              value={headerGradientDirection}
              onChange={(e) => onHeaderGradientDirectionChange(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0°</span>
              <span>90°</span>
              <span>180°</span>
              <span>270°</span>
              <span>360°</span>
            </div>
          </div>

          <div
            className="h-10 rounded-lg ring-1 ring-foreground/10"
            style={{
              background: `linear-gradient(${headerGradientDirection}deg, ${headerGradientStart}, ${headerGradientEnd})`,
            }}
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={<PaintBucket className="size-3.5" />}
        title="Widget elements"
        description="Customize borders, input area, and send button"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <ColorField
            label="Border color"
            description="Color of widget borders and dividers"
            value={borderColor}
            onChange={onBorderColorChange}
            presets={borderColorPresets}
          />

          <ColorField
            label="Input background"
            description="Background color of the message input area"
            value={inputBgColor}
            onChange={onInputBgColorChange}
            presets={inputBgPresets}
          />

          <ColorField
            label="Send button"
            description="Color of the send message button"
            value={sendBtnColor}
            onChange={onSendBtnColorChange}
            presets={sendBtnPresets}
          />
        </div>
      </SectionCard>
    </div>
  )
}
