import { Globe, Link, Code, MessageCircle, Rocket, Check, Clock } from 'lucide-react'
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
  { id: 'whatsapp', label: 'WhatsApp', description: 'WhatsApp Business', icon: <MessageCircle className="size-4" />, enabled: false },
]

export function AgentDeployment({
  options = defaultOptions,
  onToggle,
  disabled,
}: AgentDeploymentProps) {
  const activeCount = options.filter((o) => o.enabled).length

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Rocket className="size-4" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Deployment</h3>
          <p className="text-xs text-muted-foreground">Where your agent will be available</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => {
              if (!option.enabled && option.id !== 'web-chat-widget') return
              onToggle?.(option.id, !option.enabled)
            }}
            disabled={disabled}
            className={cn(
              'flex items-center gap-3 w-full p-2.5 rounded-lg text-left transition-all',
              option.enabled
                ? 'bg-primary/5 border border-primary/20'
                : 'border border-transparent hover:bg-muted/40',
              (disabled || (!option.enabled && option.id !== 'web-chat-widget')) && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div
              className={cn(
                'flex size-8 items-center justify-center rounded-md transition-colors',
                option.enabled
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background/60 text-muted-foreground'
              )}
            >
              {option.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">{option.label}</p>
              <p className="text-[10px] text-muted-foreground">{option.description}</p>
            </div>
            {!option.enabled && option.id !== 'web-chat-widget' && (
              <div className="flex items-center gap-1 rounded bg-muted/80 px-1.5 py-0.5">
                <Clock className="size-2.5 text-muted-foreground" />
                <span className="text-[9px] font-medium text-muted-foreground">Soon</span>
              </div>
            )}
            <div
              className={cn(
                'flex size-4.5 items-center justify-center rounded border transition-colors',
                option.enabled
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-background border-border hover:border-primary/50'
              )}
            >
              {option.enabled && <Check className="size-3" />}
            </div>
          </button>
        ))}
      </div>

      {activeCount > 0 && (
        <p className="mt-3 pt-3 border-t text-[11px] text-muted-foreground">
          <span className="font-medium text-foreground">{activeCount}</span> channel{activeCount !== 1 && 's'} active
        </p>
      )}
    </div>
  )
}
