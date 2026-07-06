import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AgentModelPicker } from './agent-model-picker'
import { AgentPromptEditor } from './agent-prompt-editor'
import { AgentSettings } from './agent-settings'

interface AgentFormData {
  name: string
  description: string
  model: string
  systemPrompt: string
  temperature: number
  maxTokens: number
}

interface AgentFormProps {
  data: AgentFormData
  onChange: (data: AgentFormData) => void
  errors: Partial<Record<keyof AgentFormData, string>>
  disabled?: boolean
}

export function AgentForm({ data, onChange, errors, disabled }: AgentFormProps) {
  function update<K extends keyof AgentFormData>(key: K, value: AgentFormData[K]) {
    onChange({ ...data, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="agent-name">Name *</Label>
        <Input
          id="agent-name"
          placeholder="Enter agent name"
          value={data.name}
          onChange={(e) => update('name', e.target.value)}
          disabled={disabled}
          maxLength={100}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="agent-description">Description</Label>
        <Textarea
          id="agent-description"
          placeholder="Brief description of this agent (optional)"
          value={data.description}
          onChange={(e) => update('description', e.target.value)}
          disabled={disabled}
          maxLength={500}
          rows={2}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Model *</Label>
        <AgentModelPicker
          value={data.model}
          onChange={(v) => update('model', v)}
          disabled={disabled}
        />
        {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="agent-system-prompt">System Prompt *</Label>
        <AgentPromptEditor
          value={data.systemPrompt}
          onChange={(v) => update('systemPrompt', v)}
          disabled={disabled}
        />
        {errors.systemPrompt && (
          <p className="text-xs text-destructive">{errors.systemPrompt}</p>
        )}
      </div>

      <AgentSettings
        temperature={data.temperature}
        maxTokens={data.maxTokens}
        onTemperatureChange={(v) => update('temperature', v)}
        onMaxTokensChange={(v) => update('maxTokens', v)}
        disabled={disabled}
      />
    </div>
  )
}

export type { AgentFormData }
