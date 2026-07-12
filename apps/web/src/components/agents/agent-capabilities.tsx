import { MessageSquare, Search, Users, Calendar, Zap } from 'lucide-react'
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
  {
    id: 'generate-leads',
    label: 'Generate Leads',
    description: 'Capture leads & details',
    icon: <Users className="size-4" />,
    enabled: false,
  },
  {
    id: 'book-appointments',
    label: 'Book Appointments',
    description: 'Schedule meetings',
    icon: <Calendar className="size-4" />,
    enabled: false,
  },
  {
    id: 'execute-actions',
    label: 'Execute Actions',
    description: 'Perform custom actions',
    icon: <Zap className="size-4" />,
    enabled: false,
  },
]

function isAvailable(capability: Capability) {
  return capability.enabled || capability.id === 'answer-questions' || capability.id === 'knowledge-search'
}

export function AgentCapabilities({
  capabilities = defaultCapabilities,
  onToggle,
  disabled,
}: AgentCapabilitiesProps) {
  return (
    <div className="space-y-0.5">
      {capabilities.map((capability) => {
        const available = isAvailable(capability)
        return (
          <div
            key={capability.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors",
              available ? "hover:bg-muted/40" : "opacity-50"
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
              disabled={disabled || !available}
            />
          </div>
        )
      })}
    </div>
  )
}

export type { Capability }
export { defaultCapabilities }
