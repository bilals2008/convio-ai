import { useState, useRef, useCallback } from 'react'
import { Palette, PaintBucket, Upload, X, Loader2, Image as ImageIcon, MessageCircle } from 'lucide-react'
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
  footerBgPresets,
  THEME_MODES,
  type ThemeMode,
} from '../constants'

function QuickReplyInput({ onAdd }: { onAdd: (val: string) => void }) {
  const [val, setVal] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = useCallback(() => {
    const trimmed = val.trim()
    if (!trimmed || trimmed.length > 60) return
    onAdd(trimmed)
    setVal('')
    inputRef.current?.focus()
  }, [val, onAdd])

  return (
    <div className="flex items-center gap-1.5">
      <Input
        ref={inputRef}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd() } }}
        placeholder="Type a quick reply..."
        className="h-8 text-xs flex-1 min-w-[140px]"
        maxLength={60}
      />
      <Button type="button" size="sm" className="h-8 text-xs" onClick={handleAdd} disabled={!val.trim()}>
        Add
      </Button>
    </div>
  )
}

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
  footerBgColor: string
  onFooterBgColorChange: (value: string) => void
  themeMode: ThemeMode
  onThemeModeChange: (value: ThemeMode) => void
  headerTitle: string
  onHeaderTitleChange: (value: string) => void
  headerSubtitle: string
  onHeaderSubtitleChange: (value: string) => void
  showOnlineIndicator: boolean
  onShowOnlineIndicatorChange: (value: boolean) => void
  placeholderText: string
  onPlaceholderTextChange: (value: string) => void
  showPoweredBy: boolean
  onShowPoweredByChange: (value: boolean) => void
  quickReplies: string[]
  onQuickRepliesChange: (value: string[]) => void
  launcherLabel: string
  onLauncherLabelChange: (value: string) => void
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
  footerBgColor,
  onFooterBgColorChange,
  themeMode,
  onThemeModeChange,
  headerTitle,
  onHeaderTitleChange,
  headerSubtitle,
  onHeaderSubtitleChange,
  showOnlineIndicator,
  onShowOnlineIndicatorChange,
  placeholderText,
  onPlaceholderTextChange,
  showPoweredBy,
  onShowPoweredByChange,
  quickReplies,
  onQuickRepliesChange,
  launcherLabel,
  onLauncherLabelChange,
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
    <div className="space-y-6 [&>*+*]:border-t [&>*+*]:border-border/40 [&>*+*]:pt-6">
      <SectionCard
        icon={<Palette className="size-3.5" />}
        title="Agent"
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="agentName" className="text-xs font-medium text-foreground">
              Display name
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
            <Label className="text-xs font-medium text-foreground">Avatar</Label>
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl ring-1 ring-border/40 bg-muted/20">
                {agentAvatar ? (
                  <img src={agentAvatar} alt="" className="size-full object-cover" />
                ) : (
                  <ImageIcon className="size-4 text-muted-foreground/50" />
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-8 text-xs gap-1.5"
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
                  className="h-8 text-xs gap-1.5"
                >
                  <Palette className="size-3" />
                  Preset
                </Button>
                {agentAvatar && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onAgentAvatarChange('')}
                    disabled={isUploading}
                    className="size-8 text-muted-foreground/50 hover:text-destructive"
                  >
                    <X className="size-3.5" />
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
        </div>
      </SectionCard>

      <SectionCard
        icon={<MessageCircle className="size-3.5" />}
        title="Launcher"
        description="The floating button that opens the widget"
      >
        <div className="space-y-2">
          <Label htmlFor="launcherLabel" className="text-xs font-medium text-foreground">
            Label
          </Label>
          <Input
            id="launcherLabel"
            value={launcherLabel}
            onChange={(e) => onLauncherLabelChange(e.target.value)}
            placeholder="Chat with us"
            maxLength={50}
            className="h-9 text-sm"
          />
          <p className="text-[11px] text-muted-foreground/60">
            Optional text shown beside the launcher button.
          </p>
        </div>
      </SectionCard>

      <SectionCard
        icon={<Palette className="size-3.5" />}
        title="Colors"
      >
        <div className="space-y-5">
          <div className="space-y-2.5">
            <p className="text-xs font-medium text-foreground">Theme mode</p>
            <div className="inline-flex rounded-lg bg-muted/30 p-0.5" role="radiogroup">
              {THEME_MODES.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  role="radio"
                  aria-checked={themeMode === mode.value}
                  onClick={() => onThemeModeChange(mode.value)}
                  className={cn(
                    'rounded-md px-3.5 py-1.5 text-xs font-medium transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    themeMode === mode.value
                      ? 'bg-card text-foreground shadow-sm ring-1 ring-border/30'
                      : 'text-muted-foreground/70 hover:text-foreground',
                  )}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <ColorField
              label="Primary"
              description="Launcher & user bubbles"
              value={primaryColor}
              onChange={onPrimaryColorChange}
              presets={primaryPresets}
            />
            <ColorField
              label="Background"
              description="Widget window"
              value={backgroundColor}
              onChange={onBackgroundColorChange}
              presets={bgPresets}
            />
            <ColorField
              label="Text"
              description="Message text"
              value={textColor}
              onChange={onTextColorChange}
              presets={textPresets}
            />
            <ColorField
              label="AI response"
              description="AI bubble bg"
              value={promptBgColor}
              onChange={onPromptBgColorChange}
              presets={promptBgPresets}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={<PaintBucket className="size-3.5" />}
        title="Header"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">Use gradient</span>
            <button
              type="button"
              role="switch"
              aria-checked={headerGradient}
              onClick={() => onHeaderGradientChange(!headerGradient)}
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                headerGradient ? 'bg-primary' : 'bg-muted-foreground/20',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block size-4 translate-y-0.5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
                  headerGradient ? 'translate-x-4' : 'translate-x-0.5',
                )}
              />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <ColorField
              label={headerGradient ? 'Gradient start' : 'Color'}
              value={headerGradientStart}
              onChange={onHeaderGradientStartChange}
              presets={headerStartPresets}
            />
            {headerGradient && (
              <ColorField
                label="Gradient end"
                value={headerGradientEnd}
                onChange={onHeaderGradientEndChange}
                presets={headerEndPresets}
              />
            )}
          </div>

          {headerGradient && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">Direction</span>
                <span className="text-[11px] font-mono text-muted-foreground/60 tabular-nums">{headerGradientDirection}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={360}
                value={headerGradientDirection}
                onChange={(e) => onHeaderGradientDirectionChange(Number(e.target.value))}
                className="w-full h-1 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
              />
              <div
                className="h-8 rounded-lg ring-1 ring-border/30"
                style={{
                  background: `linear-gradient(${headerGradientDirection}deg, ${headerGradientStart}, ${headerGradientEnd})`,
                }}
              />
            </div>
          )}

          {!headerGradient && (
            <div
              className="h-8 rounded-lg ring-1 ring-border/30"
              style={{ backgroundColor: headerGradientStart }}
            />
          )}
        </div>
      </SectionCard>

      <SectionCard
        icon={<PaintBucket className="size-3.5" />}
        title="Header content"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="headerTitle" className="text-xs font-medium text-foreground">Title</Label>
            <Input id="headerTitle" value={headerTitle} onChange={(e) => onHeaderTitleChange(e.target.value)} placeholder="Chat with us" className="h-9 text-sm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="headerSubtitle" className="text-xs font-medium text-foreground">Subtitle</Label>
            <Input id="headerSubtitle" value={headerSubtitle} onChange={(e) => onHeaderSubtitleChange(e.target.value)} placeholder="We're online" className="h-9 text-sm" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/40 px-3.5 py-2.5">
            <span className="text-xs font-medium text-foreground">Online indicator</span>
            <button type="button" role="switch" aria-checked={showOnlineIndicator} onClick={() => onShowOnlineIndicatorChange(!showOnlineIndicator)}
              className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors', showOnlineIndicator ? 'bg-primary' : 'bg-muted-foreground/20')}>
              <span className={cn('pointer-events-none inline-block size-4 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform', showOnlineIndicator ? 'translate-x-4' : 'translate-x-0.5')} />
            </button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border/40 px-3.5 py-2.5">
            <span className="text-xs font-medium text-foreground">Powered by Convio</span>
            <button type="button" role="switch" aria-checked={showPoweredBy} onClick={() => onShowPoweredByChange(!showPoweredBy)}
              className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors', showPoweredBy ? 'bg-primary' : 'bg-muted-foreground/20')}>
              <span className={cn('pointer-events-none inline-block size-4 translate-y-0.5 rounded-full bg-white shadow-sm transition-transform', showPoweredBy ? 'translate-x-4' : 'translate-x-0.5')} />
            </button>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="placeholderText" className="text-xs font-medium text-foreground">Input placeholder</Label>
            <Input id="placeholderText" value={placeholderText} onChange={(e) => onPlaceholderTextChange(e.target.value)} placeholder="Enter your message..." className="h-9 text-sm" />
          </div>
          <div className="space-y-2.5 sm:col-span-2">
            <span className="text-xs font-medium text-foreground">Quick replies</span>
            <div className="flex flex-wrap gap-1.5">
              {quickReplies.map((reply, i) => (
                <div key={i} className="flex items-center gap-1 rounded-lg border border-border/40 bg-muted/20 px-2.5 py-1">
                  <span className="text-xs text-foreground">{reply}</span>
                  <button type="button" onClick={() => onQuickRepliesChange(quickReplies.filter((_, j) => j !== i))} className="text-muted-foreground/40 hover:text-destructive transition-colors">
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              {quickReplies.length < 4 && <QuickReplyInput onAdd={(val) => onQuickRepliesChange([...quickReplies, val])} />}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        icon={<PaintBucket className="size-3.5" />}
        title="Widget elements"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <ColorField
            label="Border"
            value={borderColor}
            onChange={onBorderColorChange}
            presets={borderColorPresets}
          />
          <ColorField
            label="Input bg"
            value={inputBgColor}
            onChange={onInputBgColorChange}
            presets={inputBgPresets}
          />
          <ColorField
            label="Send button"
            value={sendBtnColor}
            onChange={onSendBtnColorChange}
            presets={sendBtnPresets}
          />
          <ColorField
            label="Footer bg"
            value={footerBgColor}
            onChange={onFooterBgColorChange}
            presets={footerBgPresets}
          />
        </div>
      </SectionCard>
    </div>
  )
}
