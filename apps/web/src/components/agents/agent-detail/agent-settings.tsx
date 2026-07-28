import { Bot, Database, KeyRound, CalendarDays, Radio, Loader2 } from 'lucide-react'
import { ProviderLogo } from '@/components/agents/provider-logos'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

function formatModelName(model: string): string {
  const part = model.includes('/') ? model.split('/').slice(1).join('/') : model
  return part.replace(/[-_]/g, ' ').replace(/ free$/i, '').trim()
}

interface AgentSettingsProps {
  agentModel: string
  hasKnowledgeBase: boolean
  hasProviderKey: boolean
  createdAt: string
  status: string
  onSave: (data: { status?: string }) => void
  isSaving?: boolean
  disabled?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  inactive: 'text-muted-foreground bg-muted border-border/60',
  draft: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
}

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
  status = 'draft',
  onSave,
  isSaving,
}: AgentSettingsProps) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <AgentInfoCard
        agentModel={agentModel}
        hasKnowledgeBase={hasKnowledgeBase}
        hasProviderKey={hasProviderKey}
        createdAt={createdAt}
      />

      <StatusSection value={status} onSave={(s) => onSave({ status: s })} isSaving={isSaving} />
    </div>
  )
}
