import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from '@/lib/table'
import {
  Plus,
  Brain,
  Clock,
  Pencil,
  Trash2,
  MoreVertical,
  AlertCircle,
  LayoutGrid,
  List,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { SearchInput } from '@/components/shared/search-input'
import { BulkActionBar } from '@/components/shared/bulk-action-bar'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/lib/toast'
import { AgentDeleteDialog } from '@/components/agents/agent-delete-dialog'
import { ProviderLogo } from '@/components/agents/provider-logos'
import { agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { useBulkSelection } from '@/lib/hooks/use-bulk-selection'
import { cn, formatRelativeTime } from '@/lib/utils'

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

const STATUS_META: Record<string, { label: string; variant: 'active' | 'pending' | 'canceled' | 'archived' }> = {
  active: { label: 'Active', variant: 'active' },
  draft: { label: 'Draft', variant: 'pending' },
  paused: { label: 'Paused', variant: 'pending' },
  archived: { label: 'Archived', variant: 'archived' },
}

function statusVariant(status: string) {
  return STATUS_META[status]?.variant ?? 'archived'
}

function formatModelName(model: string): string {
  const part = model.includes('/') ? model.split('/').slice(1).join('/') : model
  return part.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').replace(/ free$/i, '').trim()
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

function AgentCard({
  agent,
  onOpen,
  onEdit,
  onDelete,
  isSelected,
  onToggleSelect,
  showCheckbox,
}: {
  agent: Agent
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
  isSelected: boolean
  onToggleSelect: () => void
  showCheckbox: boolean
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
      className={cn(
        "group relative cursor-pointer p-0 outline-none transition-all duration-200",
        isSelected && "border-primary/60 bg-primary/5 ring-1 ring-primary/20",
        !isSelected && "hover:-translate-y-0.5 hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <CardContent className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-start gap-3">
        {showCheckbox && (
          <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={isSelected}
              onCheckedChange={onToggleSelect}
              className="size-4"
            />
          </div>
        )}
        <Avatar className="size-11 rounded-xl">
          {agent.avatar && <AvatarImage src={agent.avatar} alt={agent.name} />}
          <AvatarFallback className="rounded-xl bg-primary/10 text-sm font-semibold text-primary">
            {agent.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">{agent.name}</h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {agent.description || 'No description'}
          </p>
        </div>
        <span className={cn(
          'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border shrink-0',
          agent.status === 'active' && 'bg-success/10 text-success border-success/30',
          agent.status === 'draft' && 'bg-warning/10 text-warning border-warning/30',
          agent.status === 'paused' && 'bg-warning/10 text-warning border-warning/30',
          agent.status === 'archived' && 'bg-muted text-muted-foreground border-border',
        )}>
          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          <ProviderLogo provider={agent.model.split('/')[0] || 'other'} className="size-3.5 rounded-[3px]" />
          <span className="max-w-[180px] truncate">{formatModelName(agent.model)}</span>
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="size-3" />
          {formatDate(agent.updatedAt || agent.createdAt)}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-0.5 rounded-md bg-muted/30 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          <ArrowUpRight className="size-3" />
          Open
        </span>
          <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
      </div>
      </CardContent>
    </Card>
  )
}

function AgentCardSkeleton() {
  return (
    <Card className="p-0">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-11 rounded-xl" />
          <div className="flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-44" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
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
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')
  const [sorting, setSorting] = useState<SortingState>([])

  const { data: agentsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['agents', orgId],
    queryFn: async () => {
      const res = await agentsApi.list(orgId!)
      return (res.data.data || []) as Agent[]
    },
    enabled: !!orgId,
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
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
    })

    return list
  }, [agents, search, statusFilter, modelFilter, sortBy])

  const bulk = useBulkSelection(displayAgents)

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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => agentsApi.delete(id)))
    },
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} agent${ids.length !== 1 ? 's' : ''} deleted`)
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      bulk.exitSelectionMode()
      setBulkDeleteOpen(false)
    },
    onError: () => {
      toast.error('Failed to delete some agents')
    },
  })

  const hasActiveFilters = !!search.trim() || statusFilter !== 'all' || modelFilter !== 'all'

  const columnHelper = createColumnHelper<Agent>()

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: () => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={bulk.isAllSelected}
            onCheckedChange={() => bulk.toggleSelectAll()}
            className="size-4"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={bulk.isSelected(row.original.id)}
            onCheckedChange={() => bulk.toggleSelect(row.original.id)}
            className="size-4"
          />
        </div>
      ),
      size: 36,
      enableSorting: false,
    }),
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 -ml-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Agent
          {column.getIsSorted() === 'desc' ? (
            <ArrowDown className="size-3.5" />
          ) : column.getIsSorted() === 'asc' ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
          )}
        </button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-8 rounded-lg">
            {row.original.avatar && <AvatarImage src={row.original.avatar} alt={row.original.name} />}
            <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-semibold text-primary">
              {row.original.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate text-foreground">{row.original.name}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[240px]">
              {row.original.description || 'No description'}
            </p>
          </div>
        </div>
      ),
      sortingFn: 'text',
    }),
    columnHelper.accessor('model', {
      header: ({ column }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 -ml-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Model
          {column.getIsSorted() === 'desc' ? (
            <ArrowDown className="size-3.5" />
          ) : column.getIsSorted() === 'asc' ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
          )}
        </button>
      ),
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <ProviderLogo provider={row.original.model.split('/')[0] || 'other'} className="size-3.5 rounded-[3px]" />
          <span className="truncate max-w-[160px]">{formatModelName(row.original.model)}</span>
        </span>
      ),
      sortingFn: 'text',
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ row }) => {
        const s = row.original.status
        return (
          <span className={cn(
            'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border',
            s === 'active' && 'bg-success/10 text-success border-success/30',
            s === 'draft' && 'bg-warning/10 text-warning border-warning/30',
            s === 'paused' && 'bg-warning/10 text-warning border-warning/30',
            s === 'archived' && 'bg-muted text-muted-foreground border-border',
          )}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </span>
        )
      },
    }),
    columnHelper.accessor('updatedAt', {
      header: ({ column }) => (
        <button
          type="button"
          className="inline-flex items-center gap-1 -ml-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Updated
          {column.getIsSorted() === 'desc' ? (
            <ArrowDown className="size-3.5" />
          ) : column.getIsSorted() === 'asc' ? (
            <ArrowUp className="size-3.5" />
          ) : (
            <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
          )}
        </button>
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(row.original.updatedAt || row.original.createdAt)}
        </span>
      ),
      sortingFn: 'datetime',
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => navigate(`/agents/${row.original.id}/edit`)}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteAgent(row.original)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 48,
    }),
  ], [bulk.isAllSelected, bulk.isSelected, bulk.toggleSelect, bulk.toggleSelectAll, navigate])

  const PAGE_SIZE = 15
  const showPagination = displayAgents.length > PAGE_SIZE

  const table = useReactTable({
    data: displayAgents,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    ...(showPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  })

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
          <p className="text-sm text-muted-foreground">Create, manage, and deploy your AI agents.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {bulk.selectedCount > 0 ? (
            <BulkActionBar
              onExitSelectionMode={bulk.exitSelectionMode}
              action={
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setBulkDeleteOpen(true)}
                >
                  <Trash2 className="size-4" />
                  Delete ({bulk.selectedCount})
                </Button>
              }
            />
          ) : (
            <Button onClick={() => navigate('/agents/new')} className="shrink-0">
              <Plus className="size-4" />
              Create Agent
            </Button>
          )}
        </div>
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
              {statusOptions.filter((s) => s !== 'all').map((s) => (
                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All models</SelectItem>
              {modelOptions.filter((m) => m !== 'all').map((m) => (
                <SelectItem key={m} value={m}>{formatModelName(m)}</SelectItem>
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

          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={cn(
                'inline-flex size-7 items-center justify-center rounded-md text-sm transition-colors',
                viewMode === 'grid'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'inline-flex size-7 items-center justify-center rounded-md text-sm transition-colors',
                viewMode === 'table'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Table view"
            >
              <List className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="size-6 text-destructive" />
          </div>
          <p className="text-sm font-medium">Failed to load agents</p>
          <p className="mt-1 text-xs text-muted-foreground">Something went wrong while fetching your agents.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {/* Loading */}
      {!isError && loading && (
        viewMode === 'grid' ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 8 }, (_, i) => (
              <AgentCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Agent</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Model</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Status</TableHead>
                  <TableHead className="text-muted-foreground font-medium h-11 px-4 text-sm">Updated</TableHead>
                  <TableHead className="h-11 w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }, (_, i) => (
                  <TableRow key={i} className={cn('border-b border-border/60', i % 2 === 1 && 'bg-muted/20')}>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-8 rounded-lg" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="h-3 w-16" /></TableCell>
                    <TableCell className="px-4 py-3"><Skeleton className="size-7 rounded-md" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )
      )}

      {/* Empty: no agents */}
      {!loading && !isError && agents.length === 0 && (
        <EmptyState
          icon={Brain}
          title="No agents yet"
          description="Create your first AI agent to get started."
          action={{ label: 'Create Agent', onClick: () => navigate('/agents/new') }}
        />
      )}

      {/* Empty: no matches */}
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
            {bulk.selectedCount > 0 ? (
              <button
                type="button"
                onClick={bulk.toggleSelectAll}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={bulk.isAllSelected}
                    className="size-4"
                  />
                </div>
                {bulk.isAllSelected ? 'Deselect all' : 'Select all'}
              </button>
            ) : hasActiveFilters ? (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
          </div>

          {viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onOpen={() => navigate(`/agents/${agent.id}/edit`)}
                  onEdit={() => navigate(`/agents/${agent.id}/edit`)}
                  onDelete={() => setDeleteAgent(agent)}
                  isSelected={bulk.isSelected(agent.id)}
                  onToggleSelect={() => bulk.toggleSelect(agent.id)}
                  showCheckbox={bulk.selectedCount > 0}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow
                      key={headerGroup.id}
                      className="hover:bg-transparent border-b border-border"
                    >
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={cn(
                            'text-muted-foreground font-medium h-11 px-4 text-sm',
                            header.column.getCanSort() && 'cursor-pointer select-none'
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row, index) => (
                    <TableRow
                      key={row.id}
                      onClick={() => navigate(`/agents/${row.original.id}/edit`)}
                      className={cn(
                        'border-b border-border/60 last:border-0 cursor-pointer transition-colors',
                        index % 2 === 1 && 'bg-muted/20',
                        'hover:bg-muted/40'
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {showPagination && (
                <div className="flex items-center justify-between border-t border-border px-4 py-3">
                  <p className="text-xs text-muted-foreground">
                    Showing {table.getState().pagination.pageIndex * PAGE_SIZE + 1} to{' '}
                    {Math.min(
                      (table.getState().pagination.pageIndex + 1) * PAGE_SIZE,
                      displayAgents.length,
                    )}{' '}
                    of {displayAgents.length} agents
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => table.previousPage()}
                      disabled={!table.getCanPreviousPage()}
                    >
                      <ChevronLeft className="size-4" />
                    </Button>
                    {table.getPageOptions().map((page) => (
                      <Button
                        key={page}
                        variant={table.getState().pagination.pageIndex === page ? 'default' : 'outline'}
                        size="icon-sm"
                        onClick={() => table.setPageIndex(page)}
                      >
                        {page + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => table.nextPage()}
                      disabled={!table.getCanNextPage()}
                    >
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {deleteAgent && (
        <AgentDeleteDialog
          open={!!deleteAgent}
          onOpenChange={(open) => { if (!open) setDeleteAgent(null) }}
          agentName={deleteAgent.name}
          onConfirm={() => deleteMutation.mutate(deleteAgent.id)}
          isPending={deleteMutation.isPending}
        />
      )}

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {bulk.selectedCount} agent{bulk.selectedCount !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {bulk.selectedCount} agent{bulk.selectedCount !== 1 ? 's' : ''} and all their conversations. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={bulkDeleteMutation.isPending}
              onClick={() => bulkDeleteMutation.mutate(Array.from(bulk.selectedIds))}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${bulk.selectedCount} agent${bulk.selectedCount !== 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  )
}
