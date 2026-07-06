import { Textarea } from '@/components/ui/textarea'

interface AgentPromptEditorProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function AgentPromptEditor({ value, onChange, disabled }: AgentPromptEditorProps) {
  const charCount = value.length

  return (
    <div className="space-y-2">
      <Textarea
        placeholder="You are a helpful assistant..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[200px] resize-y font-mono text-sm"
      />
      <div className="flex justify-end">
        <span className="text-xs text-muted-foreground">{charCount} characters</span>
      </div>
    </div>
  )
}
