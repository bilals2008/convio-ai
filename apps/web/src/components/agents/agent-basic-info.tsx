import { useState } from "react"
import { UserRound, ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3.5">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <UserRound className="size-4" />
        </div>
        <h3 className="text-sm font-semibold">Basic Information</h3>
      </div>

      <div className="space-y-6 p-5">
        {/* Avatar + Name */}
        <div className="flex items-start gap-4">
          <div className="group relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted ring-1 ring-border">
            {avatarUrl && !previewError ? (
              <img
                src={avatarUrl}
                alt="Avatar preview"
                className="size-full object-cover"
                onError={() => setPreviewError(true)}
              />
            ) : (
              <ImageIcon className="size-6 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 space-y-1.5">
            <Label htmlFor="agent-name" className="text-xs font-medium">
              Agent Name
            </Label>
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
                <span className="text-[11px] text-muted-foreground">Give your agent a recognizable name</span>
              )}
              <span className="text-[11px] tabular-nums text-muted-foreground">{name.length}/50</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="agent-description" className="text-xs font-medium">
            Description
          </Label>
          <Input
            id="agent-description"
            placeholder="Brief description of what this agent does…"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            disabled={disabled}
            maxLength={200}
            className="h-9"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Shown on the agent card and detail page</span>
            <span className="text-[11px] tabular-nums text-muted-foreground">{description.length}/200</span>
          </div>
        </div>

        {/* Avatar URL */}
        <div className="space-y-1.5">
          <Label htmlFor="agent-avatar" className="text-xs font-medium">
            Avatar URL
          </Label>
          <Input
            id="agent-avatar"
            placeholder="https://example.com/avatar.png"
            value={avatarUrl || ""}
            onChange={(e) => {
              setPreviewError(false)
              onAvatarUrlChange?.(e.target.value)
            }}
            disabled={disabled}
            className="h-9 font-mono text-xs"
          />
          <p className="text-[11px] text-muted-foreground">
            Paste a link to an image (PNG, JPG, or SVG)
          </p>
        </div>
      </div>
    </section>
  )
}
