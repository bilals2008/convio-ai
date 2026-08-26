import {
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Circle,
  Cpu,
  KeyRound,
  MessageSquareText,
  PenLine,
  Server,
  Wrench,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
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
  knowledgeBaseCount?: number
  toolsEnabledCount?: number
  mcpServersCount?: number
  onNavigateToTab: (tab: string) => void
}

function formatDate(value?: string) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

function formatModelName(model: string): string {
  const part = model.includes('/') ? model.split('/').slice(1).join('/') : model
  return part.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').replace(/ free$/i, '').trim()
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring'

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
  knowledgeBaseCount = 0,
  toolsEnabledCount = 0,
  mcpServersCount = 0,
  onNavigateToTab,
}: AgentOverviewProps) {
  const promptPreview = systemPrompt?.trim() || ''

  const readiness = [
    { label: 'Operating instructions', complete: Boolean(promptPreview), tab: 'builder', icon: Wrench },
    { label: 'Knowledge source', complete: hasKnowledgeBase, tab: 'knowledge', icon: BookOpen },
    { label: 'Provider key', complete: hasProviderKey, tab: 'settings', icon: KeyRound },
  ]
  const completedCount = readiness.filter((r) => r.complete).length
  const isReady = completedCount === readiness.length
  const progressPercent = Math.round((completedCount / readiness.length) * 100)

  const configRows = [
    {
      icon: Cpu,
      label: 'Model',
      value: agentModel ? formatModelName(agentModel) : undefined,
      detail: agentModel,
      tab: 'builder',
    },
    {
      icon: BookOpen,
      label: 'Knowledge base',
      value: hasKnowledgeBase
        ? knowledgeBaseCount === 1
          ? 'Connected'
          : `${knowledgeBaseCount} connected`
        : undefined,
      detail: hasKnowledgeBase ? undefined : 'Connect a source',
      tab: 'knowledge',
    },
    {
      icon: Wrench,
      label: 'Tools',
      value: toolsEnabledCount > 0 ? `${toolsEnabledCount} enabled` : undefined,
      detail: toolsEnabledCount === 0 ? 'None enabled' : undefined,
      tab: 'builder',
    },
    {
      icon: Server,
      label: 'MCP servers',
      value: mcpServersCount > 0 ? `${mcpServersCount} connected` : undefined,
      detail: mcpServersCount === 0 ? 'None connected' : undefined,
      tab: 'builder',
    },
    {
      icon: KeyRound,
      label: 'Provider key',
      value: hasProviderKey ? 'Connected' : undefined,
      detail: hasProviderKey ? undefined : 'Not configured',
      tab: 'settings',
    },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* Identity */}
      <Card>
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <Avatar className="size-14 border border-border/60">
                {agentAvatar ? <AvatarImage src={agentAvatar} alt={agentName || 'Agent avatar'} /> : null}
                <AvatarFallback className="rounded-full bg-primary/10 text-primary">
                  <Bot className="size-6" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-semibold tracking-tight text-foreground">
                    {agentName || 'Your agent'}
                  </h2>
                  <Badge variant={isReady ? 'active' : 'draft'}>
                    <span className={cn('size-1.5 rounded-full', isReady ? 'bg-success' : 'bg-warning')} />
                    {isReady ? 'Live' : 'Draft'}
                  </Badge>
                </div>
                {agentDescription ? (
                  <p className="line-clamp-2 max-w-xl text-sm leading-6 text-muted-foreground">{agentDescription}</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => onNavigateToTab('builder')}
                    className={cn(
                      'w-fit text-left text-sm text-muted-foreground underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline',
                      focusRing,
                      'rounded'
                    )}
                  >
                    No description yet — add one so your team knows this agent's role.
                  </button>
                )}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                  {agentModel ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/50 px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                      <Cpu className="size-3 text-muted-foreground" />
                      {agentModel}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onNavigateToTab('builder')}
                      className={cn(
                        'rounded font-medium text-warning underline-offset-4 transition-colors duration-150 hover:underline',
                        focusRing
                      )}
                    >
                      Select a model
                    </button>
                  )}
                  <span>Created {formatDate(agentCreatedAt)}</span>
                  <span aria-hidden="true">·</span>
                  <span>Updated {formatDate(agentUpdatedAt)}</span>
                </div>
              </div>
            </div>
            <Button onClick={() => onNavigateToTab('test-chat')} className="shrink-0 max-sm:w-full">
              <MessageSquareText className="size-4" /> Test agent
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Setup progress */}
        <Card>
          <CardHeader>
            <CardTitle>Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={progressPercent} aria-label={`Setup ${completedCount} of ${readiness.length} complete`}>
              <span className="w-full text-xs text-muted-foreground tabular-nums">
                {completedCount} of {readiness.length} complete
              </span>
            </Progress>
            <div className="space-y-2">
              {readiness.map(({ label, complete, tab, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onNavigateToTab(tab)}
                  className={cn(
                    'group flex min-h-10 w-full items-center gap-3 rounded-lg border border-border/60 bg-background px-3 py-2 text-left transition-colors duration-150 hover:border-border hover:bg-muted/40',
                    focusRing
                  )}
                >
                  {complete ? (
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                  ) : (
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{label}</span>
                  <span
                    className={cn(
                      'shrink-0 text-xs font-medium',
                      complete ? 'text-success' : 'text-muted-foreground'
                    )}
                  >
                    {complete ? 'Ready' : 'Set up'}
                    {!complete && (
                      <ChevronRight className="ml-0.5 inline size-3 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none" />
                    )}
                  </span>
                </button>
              ))}
            </div>
            {isReady && (
              <p className="flex items-center gap-2 text-xs text-success">
                <Circle className="size-1.5 fill-current" />
                All set — this agent is ready to go live.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Configuration summary */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {configRows.map(({ icon: Icon, label, value, detail, tab }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onNavigateToTab(tab)}
                  aria-label={`${value || detail || 'Not set'} — edit ${label.toLowerCase()}`}
                  className={cn(
                    'group flex min-h-11 w-full items-center gap-3 px-5 text-left transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl hover:bg-muted/40',
                    focusRing
                  )}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{label}</span>
                  <span
                    className={cn(
                      'max-w-[45%] truncate text-xs',
                      value ? 'text-muted-foreground' : 'font-medium text-warning'
                    )}
                  >
                    {value || detail}
                  </span>
                  <ChevronRight
                    className={cn(
                      'size-4 shrink-0 text-muted-foreground/40 transition-all duration-150',
                      'group-hover:translate-x-0.5 group-hover:text-muted-foreground motion-reduce:transition-none',
                      !value && 'text-warning/60 group-hover:text-warning'
                    )}
                  />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operating instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Operating instructions</CardTitle>
          <CardDescription>The core guidance sent with every conversation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {promptPreview ? (
            <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
              <pre className="line-clamp-6 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-muted-foreground">
                {promptPreview}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No instructions yet —{' '}
              <button
                type="button"
                onClick={() => onNavigateToTab('builder')}
                className={cn('rounded font-medium text-primary underline-offset-4 transition-colors duration-150 hover:underline', focusRing)}
              >
                write your first prompt
              </button>{' '}
              to shape how this agent responds.
            </p>
          )}
          <Button variant="outline" size="sm" onClick={() => onNavigateToTab('builder')} className="min-h-9">
            <PenLine className="size-4" /> {promptPreview ? 'Edit instructions' : 'Write instructions'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
