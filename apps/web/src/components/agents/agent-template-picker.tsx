import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, ChevronDown, Check } from 'lucide-react'
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

export function AgentTemplatePicker({ selectedId, onSelect, disabled }: AgentTemplatePickerProps) {
  const { orgId } = useOrg()
  const [open, setOpen] = useState(false)
  const selectedName = selectedId
    ? null
    : null

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['agent-templates', orgId],
    queryFn: async () => {
      const res = await agentsApi.templates(orgId!)
      return res.data.data as AgentTemplate[]
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  })

  const selected = templates.find((t) => t.id === selectedId)

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-muted/40 disabled:opacity-50"
      >
        <span>{selected ? selected.name : 'Choose a template…'}</span>
        <ChevronDown className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="border-t">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">No templates available.</p>
          ) : (
            <div className="divide-y">
              {templates.map((template) => {
                const isSelected = template.id === selectedId
                return (
                  <button
                    key={template.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      onSelect(template)
                      setOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors disabled:opacity-50',
                      isSelected ? 'bg-primary/5' : 'hover:bg-muted/40',
                    )}
                  >
                    <span className={cn(
                      'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors',
                      isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/30',
                    )}>
                      {isSelected && <Check className="size-3" />}
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-medium">{template.name}</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{template.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
