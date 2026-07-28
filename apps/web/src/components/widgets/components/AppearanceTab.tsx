import { useState, useRef } from 'react'
import { Palette, PaintBucket, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { SectionCard } from './SectionCard'
import { ColorField } from './ColorField'
import { AvatarPresetModal } from '@/components/agents/avatar-preset-modal'
import { useAgentAvatarUpload } from '@/lib/hooks/use-agent-avatar-upload'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
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
  THEME_MODES,
  type ThemeMode,
} from '../constants'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_MB = 2

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
  headerGradient: boolean
  onHeaderGradientChange: (value: boolean) => void
  borderColor: string
  onBorderColorChange: (value: string) => void
  inputBgColor: string
  onInputBgColorChange: (value: string) => void
  sendBtnColor: string
  onSendBtnColorChange: (value: string) => void
  themeMode: ThemeMode
  onThemeModeChange: (value: ThemeMode) => void
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
  headerGradient,
  onHeaderGradientChange,
  borderColor,
  onBorderColorChange,
  inputBgColor,
  onInputBgColorChange,
  sendBtnColor,
  onSendBtnColorChange,
  themeMode,
  onThemeModeChange,
}: AppearanceTabProps) {
  const { orgId } = useOrg()
  const { upload, isUploading, progress } = useAgentAvatarUpload()
  const [presetModalOpen, setPresetModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG, WebP, and GIF images are allowed.')
      e.target.value = ''
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_SIZE_MB}MB.`)
      e.target.value = ''
      return
    }

    if (!orgId) {
      toast.error('Organization not loaded. Please wait and try again.')
      e.target.value = ''
      return
    }

    try {
      const url = await upload(orgId, file)
      onAgentAvatarChange(url)
      toast.success('Avatar uploaded')
    } catch {
      toast.error('Failed to upload avatar')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-5">
      <SectionCard
        icon={<Palette className="size-3.5" />}
        title="Appearance"
      >
        <div className="space-y-6">
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
            <Label className="text-sm font-medium">Avatar</Label>
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-border/60">
                {agentAvatar ? (
                  <img src={agentAvatar} alt="" className="size-full object-cover" />
                ) : (
                  <ImageIcon className="size-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-8 text-xs"
                >
                  {isUploading ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Upload className="size-3" />
                  )}
                  {isUploading ? `${progress}%` : 'Upload'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPresetModalOpen(true)}
                  disabled={isUploading}
                  className="h-8 text-xs"
                >
                  <Palette className="size-3" />
                  Preset
                </Button>
                {agentAvatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onAgentAvatarChange('')}
                    disabled={isUploading}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </div>
            </div>
            <AvatarPresetModal
              open={presetModalOpen}
              onOpenChange={setPresetModalOpen}
              value={agentAvatar}
              onSelect={onAgentAvatarChange}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Color scheme</Label>
            <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5" role="radiogroup">
              {THEME_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  role="radio"
                  aria-checked={themeMode === mode.value}
                  onClick={() => onThemeModeChange(mode.value)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                    themeMode === mode.value
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {themeMode === 'auto' ? 'Follows the visitor\'s system setting' : themeMode === 'light' ? 'Always uses light colors' : 'Always uses dark colors'}
            </p>
          </div>

          <div className="space-y-4 border-t border-border/60 pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ColorField
                label="Primary"
                description="Accent for the launcher button and user bubbles"
                value={primaryColor}
                onChange={onPrimaryColorChange}
                presets={primaryPresets}
              />

              <ColorField
                label="Background"
                description="Main background of the widget window"
                value={backgroundColor}
                onChange={onBackgroundColorChange}
                presets={bgPresets}
              />

              <ColorField
                label="Text"
                description="Color of message text and labels"
                value={textColor}
                onChange={onTextColorChange}
                presets={textPresets}
              />

              <ColorField
                label="Prompt bg"
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
        description="Background for the widget header"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Gradient</Label>
              <p className="text-[11px] text-muted-foreground">Use a gradient or solid color</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={headerGradient}
              onClick={() => onHeaderGradientChange(!headerGradient)}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                headerGradient ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200',
                  headerGradient ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              label={headerGradient ? 'Gradient start' : 'Color'}
              description={headerGradient ? 'Starting color of the header gradient' : 'Solid header background color'}
              value={headerGradientStart}
              onChange={onHeaderGradientStartChange}
              presets={headerStartPresets}
            />

            {headerGradient && (
              <ColorField
                label="Gradient end"
                description="Ending color of the header gradient"
                value={headerGradientEnd}
                onChange={onHeaderGradientEndChange}
                presets={headerEndPresets}
              />
            )}
          </div>

          {headerGradient && (
            <>
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
            </>
          )}

          {!headerGradient && (
            <div
              className="h-10 rounded-lg ring-1 ring-foreground/10"
              style={{ backgroundColor: headerGradientStart }}
            />
          )}
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
