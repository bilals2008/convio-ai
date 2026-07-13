import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Brain, Clock, Pencil, Trash2, MoreVertical, AlertCircle } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { SearchInput } from '@/components/shared/search-input'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/lib/toast'
import { AgentDeleteDialog } from '@/components/agents/agent-delete-dialog'
import { ProviderLogo } from '@/components/agents/provider-logos'
import { agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'

interface Agent {
  id: string
  name: string
  description?: string
  avatar?: string
  model: string
  systemPrompt: string
  temperature: number
  status: string
  createdAt: string
  updatedAt: string
}

const STATUS_META: Record<string, { label: string; className: string; dot: string }> = {
  active: { label: 'Active', className: 'border-success/20 bg-success/10 text-success', dot: 'bg-success' },
  draft: { label: 'Draft', className: 'border-warning/20 bg-warning/10 text-warning', dot: 'bg-warning' },
  paused: { label: 'Paused', className: 'border-warning/20 bg-warning/10 text-warning', dot: 'bg-warning' },
  archived: { label: 'Archived', className: 'border-border bg-muted/40 text-muted-foreground', dot: 'bg-muted-foreground' },
}

function statusMeta(status: string) {
  return (
    STATUS_META[status] ?? {
      label: status.charAt(0).toUpperCase() + status.slice(1),
      className: 'border-border bg-muted/40 text-muted-foreground',
      dot: 'bg-muted-foreground',
    }
  )
}

function formatModelName(model: string): string {
  const part = model.includes('/') ? model.split('/').slice(1).join('/') : model
  return part.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim()
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta(status)
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
        meta.className
      )}
    >
      <span className={cn('size-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  )
}

function ModelChip({ model }: { model: string }) {
  const provider = model.split('/')[0] || 'other'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
      <ProviderLogo provider={provider} className="size-3.5 rounded-[3px]" />
      <span className="max-w-[180px] truncate">{formatModelName(model)}</span>
    </span>
  )
}

function AgentCard({
  agent,
  onOpen,
  onEdit,
  onDelete,
}: {
  agent: Agent
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className="group [--card-spacing:0px] cursor-pointer rounded-xl border border-border bg-card p-0 outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <CardContent className="flex h-full flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <Avatar className="size-11 rounded-xl">
            {agent.avatar ? (
              <AvatarImage src={agent.avatar} alt={agent.name} className="object-cover" />
            ) : null}
            <AvatarFallback className="rounded-xl bg-primary/10 text-primary">
              <Brain className="size-5" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-foreground">{agent.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {agent.description || 'No description'}
            </p>
          </div>
          <StatusBadge status={agent.status} />
        </div>

        <div className="flex items-center gap-1.5">
          <ModelChip model={agent.model} />
        </div>

        <p className="line-clamp-2 text-[11px] leading-relaxed text-muted-foreground/80">
          {agent.systemPrompt || 'No system prompt configured.'}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            {formatDate(agent.updatedAt || agent.createdAt)}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "text-muted-foreground hover:text-foreground")}
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit() }}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => { e.stopPropagation(); onDelete() }}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

function AgentCardSkeleton() {
  return (
    <Card className="[--card-spacing:0px] rounded-xl border border-border p-0">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-11 rounded-xl" />
          <div className="flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-4 w-14 rounded-full" />
        </div>
        <Skeleton className="h-5 w-32 rounded-md" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="size-7 rounded-md" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function AgentsListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId, isLoading: orgLoading } = useOrg()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modelFilter, setModelFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [deleteAgent, setDeleteAgent] = useState<Agent | null>(null)

  const { data: agentsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['agents', orgId],
    queryFn: async () => {
      const res = await agentsApi.list(orgId!)
      return (res.data.data || []) as Agent[]
    },
    enabled: !!orgId,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => agentsApi.delete(id),
    onSuccess: () => {
      toast.success('Agent deleted')
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      setDeleteAgent(null)
    },
    onError: () => {
      toast.error('Failed to delete agent')
    },
  })

  const agents = useMemo(() => agentsData ?? [], [agentsData])

  const statusOptions = useMemo(
    () => ['all', ...Array.from(new Set(agents.map((a) => a.status).filter(Boolean)))],
    [agents]
  )
  const modelOptions = useMemo(
    () => ['all', ...Array.from(new Set(agents.map((a) => a.model)))],
    [agents]
  )

  const displayAgents = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = agents.filter((a) => {
      if (q) {
        const hay = `${a.name} ${a.description ?? ''} ${a.model}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (modelFilter !== 'all' && a.model !== modelFilter) return false
      return true
    })

    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'oldest') {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      }
      return (
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
      )
    })

    return list
  }, [agents, search, statusFilter, modelFilter, sortBy])

  const hasActiveFilters =
    !!search.trim() || statusFilter !== 'all' || modelFilter !== 'all'

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setModelFilter('all')
  }

  const loading = orgLoading || isLoading

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="size-4 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Create, manage, and deploy your AI agents.
          </p>
        </div>
        <Button onClick={() => navigate('/agents/new')} className="shrink-0">
          <Plus className="size-4" />
          Create Agent
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search agents by name, model, or description..."
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {statusOptions
                .filter((s) => s !== 'all')
                .map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All models</SelectItem>
              {modelOptions
                .filter((m) => m !== 'all')
                .map((m) => (
                  <SelectItem key={m} value={m}>
                    {formatModelName(m)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently updated</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="size-6 text-destructive" />
          </div>
          <p className="text-sm font-medium">Failed to load agents</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Something went wrong while fetching your agents.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {/* Loading state */}
      {!isError && loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 8 }, (_, i) => (
            <AgentCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty: no agents at all */}
      {!loading && !isError && agents.length === 0 && (
        <EmptyState
          icon={Brain}
          title="No agents yet"
          description="Create your first AI agent to get started."
          action={{ label: 'Create Agent', onClick: () => navigate('/agents/new') }}
        />
      )}

      {/* Empty: filters match nothing */}
      {!loading && !isError && agents.length > 0 && displayAgents.length === 0 && (
        <EmptyState
          icon={Brain}
          title="No agents match your filters"
          description="Try a different search term or clear the filters."
          action={{ label: 'Clear filters', onClick: clearFilters }}
        />
      )}

      {/* List */}
      {!loading && !isError && displayAgents.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {displayAgents.length} agent{displayAgents.length !== 1 ? 's' : ''}
              {hasActiveFilters ? ' found' : ''}
            </p>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onOpen={() => navigate(`/agents/${agent.id}/edit`)}
                onEdit={() => navigate(`/agents/${agent.id}/edit`)}
                onDelete={() => setDeleteAgent(agent)}
              />
            ))}
          </div>
        </>
      )}

      {deleteAgent && (
        <AgentDeleteDialog
          open={!!deleteAgent}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteAgent(null)
            }
          }}
          agentName={deleteAgent.name}
          onConfirm={() => {
            deleteMutation.mutate(deleteAgent.id)
          }}
          isPending={deleteMutation.isPending}
        />
      )}
    </PageContainer>
  )
}
