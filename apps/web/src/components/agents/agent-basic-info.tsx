import { useState } from 'react'
import { User, Image } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AgentBasicInfoProps {
  name: string
  description: string
  avatarUrl?: string
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onAvatarUrlChange?: (value: string) => void
  errors?: {
    name?: string
    description?: string
  }
  disabled?: boolean
}

export function AgentBasicInfo({
  name,
  description,
  avatarUrl,
  onNameChange,
  onDescriptionChange,
  onAvatarUrlChange,
  errors,
  disabled,
}: AgentBasicInfoProps) {
  const [previewError, setPreviewError] = useState(false)

  return (
    <section className="rounded-xl border bg-card p-6">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <User className="size-4" />
          </div>
          <h3 className="font-semibold text-sm">Basic Information</h3>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Avatar URL</Label>
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted overflow-hidden">
              {avatarUrl && !previewError ? (
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="size-full object-cover"
                  onError={() => setPreviewError(true)}
                />
              ) : (
                <Image className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <Input
                placeholder="https://example.com/avatar.png"
                value={avatarUrl || ''}
                onChange={(e) => {
                  setPreviewError(false)
                  onAvatarUrlChange?.(e.target.value)
                }}
                disabled={disabled}
                className="h-9 font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Paste a URL to an image (PNG, JPG, or SVG)
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="agent-name" className="text-xs font-medium">Agent Name</Label>
            <Input
              id="agent-name"
              placeholder="e.g. Support Assistant"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              disabled={disabled}
              maxLength={50}
              aria-invalid={!!errors?.name}
              className="h-9"
            />
            <div className="flex items-center justify-between">
              {errors?.name ? (
                <p className="text-xs text-destructive">{errors.name}</p>
              ) : (
                <span />
              )}
              <span className="text-[11px] text-muted-foreground">{name.length}/50</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="agent-description" className="text-xs font-medium">Description</Label>
            <Input
              id="agent-description"
              placeholder="Brief description of this agent..."
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              disabled={disabled}
              maxLength={200}
              className="h-9"
            />
            <div className="flex items-center justify-between">
              <span />
              <span className="text-[11px] text-muted-foreground">{description.length}/200</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
