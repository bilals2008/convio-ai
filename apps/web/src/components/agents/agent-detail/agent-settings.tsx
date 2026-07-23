import { Globe, Link, Code, MessageCircle, Bot, Database, KeyRound, CalendarDays, Settings as SettingsIcon, ExternalLink, Palette, MessageSquareText, Radio, Loader2, Copy, Check } from 'lucide-react'
import { AgentDeployment } from '@/components/agents/agent-deployment'
import { ProviderLogo } from '@/components/agents/provider-logos'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

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
  return part.replace(/[-_]/g, ' ').replace(/ free$/i, '').trim()
}

interface AgentSettingsProps {
  agentModel: string
  hasKnowledgeBase: boolean
  hasProviderKey: boolean
  createdAt: string
  welcomeMessage?: string
  widgetColor: string
  status: string
  shareUrl?: string
  deploymentOptions: Array<{ id: string; enabled: boolean }>
  onDeploymentToggle: (id: string, enabled: boolean) => void
  onSave: (data: { welcomeMessage?: string; widgetColor?: string; status?: string }) => void
  isSaving?: boolean
  disabled?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  inactive: 'text-muted-foreground bg-muted border-border/60',
  draft: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
}

const COLOR_PRESETS = ['#fb923c', '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444', '#22c55e', '#14b8a6', '#f59e0b']

function AgentInfoCard({ agentModel, hasKnowledgeBase, hasProviderKey, createdAt }: { agentModel: string; hasKnowledgeBase: boolean; hasProviderKey: boolean; createdAt: string }) {
  const provider = agentModel.split('/')[0] || 'other'

  const infoRows = [
    { icon: <Database className="size-3.5" />, label: 'Knowledge Base', value: hasKnowledgeBase ? 'Connected' : 'Not connected', color: hasKnowledgeBase ? 'text-emerald-500' : 'text-muted-foreground', bg: hasKnowledgeBase ? 'bg-emerald-500/10' : 'bg-muted' },
    { icon: <KeyRound className="size-3.5" />, label: 'Provider Key', value: hasProviderKey ? 'Configured' : 'Default', color: hasProviderKey ? 'text-emerald-500' : 'text-muted-foreground', bg: hasProviderKey ? 'bg-emerald-500/10' : 'bg-muted' },
    { icon: <CalendarDays className="size-3.5" />, label: 'Created', value: new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), color: 'text-foreground', bg: 'bg-info/10' },
  ]

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Bot className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Agent</h3>
          <p className="text-xs text-muted-foreground">Core configuration</p>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5">
        <ProviderLogo provider={provider} className="size-5 rounded-[3px]" />
        <div>
          <p className="text-xs font-medium">{formatModelName(agentModel)}</p>
          <p className="text-[10px] text-muted-foreground">{provider}</p>
        </div>
      </div>

      <div className="divide-y divide-border/60">
        {infoRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between py-2.5">
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn('flex size-6 items-center justify-center rounded-md', row.bg, row.color)}>{row.icon}</span>
              {row.label}
            </span>
            <span className={cn('text-xs font-medium', row.color)}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WelcomeMessageSection({ value, onChange, isSaving }: { value: string; onChange: (v: string) => void; isSaving?: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquareText className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Welcome Message</h3>
          <p className="text-xs text-muted-foreground">First message users see when starting a chat</p>
        </div>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Hi! How can I help you today?"
        className="min-h-[80px] resize-none text-sm"
        disabled={isSaving}
      />
    </div>
  )
}

function WidgetColorSection({ value, onChange, isSaving }: { value: string; onChange: (v: string) => void; isSaving?: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Palette className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Widget Color</h3>
          <p className="text-xs text-muted-foreground">Accent color for the chat widget</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onChange(color)}
              className={cn(
                'size-7 rounded-full border-2 transition-all',
                value === color ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
              )}
              style={{ backgroundColor: color }}
              disabled={isSaving}
            />
          ))}
        </div>
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="size-9 cursor-pointer rounded-lg border border-border/60 bg-transparent p-0.5"
            disabled={isSaving}
          />
        </div>
      </div>
    </div>
  )
}

