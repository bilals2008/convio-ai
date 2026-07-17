import { Bot, BookOpen, CheckCircle2, Clock3, KeyRound, MessageSquareText, Settings2, Wrench, Cpu, Calendar, RefreshCw, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

export function AgentOverview({
  agentName,
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
  const readiness = [
    { label: 'Instructions', complete: Boolean(systemPrompt?.trim()), tab: 'builder', icon: Settings2 as LucideIcon },
    { label: 'Knowledge source', complete: hasKnowledgeBase, tab: 'knowledge', icon: BookOpen },
    { label: 'Provider key', complete: hasProviderKey, tab: 'settings', icon: KeyRound },
  ]

  const stats = [
    { icon: Cpu, label: 'Model', value: agentModel || 'Not selected', color: 'bg-primary/10 text-primary' as const },
    { icon: BookOpen, label: 'Knowledge', value: hasKnowledgeBase ? 'Connected' : 'Not connected', color: hasKnowledgeBase ? ('bg-emerald-500/10 text-emerald-500' as const) : ('bg-muted text-muted-foreground' as const) },
    { icon: Calendar, label: 'Created', value: formatDate(agentCreatedAt), color: 'bg-info/10 text-info' as const },
    { icon: RefreshCw, label: 'Updated', value: formatDate(agentUpdatedAt), color: 'bg-warning/10 text-warning' as const },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Hero */}
      <section className="rounded-xl border border-border/60 bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Bot className="size-4" /></span>
              <Badge variant="secondary" className="font-medium">Agent overview</Badge>
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">{agentName || 'Your agent'}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{agentDescription || 'Add a description so your team understands this agent\'s role.'}</p>
            </div>
          </div>
          <Button onClick={() => onNavigateToTab('test-chat')} className="shrink-0">
            <MessageSquareText className="size-4" /> Test agent
          </Button>
        </div>
      </section>

      {/* Dashboard-style KPI cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="group flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 transition-all duration-200 hover:border-border hover:shadow-sm"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{s.label}</span>
              <span className="text-sm font-semibold leading-none tracking-tight text-foreground">{s.value}</span>
            </div>
            <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105', s.color)}>
              <s.icon className="size-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base">Operating instructions</CardTitle>
            <CardDescription>The core guidance sent with every conversation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{promptPreview}</p>
            <Button variant="outline" size="sm" onClick={() => onNavigateToTab('builder')}>
              <Settings2 className="size-4" /> Edit instructions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <CardTitle className="text-base">Readiness</CardTitle>
            <CardDescription>Complete these steps to get better answers.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border pt-2">
            {readiness.map(({ label, complete, tab, icon: Icon }) => (
              <button key={label} type="button" onClick={() => onNavigateToTab(tab)} className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:text-foreground">
                <span className={complete ? 'text-success' : 'text-muted-foreground'}>{complete ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}</span>
                <span className="flex-1 text-sm font-medium">{label}</span>
                <span className="text-xs text-muted-foreground">{complete ? 'Ready' : 'Set up'}</span>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Clock3 className="size-4" /></span>
            <div><p className="text-sm font-medium">Ready to validate the experience?</p><p className="text-sm text-muted-foreground">Run a live conversation with this agent's current configuration.</p></div>
          </div>
          <Button variant="outline" onClick={() => onNavigateToTab('test-chat')}><Wrench className="size-4" /> Open test chat</Button>
        </CardContent>
      </Card>
    </div>
  )
}
