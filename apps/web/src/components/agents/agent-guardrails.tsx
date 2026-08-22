import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export interface AgentGuardrailsValue {
  enabled: boolean
  blockedWords: string[]
  restrictedTopics: string[]
}

export const defaultGuardrails: AgentGuardrailsValue = {
  enabled: false,
  blockedWords: [],
  restrictedTopics: [],
}

interface AgentGuardrailsProps {
  value: AgentGuardrailsValue
  onChange: (value: AgentGuardrailsValue) => void
  disabled?: boolean
}

const toList = (s: string) =>
  s.split(',').map((item) => item.trim()).filter(Boolean)

export function AgentGuardrails({ value, onChange, disabled }: AgentGuardrailsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <Label className="text-xs font-medium">Enable guardrails</Label>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Refuse messages with blocked words and off-limit topics.
          </p>
        </div>
        <Switch
          size="sm"
          checked={value.enabled}
          onCheckedChange={(enabled) => onChange({ ...value, enabled })}
          disabled={disabled}
        />
      </div>

      <div className={cn('grid gap-3 sm:grid-cols-2', !value.enabled && 'opacity-50')}>
        <div className="space-y-1.5">
          <Label htmlFor="guardrails-blocked" className="text-xs font-medium">
            Blocked words
          </Label>
          <Input
            id="guardrails-blocked"
            placeholder="e.g. bitcoin, profanity"
            defaultValue={value.blockedWords.join(', ')}
            onChange={(e) => onChange({ ...value, blockedWords: toList(e.target.value) })}
            disabled={disabled || !value.enabled}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guardrails-topics" className="text-xs font-medium">
            Restricted topics
          </Label>
          <Input
            id="guardrails-topics"
            placeholder="e.g. politics, medical advice"
            defaultValue={value.restrictedTopics.join(', ')}
            onChange={(e) => onChange({ ...value, restrictedTopics: toList(e.target.value) })}
            disabled={disabled || !value.enabled}
            className="h-9"
          />
        </div>
      </div>
    </div>
  )
}
