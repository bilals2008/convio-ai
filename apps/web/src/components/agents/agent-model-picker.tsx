import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const modelGroups = [
  {
    provider: 'OpenAI',
    models: [
      { value: 'gpt-4o', label: 'GPT-4o' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    ],
  },
  {
    provider: 'Anthropic',
    models: [
      { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
      { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
    ],
  },
  {
    provider: 'Google',
    models: [
      { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
      { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    ],
  },
  {
    provider: 'Groq',
    models: [
      { value: 'llama-3.1-8b', label: 'Llama 3.1 8B' },
      { value: 'mixtral-8x7b', label: 'Mixtral 8x7B' },
    ],
  },
  {
    provider: 'KIE',
    models: [
      { value: 'gpt-5-2', label: 'GPT 5.2' },
      { value: 'gpt-5-4', label: 'GPT 5.4' },
      { value: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
      { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
      { value: 'gemini-2-5-pro', label: 'Gemini 2.5 Pro' },
      { value: 'gemini-2-5-flash', label: 'Gemini 2.5 Flash' },
    ],
  },
]

interface AgentModelPickerProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function AgentModelPicker({ value, onChange, disabled }: AgentModelPickerProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a model" />
      </SelectTrigger>
      <SelectContent>
        {modelGroups.map((group) => (
          <div key={group.provider}>
            <SelectLabel>{group.provider}</SelectLabel>
            {group.models.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
            <SelectSeparator />
          </div>
        ))}
      </SelectContent>
    </Select>
  )
}
