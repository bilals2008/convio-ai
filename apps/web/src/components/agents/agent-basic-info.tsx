import { useState } from "react"
import { useController, type Control } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PresetAvatarPicker } from "@/components/agents/preset-avatar-picker"

interface AgentBasicInfoProps {
  control: Control
  disabled?: boolean
}

export function AgentBasicInfo({ control, disabled }: AgentBasicInfoProps) {
  const { field: nameField, fieldState: nameState } = useController({ name: 'name', control })
  const { field: descField } = useController({ name: 'description', control })
  const { field: avatarField } = useController({ name: 'avatar', control })

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

      <PresetAvatarPicker
        value={avatarField.value || ''}
        onChange={(url) => avatarField.onChange(url)}
        disabled={disabled}
      />
    </div>
  )
}