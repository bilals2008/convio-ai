import { useQuery } from '@tanstack/react-query'
import { Loader2, Check } from 'lucide-react'
import { agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'

export interface AgentTemplate {
  id: string
  name: string
  description: string
  systemPrompt: string
  suggestedModel: string
  suggestedTemperature: number
}

interface AgentTemplatePickerProps {
  selectedId?: string
  onSelect: (template: AgentTemplate) => void
  disabled?: boolean
}

// Grid of ready-made prompt templates. Selecting one prefills the create form.
export function AgentTemplatePicker({ selectedId, onSelect, disabled }: AgentTemplatePickerProps) {
  const { orgId } = useOrg()

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['agent-templates', orgId],
    queryFn: async () => {
      const res = await agentsApi.templates(orgId!)
      return res.data.data as AgentTemplate[]
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {templates.map((template) => {
        const selected = template.id === selectedId
        return (
          <button
            key={template.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(template)}
            className={cn(
              'flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors disabled:opacity-50',
              selected ? 'border-primary bg-primary/5' : 'hover:bg-muted/40',
            )}
          >
            <div className="flex w-full items-center justify-between gap-2">
              <span className="text-sm font-medium">{template.name}</span>
              {selected && <Check className="size-4 shrink-0 text-primary" />}
            </div>
            <span className="text-[11px] leading-tight text-muted-foreground">{template.description}</span>
          </button>
        )
      })}
    </div>
  )
}
