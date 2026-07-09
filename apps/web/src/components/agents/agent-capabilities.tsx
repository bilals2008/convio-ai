import { MessageSquare, Search, Users, Calendar, Zap, Sparkles } from 'lucide-react'
import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

function OrangeSwitch({
  className,
  ...props
}: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 h-[18.4px] w-[32px] data-checked:bg-orange-500 data-unchecked:bg-input data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className="pointer-events-none block rounded-full bg-background ring-0 transition-transform size-4 data-checked:translate-x-[calc(100%-2px)] data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground"
      />
    </SwitchPrimitive.Root>
  )
}

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

export function AgentCapabilities({
  capabilities = defaultCapabilities,
  onToggle,
  disabled,
}: AgentCapabilitiesProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-5" />
          </div>
        <h3 className="font-semibold">Capabilities</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Choose what your agent can do</p>

      <div className="space-y-4">
        {capabilities.map((capability) => (
          <div
            key={capability.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                {capability.icon}
              </div>
              <div>
                <Label className="font-medium">{capability.label}</Label>
                <p className="text-xs text-muted-foreground">{capability.description}</p>
              </div>
            </div>
            <OrangeSwitch
              checked={capability.enabled}
              onCheckedChange={(checked) => onToggle(capability.id, checked)}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export type { Capability }
export { defaultCapabilities }
