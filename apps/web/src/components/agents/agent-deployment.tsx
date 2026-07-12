import { Globe, Link, Code, MessageCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface DeploymentOption {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  enabled: boolean
}

interface AgentDeploymentProps {
  options?: DeploymentOption[]
  onToggle?: (id: string, enabled: boolean) => void
  disabled?: boolean
}

const defaultOptions: DeploymentOption[] = [
  { id: 'web-chat-widget', label: 'Web Chat Widget', description: 'Embed on website', icon: <Globe className="size-4" />, enabled: true },
  { id: 'shareable-link', label: 'Shareable Link', description: 'Public chat URL', icon: <Link className="size-4" />, enabled: false },
  { id: 'api-access', label: 'API Access', description: 'REST API endpoint', icon: <Code className="size-4" />, enabled: false },
  { id: 'whatsapp', label: 'WhatsApp', description: 'WhatsApp Business', icon: <MessageCircle className="size-4" />, enabled: true },
]

function isAvailable(option: DeploymentOption) {
  return option.enabled || option.id === 'web-chat-widget' || option.id === 'whatsapp'
}

export function AgentDeployment({
  options = defaultOptions,
  onToggle,
  disabled,
}: AgentDeploymentProps) {
  return (
    <div className="space-y-0.5">
      {options.map((option) => {
        const available = isAvailable(option)
        return (
          <div
            key={option.id}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors",
              available ? "hover:bg-muted/40" : "opacity-50"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md transition-colors",
                  option.enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}
              >
                {option.icon}
              </div>
              <div className="min-w-0">
                <Label className="text-xs font-medium leading-tight">{option.label}</Label>
                <p className="text-[11px] text-muted-foreground leading-tight">{option.description}</p>
              </div>
            </div>
            <Switch
              size="sm"
              checked={option.enabled}
              onCheckedChange={(checked) => onToggle?.(option.id, checked)}
              disabled={disabled || !available}
            />
          </div>
        )
      })}
    </div>
  )
}
