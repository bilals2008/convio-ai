import { Bot, BookOpen, CheckCircle2, Clock3, KeyRound, MessageSquareText, Settings2, Wrench, Cpu, Calendar, RefreshCw, ArrowRight, Sparkles, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AgentOverviewProps {
  agentName?: string
  agentAvatar?: string | null
  agentDescription?: string
  agentModel?: string
  agentCreatedAt?: string
  agentUpdatedAt?: string
  hasProviderKey?: boolean
  hasKnowledgeBase?: boolean
  systemPrompt?: string
  onNavigateToTab: (tab: string) => void
}

function formatDate(value?: string) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

function getInitials(name?: string) {
  if (!name) return 'A'
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
}

export function AgentOverview({
  agentName,
  agentAvatar,
  agentDescription,
  agentModel,
  agentCreatedAt,
  agentUpdatedAt,
  hasProviderKey,
  hasKnowledgeBase,
  systemPrompt,
  onNavigateToTab,
}: AgentOverviewProps) {
  const promptPreview = systemPrompt?.trim() || 'No instructions have been added yet.'
  const hasPrompt = Boolean(systemPrompt?.trim())

  const readiness = [
    { label: 'Instructions', complete: hasPrompt, tab: 'builder', icon: Settings2 as LucideIcon },
    { label: 'Knowledge source', complete: hasKnowledgeBase, tab: 'knowledge', icon: BookOpen },
    { label: 'Provider key', complete: hasProviderKey, tab: 'settings', icon: KeyRound },
  ]

  const completedCount = readiness.filter((r) => r.complete).length
  const readinessPercent = Math.round((completedCount / readiness.length) * 100)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Hero */}
      <section className="rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="shrink-0">
              {agentAvatar ? (
                <img
                  src={agentAvatar}
                  alt={agentName || 'Agent'}
                  className="size-14 rounded-xl object-cover ring-2 ring-border"
                />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 text-primary ring-2 ring-primary/20">
                  <Bot className="size-6" />
                </div>
              )}
            </div>

            {/* Name + description */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  {agentName || 'Your agent'}
                </h2>
                {agentModel && (
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    {agentModel}
                  </Badge>
                )}
              </div>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {agentDescription || 'Add a description so your team understands this agent\'s role.'}
              </p>
            </div>

            {/* CTA */}
            <Button onClick={() => onNavigateToTab('test-chat')} className="shrink-0 gap-1.5">
              <MessageSquareText className="size-3.5" />
              Test agent
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats + Readiness row */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.6fr)]">
        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3.5 py-3 transition-all duration-200 hover:border-border hover:shadow-sm">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Cpu className="size-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Model</span>
              <p className="truncate text-xs font-medium text-foreground">{agentModel || 'Not selected'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3.5 py-3 transition-all duration-200 hover:border-border hover:shadow-sm">
            <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', hasKnowledgeBase ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground')}>
              <BookOpen className="size-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Knowledge</span>
              <p className="truncate text-xs font-medium text-foreground">{hasKnowledgeBase ? 'Connected' : 'Not connected'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3.5 py-3 transition-all duration-200 hover:border-border hover:shadow-sm">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
              <Calendar className="size-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Created</span>
              <p className="truncate text-xs font-medium text-foreground">{formatDate(agentCreatedAt)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3.5 py-3 transition-all duration-200 hover:border-border hover:shadow-sm">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <RefreshCw className="size-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Updated</span>
              <p className="truncate text-xs font-medium text-foreground">{formatDate(agentUpdatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Readiness */}
        <Card>
          <CardHeader className="border-b border-border py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Readiness</CardTitle>
              <Badge variant={readinessPercent === 100 ? 'default' : 'secondary'} className="font-mono text-[10px]">
                {readinessPercent}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Progress bar */}
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${readinessPercent}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-0">
              {readiness.map(({ label, complete, tab, icon: Icon }, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onNavigateToTab(tab)}
                  className={cn(
                    'flex w-full items-center gap-3 py-2.5 text-left transition-colors hover:bg-muted/50 rounded-lg px-2 -mx-2',
                    i < readiness.length - 1 && 'border-b border-border/50'
                  )}
                >
                  <span className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full',
                    complete ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                  )}>
                    {complete ? <CheckCircle2 className="size-3.5" /> : <Icon className="size-3.5" />}
                  </span>
                  <span className="flex-1 text-sm font-medium">{label}</span>
                  <span className={cn('text-xs', complete ? 'text-emerald-500' : 'text-muted-foreground')}>
                    {complete ? 'Ready' : 'Set up'}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Prompt Preview */}
      <Card>
        <CardHeader className="border-b border-border py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="size-3.5 text-muted-foreground" />
              Operating instructions
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => onNavigateToTab('builder')}>
              Edit
              <ArrowRight className="size-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className={cn(
            'rounded-lg border bg-muted/30 px-4 py-3 font-mono text-xs leading-relaxed text-muted-foreground',
            !hasPrompt && 'italic border-dashed'
          )}>
            {promptPreview}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-5 py-4 transition-all duration-200 hover:border-border hover:shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Clock3 className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Ready to validate the experience?</p>
            <p className="text-xs text-muted-foreground">Run a live conversation with this agent's current configuration.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onNavigateToTab('test-chat')}>
          <Wrench className="size-3.5" />
          Open test chat
          <ArrowRight className="size-3" />
        </Button>
      </div>
    </div>
  )
}
