import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, Link, Code, MessageCircle, Loader2, Copy, Check, ExternalLink, Rocket, Radio, Settings as SettingsIcon } from 'lucide-react'
import { AgentDeployment } from '@/components/agents/agent-deployment'
import { Button } from '@/components/ui/button'
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

interface AgentDeploymentsProps {
  agentId: string
  agentName: string
  deploymentOptions: Array<{ id: string; enabled: boolean }>
  onDeploymentToggle: (id: string, enabled: boolean) => void
  shareUrl?: string
  disabled?: boolean
}

export function AgentDeployments({
  agentId,
  agentName,
  deploymentOptions,
  onDeploymentToggle,
  shareUrl,
  disabled,
}: AgentDeploymentsProps) {
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  const shareLinkEnabled = deploymentOptions.find((o) => o.id === 'shareable-link')?.enabled ?? false

  const options = [
    {
      id: 'web-chat-widget',
      label: 'Web Chat Widget',
      description: 'Embed a chat widget on your website',
      icon: <Globe className="size-4" />,
      enabled: deploymentOptions.find((o) => o.id === 'web-chat-widget')?.enabled ?? true,
    },
    {
      id: 'shareable-link',
      label: 'Shareable Link',
      description: 'Create a public chat link for this agent',
      icon: <Link className="size-4" />,
      enabled: deploymentOptions.find((o) => o.id === 'shareable-link')?.enabled ?? false,
    },
    {
      id: 'api-access',
      label: 'API Access',
      description: 'Integrate via REST API',
      icon: <Code className="size-4" />,
      enabled: deploymentOptions.find((o) => o.id === 'api-access')?.enabled ?? false,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      description: 'Connect on WhatsApp',
      icon: <WhatsAppLogo className="size-4" />,
      enabled: deploymentOptions.find((o) => o.id === 'whatsapp')?.enabled ?? true,
    },
  ]

  const enabledCount = options.filter((o) => o.enabled).length

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Rocket className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Deployments</h3>
            <p className="text-xs text-muted-foreground">
              Manage how users can interact with {agentName}
            </p>
          </div>
        </div>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
            <Radio className="size-3.5 text-primary" />
            <span className="text-xs font-medium">{enabledCount} active</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {options.length - enabledCount} inactive
          </span>
        </div>

        <AgentDeployment options={options} onToggle={onDeploymentToggle} disabled={disabled} />
      </div>

      {shareLinkEnabled && shareUrl && (
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Link className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Shareable Link</h3>
              <p className="text-xs text-muted-foreground">Share this link with anyone</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/20 p-3">
            <code className="flex-1 truncate text-xs text-foreground font-mono">{shareUrl}</code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="flex size-7 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Globe className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Quick Setup</h3>
            <p className="text-xs text-muted-foreground">Deploy in seconds</p>
          </div>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate('/widgets')}
            className="w-full rounded-lg border border-border/60 bg-muted/20 p-3 text-left transition-colors hover:bg-muted/40"
          >
            <p className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
              Web Widget
              <ExternalLink className="size-2.5 text-muted-foreground" />
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Add the Convio widget script to your website. The widget will appear as a chat bubble.
            </p>
          </button>
          <button
            type="button"
            onClick={() => navigate('/docs/api-features')}
            className="w-full rounded-lg border border-border/60 bg-muted/20 p-3 text-left transition-colors hover:bg-muted/40"
          >
            <p className="text-xs font-medium mb-1.5 flex items-center gap-1.5">
              API Integration
              <ExternalLink className="size-2.5 text-muted-foreground" />
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Use the REST API endpoint to send messages and receive responses programmatically.
            </p>
          </button>
        </div>
      </div>
    </div>
  )
}