function StatusSection({ value, onSave, isSaving }: { value: string; onSave: (status: string) => void; isSaving?: boolean }) {
  const statuses = [
    { id: 'active', label: 'Active', description: 'Agent accepts conversations' },
    { id: 'inactive', label: 'Inactive', description: 'Agent is paused' },
    { id: 'draft', label: 'Draft', description: 'Still in development' },
  ]

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Radio className="size-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold">Agent Status</h3>
          <p className="text-xs text-muted-foreground">Control whether this agent is live</p>
        </div>
      </div>
      <div className="flex gap-2">
        {statuses.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSave(s.id)}
            disabled={isSaving || s.id === value}
            className={cn(
              'flex-1 rounded-lg border px-3 py-2 text-left transition-all',
              s.id === value
                ? STATUS_COLORS[s.id] + ' ring-1 ring-foreground/10'
                : 'border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            )}
          >
            <p className="text-xs font-semibold capitalize">{s.label}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{s.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

export function AgentSettings({
  agentModel,
  hasKnowledgeBase,
  hasProviderKey,
  createdAt,
  welcomeMessage = '',
  widgetColor = '#fb923c',
  status = 'draft',
  shareUrl,
  deploymentOptions,
  onDeploymentToggle,
  onSave,
  isSaving,
  disabled,
}: AgentSettingsProps) {
  const [draftWelcomeMessage, setDraftWelcomeMessage] = useState(welcomeMessage)
  const [draftWidgetColor, setDraftWidgetColor] = useState(widgetColor)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setDraftWelcomeMessage(welcomeMessage)
    setDraftWidgetColor(widgetColor)
  }, [welcomeMessage, widgetColor])

  const hasChanges = draftWelcomeMessage !== welcomeMessage || draftWidgetColor !== widgetColor

  const shareLinkEnabled = deploymentOptions.find((o) => o.id === 'shareable-link')?.enabled ?? false

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
      enabled: deploymentOptions.find((o) => o.id === 'whatsapp')?.enabled ?? true,
    },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
        <AgentInfoCard
          agentModel={agentModel}
          hasKnowledgeBase={hasKnowledgeBase}
          hasProviderKey={hasProviderKey}
          createdAt={createdAt}
        />

        <div className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Globe className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Channels</h3>
                <p className="text-xs text-muted-foreground">Where users can reach this agent</p>
              </div>
            </div>
            <AgentDeployment options={options} onToggle={onDeploymentToggle} disabled={disabled} />

            {shareLinkEnabled && shareUrl && (
              <div className="mt-3 rounded-lg border border-border/60 bg-muted/20 p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <Link className="size-3 text-muted-foreground" />
                  <span className="text-[11px] font-medium text-muted-foreground">Shareable URL</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <code className="flex-1 truncate rounded bg-background px-2 py-1.5 text-xs text-foreground">{shareUrl}</code>
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

            <a
              href="/settings/deployments"
              className="mt-3 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors px-1"
            >
              <SettingsIcon className="size-3" />
              Manage deployments in Settings
              <ExternalLink className="size-2.5" />
            </a>
          </div>

          <StatusSection value={status} onSave={(s) => onSave({ status: s })} isSaving={isSaving} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <WelcomeMessageSection value={draftWelcomeMessage} onChange={setDraftWelcomeMessage} isSaving={isSaving} />
        <WidgetColorSection value={draftWidgetColor} onChange={setDraftWidgetColor} isSaving={isSaving} />
      </div>

      {hasChanges && (
        <div className="sticky bottom-4 flex items-center justify-between rounded-xl border border-border/60 bg-card p-4 shadow-lg">
          <p className="text-xs text-muted-foreground">You have unsaved changes</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setDraftWelcomeMessage(welcomeMessage)
                setDraftWidgetColor(widgetColor)
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onSave({ welcomeMessage: draftWelcomeMessage, widgetColor: draftWidgetColor })}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
              Save changes
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
