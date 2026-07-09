import { Globe, Link, Code, MessageCircle, Rocket, Check } from 'lucide-react'
import { Label } from '@/components/ui/label'
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
  {
    id: 'web-chat-widget',
    label: 'Web Chat Widget',
    description: 'Add to your website',
    icon: <Globe className="size-4" />,
    enabled: true,
  },
  {
    id: 'shareable-link',
    label: 'Shareable Link',
    description: 'Create a public link',
    icon: <Link className="size-4" />,
    enabled: false,
  },
  {
    id: 'api-access',
    label: 'API Access',
    description: 'Access via API',
    icon: <Code className="size-4" />,
    enabled: false,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    description: 'Connect on WhatsApp',
    icon: <MessageCircle className="size-4" />,
    enabled: false,
  },
]

export function AgentDeployment({
  options = defaultOptions,
  onToggle,
  disabled,
}: AgentDeploymentProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2 mb-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Rocket className="size-5" />
          </div>
        <h3 className="font-semibold">Deployment</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">Choose where your agent will live</p>

      <div className="space-y-3">
        {options.map((option) => (
          <div
            key={option.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                {option.icon}
              </div>
              <div>
                <Label className="font-medium text-sm">{option.label}</Label>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </div>
            <button
              type="button"
              role="checkbox"
              aria-checked={option.enabled}
              onClick={() => onToggle?.(option.id, !option.enabled)}
              disabled={disabled}
              className={cn(
                "flex size-5 items-center justify-center rounded border transition-colors",
                option.enabled
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-border hover:border-primary/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {option.enabled && <Check className="size-3.5" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
