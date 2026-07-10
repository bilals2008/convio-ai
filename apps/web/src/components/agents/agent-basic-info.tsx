import { useState } from "react"
import { useController, type Control } from "react-hook-form"
import { UserRound, ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AgentBasicInfoProps {
  control: Control
  disabled?: boolean
}

export function AgentBasicInfo({
  control,
  disabled,
}: AgentBasicInfoProps) {
  const { field: nameField, fieldState: nameState } = useController({ name: 'name', control })
  const { field: descField } = useController({ name: 'description', control })
  const { field: avatarField } = useController({ name: 'avatarUrl', control })
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
            {avatarField.value && !previewError ? (
              <img
                src={avatarField.value}
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
              value={nameField.value}
              onChange={nameField.onChange}
              disabled={disabled}
              maxLength={50}
              aria-invalid={!!nameState.error}
              className="h-9"
            />
            <div className="flex items-center justify-between">
              {nameState.error ? (
                <p className="text-xs text-destructive">{nameState.error.message}</p>
              ) : (
                <span className="text-[11px] text-muted-foreground">Give your agent a recognizable name</span>
              )}
              <span className="text-[11px] tabular-nums text-muted-foreground">{nameField.value.length}/50</span>
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
            value={descField.value}
            onChange={descField.onChange}
            disabled={disabled}
            maxLength={200}
            className="h-9"
          />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Shown on the agent card and detail page</span>
            <span className="text-[11px] tabular-nums text-muted-foreground">{descField.value.length}/200</span>
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
            value={avatarField.value || ""}
            onChange={(e) => {
              setPreviewError(false)
              avatarField.onChange(e.target.value)
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
