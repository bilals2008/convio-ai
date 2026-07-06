import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { BotAgentSelector } from './bot-agent-selector'
import { BotAppearancePicker } from './bot-appearance-picker'
import { BotStatusToggle } from './bot-status-toggle'
import type { BotStatus } from './bot-status-toggle'

interface BotFormData {
  name: string
  description: string
  agentId: string
  welcomeMessage: string
  widgetColor: string
  avatar: string
  status: BotStatus
}

interface BotFormProps {
  data: BotFormData
  onChange: (data: BotFormData) => void
  errors: Partial<Record<keyof BotFormData, string>>
  disabled?: boolean
  isCreate?: boolean
}

export function BotForm({ data, onChange, errors, disabled, isCreate }: BotFormProps) {
  function update<K extends keyof BotFormData>(key: K, value: BotFormData[K]) {
    onChange({ ...data, [key]: value })
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="bot-name">Name *</Label>
        <Input
          id="bot-name"
          placeholder="Enter bot name"
          value={data.name}
          onChange={(e) => update('name', e.target.value)}
          disabled={disabled}
          maxLength={100}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bot-description">Description</Label>
        <Textarea
          id="bot-description"
          placeholder="Brief description (optional)"
          value={data.description}
          onChange={(e) => update('description', e.target.value)}
          disabled={disabled}
          maxLength={500}
          rows={2}
        />
      </div>

      <BotAgentSelector
        value={data.agentId}
        onChange={(v) => update('agentId', v)}
        error={errors.agentId}
        disabled={disabled}
      />

      <div className="space-y-2">
        <Label htmlFor="bot-welcome">Welcome Message</Label>
        <Textarea
          id="bot-welcome"
          placeholder="The first message users see"
          value={data.welcomeMessage}
          onChange={(e) => update('welcomeMessage', e.target.value)}
          disabled={disabled}
          maxLength={500}
          rows={2}
        />
      </div>

      <BotAppearancePicker
        color={data.widgetColor}
        avatar={data.avatar}
        onColorChange={(v) => update('widgetColor', v)}
        onAvatarChange={(v) => update('avatar', v)}
        disabled={disabled}
      />

      {!isCreate && (
        <div className="space-y-2">
          <Label>Status</Label>
          <BotStatusToggle
            value={data.status}
            onChange={(v) => update('status', v)}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  )
}

export type { BotFormData }
