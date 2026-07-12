import { useState } from "react"
import { useController, type Control } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AgentBasicInfoProps {
  control: Control
  disabled?: boolean
}

export function AgentBasicInfo({ control, disabled }: AgentBasicInfoProps) {
  const { field: nameField, fieldState: nameState } = useController({ name: 'name', control })
  const { field: descField } = useController({ name: 'description', control })
  const { field: avatarField } = useController({ name: 'avatarUrl', control })
  const [imgError, setImgError] = useState(false)

  const showPreview = avatarField.value && !imgError

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="agent-name" className="text-xs font-medium">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="agent-name"
          placeholder="e.g. Support Assistant"
          value={nameField.value}
          onChange={nameField.onChange}
          disabled={disabled}
          maxLength={50}
          aria-invalid={!!nameState.error}
          aria-describedby={nameState.error ? "name-error" : undefined}
          className="h-9"
        />
        {nameState.error && (
          <p id="name-error" className="text-xs text-destructive">{nameState.error.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="agent-description" className="text-xs font-medium">Description</Label>
        <Input
          id="agent-description"
          placeholder="What does this agent do?"
          value={descField.value}
          onChange={descField.onChange}
          disabled={disabled}
          maxLength={200}
          className="h-9"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="agent-avatar" className="text-xs font-medium">Avatar URL</Label>
        <div className="flex items-center gap-3">
          <Input
            id="agent-avatar"
            placeholder="https://example.com/avatar.png"
            value={avatarField.value || ""}
            onChange={(e) => {
              setImgError(false)
              avatarField.onChange(e.target.value)
            }}
            disabled={disabled}
            className="h-9 flex-1 font-mono text-xs"
          />
          {showPreview && (
            <img
              src={avatarField.value}
              alt="Avatar preview"
              className="size-9 shrink-0 rounded-lg object-cover ring-1 ring-border"
              onError={() => setImgError(true)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
