import { useState } from 'react'
import { Globe, Link, Code, MessageCircle, Bot, Database, KeyRound, CalendarDays } from 'lucide-react'
import { AgentDeployment } from '@/components/agents/agent-deployment'
import { ProviderLogo } from '@/components/agents/provider-logos'
import { cn } from '@/lib/utils'

function WhatsAppLogo({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return <MessageCircle className={className} />
  return (
    <img
      src="https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/whatsapp/default.svg"
      alt=""
      className={className}
      onError={() => setFailed(true)}
    />
  )
}

function formatModelName(model: string): string {
  const part = model.includes('/') ? model.split('/').slice(1).join('/') : model
  return part.replace(/[-_]/g, ' ').trim()
}

function InfoRow({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  tone?: 'success' | 'muted'
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className={cn('text-xs font-medium', tone === 'success' ? 'text-success' : 'text-foreground')}>
        {value}
      </span>
    </div>
  )
}

interface AgentSettingsProps {
  agentModel: string
  hasKnowledgeBase: boolean
  hasProviderKey: boolean
  createdAt: string
  deploymentOptions: Array<{ id: string; enabled: boolean }>
  onDeploymentToggle: (id: string, enabled: boolean) => void
  disabled?: boolean
}

export function AgentSettings({
  agentModel,
  hasKnowledgeBase,
  hasProviderKey,
  createdAt,
  deploymentOptions,
  onDeploymentToggle,
  disabled,
}: AgentSettingsProps) {
  const provider = agentModel.split('/')[0] || 'other'

  const options = [
    {
      id: 'web-chat-widget',
      label: 'Web Chat Widget',
      description: 'Add to your website',
      icon: <Globe className="size-4" />,
      enabled: deploymentOptions.find((o) => o.id === 'web-chat-widget')?.enabled ?? true,
    },
    {
      id: 'shareable-link',
      label: 'Shareable Link',
      description: 'Create a public link',
      icon: <Link className="size-4" />,
      enabled: deploymentOptions.find((o) => o.id === 'shareable-link')?.enabled ?? false,
    },
    {
      id: 'api-access',
      label: 'API Access',
      description: 'Access via API',
      icon: <Code className="size-4" />,
      enabled: deploymentOptions.find((o) => o.id === 'api-access')?.enabled ?? false,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      description: 'Connect on WhatsApp',
      icon: <WhatsAppLogo className="size-4" />,
      enabled: deploymentOptions.find((o) => o.id === 'whatsapp')?.enabled ?? false,
    },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Bot className="size-4" />
          </div>
          <h3 className="text-sm font-semibold">Agent</h3>
        </div>

        <div className="mb-3 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
          <ProviderLogo provider={provider} className="size-4 rounded-[3px]" />
          <span className="text-xs font-medium">{formatModelName(agentModel)}</span>
        </div>

        <div className="divide-y divide-border/60">
          <InfoRow
            icon={<Database className="size-3.5" />}
            label="Knowledge Base"
            value={hasKnowledgeBase ? 'Connected' : 'Not connected'}
            tone={hasKnowledgeBase ? 'success' : 'muted'}
          />
          <InfoRow
            icon={<KeyRound className="size-3.5" />}
            label="Provider Key"
            value={hasProviderKey ? 'Configured' : 'Default'}
            tone={hasProviderKey ? 'success' : 'muted'}
          />
          <InfoRow
            icon={<CalendarDays className="size-3.5" />}
            label="Created"
            value={new Date(createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          />
        </div>
      </div>

      <AgentDeployment options={options} onToggle={onDeploymentToggle} disabled={disabled} />
    </div>
  )
}
