import { MessageSquare, Search } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface Capability {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

interface AgentCapabilitiesProps {
  capabilities: Capability[]
  onToggle: (id: string, enabled: boolean) => void
  disabled?: boolean
  onSeeAll?: () => void
  totalCount?: number
}

const defaultCapabilities: Capability[] = [
  {
    id: 'answer-questions',
    label: 'Answer Questions',
    description: 'Respond to user queries',
    icon: <MessageSquare className="size-4" />,
    enabled: true,
  },
  {
    id: 'knowledge-search',
    label: 'Knowledge Search',
    description: 'Search in your documents',
    icon: <Search className="size-4" />,
    enabled: true,
  },
]

export function AgentCapabilities({
  capabilities = defaultCapabilities,
  onToggle,
  disabled,
  onSeeAll,
  totalCount,
}: AgentCapabilitiesProps) {
  return (
    <div className="space-y-0.5">
      {capabilities.map((capability) => {
        return (
          <div
            key={capability.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors",
              !disabled && "hover:bg-muted/40",
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                {capability.icon}
              </div>
              <div className="min-w-0">
                <Label className="text-xs font-medium leading-tight">{capability.label}</Label>
                <p className="text-[11px] text-muted-foreground leading-tight">{capability.description}</p>
              </div>
            </div>
            <Switch
              size="sm"
              checked={capability.enabled}
              onCheckedChange={(checked) => onToggle(capability.id, checked)}
              disabled={disabled}
            />
          </div>
        )
      })}
      {onSeeAll && (
        <button
          type="button"
          onClick={onSeeAll}
          className="w-full text-center text-xs text-primary hover:underline py-1.5"
        >
          {totalCount ? `See all ${totalCount} capabilities` : 'See all capabilities'}
        </button>
      )}
    </div>
  )
}

export type { Capability }
export { defaultCapabilities }
