import { useState, useCallback, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dataManagement as dataManagementApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/shared/loading'
import { Search, X, ChevronRight, Clock, HardDrive } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Trash2,
  AlertTriangle,
  Brain,
  MessageSquare,
  BookOpen,
  FileText,
  Link as LinkIcon,
  Shield,
  BarChart3,
} from 'lucide-react'
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
import { toast } from 'sonner'

const PAGE_SIZE = 10

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

interface SummaryItem {
  label: string
  count: number
}

interface DataSummary {
  items: SummaryItem[]
  total: number
  storageBytes: number
  lastUpdated: string | null
}

type CategoryKey = 'agents' | 'conversations' | 'knowledge-bases' | 'documents' | 'integrations' | 'provider-keys' | 'analytics'

interface CascadeItem {
  label: string
  count: number
}

interface CategoryDef {
  key: CategoryKey
  label: string
  description: string
  icon: typeof Brain
  iconColor: string
  columns: string[]
  renderRow: (item: Record<string, unknown>) => React.ReactNode
  filterOptions?: { value: string; label: string }[]
  searchPlaceholder?: string
  warning?: string
}

const categories: CategoryDef[] = [
  {
    key: 'agents',
    label: 'Agents',
    description: 'AI agents, configs, deployments & analytics',
    icon: Brain,
    iconColor: 'text-violet-500',
    columns: ['Name', 'Model', 'Status', 'Created'],
    searchPlaceholder: 'Search agents...',
    filterOptions: [
      { value: 'active', label: 'Active' },
      { value: 'draft', label: 'Draft' },
    ],
    renderRow: (item) => (
      <>
        <td className="py-2 pr-4 text-sm font-medium">{String(item.name)}</td>
        <td className="py-2 pr-4 text-xs text-muted-foreground font-mono">{String(item.model)}</td>
        <td className="py-2 pr-4">
          <Badge variant={String(item.status) as 'active' | 'draft'} className="h-4 px-1.5 text-[10px] capitalize">{String(item.status)}</Badge>
        </td>
        <td className="py-2 text-xs text-muted-foreground">{new Date(String(item.createdAt)).toLocaleDateString()}</td>
      </>
    ),
    warning: 'Cascading delete: conversations, deployments, analytics',
  },
  {
    key: 'conversations',
    label: 'Conversations',
    description: 'Chat conversations and messages across agents',
    icon: MessageSquare,
    iconColor: 'text-sky-500',
    columns: ['Channel', 'Agent', 'Status', 'Created'],
    searchPlaceholder: 'Search by name or channel...',
    filterOptions: [
      { value: 'active', label: 'Active' },
      { value: 'archived', label: 'Archived' },
    ],
    renderRow: (item) => (
      <>
        <td className="py-2 pr-4 text-sm font-medium capitalize">{String(item.channel)}</td>
        <td className="py-2 pr-4 text-xs text-muted-foreground">{String((item.agent as Record<string, unknown>)?.name ?? '—')}</td>
        <td className="py-2 pr-4">
          <Badge variant={item.status as 'active' | 'archived'} className="h-4 px-1.5 text-[10px] capitalize">{String(item.status)}</Badge>
        </td>
        <td className="py-2 text-xs text-muted-foreground">{new Date(String(item.createdAt)).toLocaleDateString()}</td>
      </>
    ),
  },
  {
    key: 'knowledge-bases',
    label: 'Knowledge Bases',
    description: 'Knowledge bases, documents & embeddings',
    icon: BookOpen,
    iconColor: 'text-emerald-500',
    columns: ['Name', 'Description', 'Docs', 'Created'],
    searchPlaceholder: 'Search knowledge bases...',
    renderRow: (item) => (
      <>
        <td className="py-2 pr-4 text-sm font-medium">{String(item.name)}</td>
        <td className="py-2 pr-4 text-xs text-muted-foreground truncate max-w-[200px]">{String(item.description || '—')}</td>
        <td className="py-2 pr-4 text-xs text-muted-foreground">{String((item._count as Record<string, unknown>)?.documents ?? 0)}</td>
        <td className="py-2 text-xs text-muted-foreground">{new Date(String(item.createdAt)).toLocaleDateString()}</td>
      </>
    ),
    warning: 'Agents referencing these bases will lose their knowledge source',
  },
  {
    key: 'documents',
    label: 'Documents',
    description: 'Uploaded docs & vector embeddings',
    icon: FileText,
    iconColor: 'text-amber-500',
    columns: ['Name', 'Type', 'Status', 'Created'],
    searchPlaceholder: 'Search documents...',
    filterOptions: [
      { value: 'pending', label: 'Pending' },
      { value: 'processed', label: 'Processed' },
      { value: 'failed', label: 'Failed' },
    ],
    renderRow: (item) => (
      <>
        <td className="py-2 pr-4 text-sm font-medium">{String(item.name)}</td>
        <td className="py-2 pr-4 text-xs text-muted-foreground font-mono uppercase">{String(item.type)}</td>
        <td className="py-2 pr-4">
          <Badge variant={item.status as 'pending' | 'processed' | 'failed'} className="h-4 px-1.5 text-[10px] capitalize">{String(item.status)}</Badge>
        </td>
        <td className="py-2 text-xs text-muted-foreground">{new Date(String(item.createdAt)).toLocaleDateString()}</td>
      </>
    ),
  },
  {
    key: 'integrations',
    label: 'Integrations',
    description: 'Channel deployments (WhatsApp, Slack, etc.)',
    icon: LinkIcon,
    iconColor: 'text-pink-500',
    columns: ['Channel', 'Agent', 'Status', 'Created'],
    searchPlaceholder: 'Search by channel...',
    filterOptions: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
    renderRow: (item) => (
      <>
        <td className="py-2 pr-4 text-sm font-medium capitalize">{String(item.channel)}</td>
        <td className="py-2 pr-4 text-xs text-muted-foreground">{String((item.agent as Record<string, unknown>)?.name ?? '—')}</td>
        <td className="py-2 pr-4">
          <Badge variant={item.status as 'active' | 'inactive'} className="h-4 px-1.5 text-[10px] capitalize">{String(item.status)}</Badge>
        </td>
        <td className="py-2 text-xs text-muted-foreground">{new Date(String(item.createdAt)).toLocaleDateString()}</td>
      </>
    ),
  },
  {
    key: 'provider-keys',
    label: 'Provider Keys',
    description: 'BYOK API keys (OpenAI, Anthropic, etc.)',
    icon: Shield,
    iconColor: 'text-rose-500',
    columns: ['Provider', 'Label', 'Key Preview', 'Created'],
    searchPlaceholder: 'Search by provider or label...',
    renderRow: (item) => (
      <>
        <td className="py-2 pr-4 text-sm font-medium capitalize">{String(item.provider)}</td>
        <td className="py-2 pr-4 text-xs text-muted-foreground">{String(item.label || '—')}</td>
        <td className="py-2 pr-4 text-xs font-mono text-muted-foreground">{String(item.keyPreview)}</td>
        <td className="py-2 text-xs text-muted-foreground">{new Date(String(item.createdAt)).toLocaleDateString()}</td>
      </>
    ),
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Analytics data & performance metrics',
    icon: BarChart3,
    iconColor: 'text-cyan-500',
    columns: ['Date', 'Agent', 'Conversations', 'Messages'],
    searchPlaceholder: 'Search analytics...',
    renderRow: (item) => (
      <>
        <td className="py-2 pr-4 text-sm font-medium">{new Date(String(item.date)).toLocaleDateString()}</td>
        <td className="py-2 pr-4 text-xs text-muted-foreground">{String((item.agent as Record<string, unknown>)?.name ?? '—')}</td>
        <td className="py-2 pr-4 text-xs tabular-nums">{String(item.totalConversations)}</td>
        <td className="py-2 text-xs tabular-nums">{String(item.totalMessages)}</td>
      </>
    ),
  },
]

export default function DataManagementPage() {
  const { orgId, org } = useOrg()
  const queryClient = useQueryClient()
  const [deletingCategory, setDeletingCategory] = useState<CategoryKey | null>(null)
  const [viewingCategory, setViewingCategory] = useState<CategoryKey | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [offset, setOffset] = useState(0)
  const [wipeDialogOpen, setWipeDialogOpen] = useState(false)
  const [wipeConfirmText, setWipeConfirmText] = useState('')
  const [wipeError, setWipeError] = useState('')

  const viewingCat = categories.find((c) => c.key === viewingCategory)
  const categoryRef = useRef(viewingCategory)
  const [loadedItems, setLoadedItems] = useState<Record<string, unknown>[]>([])

  const resetDialogState = useCallback(() => {
    setViewingCategory(null)
    setSearch('')
    setStatusFilter('all')
    setOffset(0)
    setLoadedItems([])
  }, [])

  useEffect(() => {
    setOffset(0)
    setLoadedItems([])
  }, [search, statusFilter])

  useEffect(() => {
    if (viewingCategory !== categoryRef.current) {
      setLoadedItems([])
      categoryRef.current = viewingCategory
    }
  }, [viewingCategory])

  const summaryQuery = useQuery({
    queryKey: ['data-summary', orgId],
    queryFn: () => dataManagementApi.summary(orgId!),
    enabled: !!orgId,
  })

  const summary: DataSummary = summaryQuery.data?.data?.data ?? {
    items: [],
    total: 0,
    storageBytes: 0,
    lastUpdated: null,
  }

  const getCategoryCount = (label: string): number =>
    summary.items.find((i) => i.label === label)?.count ?? 0

  const itemsQuery = useQuery({
    queryKey: ['data-items', orgId, viewingCategory, search, statusFilter, offset],
    queryFn: () =>
      dataManagementApi.listCategory(orgId!, viewingCategory!, {
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: PAGE_SIZE,
        offset,
      }),
    enabled: !!orgId && !!viewingCategory,
  })

  useEffect(() => {
    if (itemsQuery.data?.data?.data) {
      if (offset === 0) {
        setLoadedItems(itemsQuery.data.data.data)
      } else {
        setLoadedItems((prev) => [...prev, ...itemsQuery.data.data.data])
      }
    }
  }, [itemsQuery.data, offset])

  const cascadeQuery = useQuery({
    queryKey: ['data-cascade', orgId, deletingCategory],
    queryFn: () => dataManagementApi.cascade(orgId!, deletingCategory!),
    enabled: !!orgId && !!deletingCategory,
  })
  const cascadeItems: CascadeItem[] = cascadeQuery.data?.data?.data ?? []

  const items = loadedItems
  const total: number = itemsQuery.data?.data?.total ?? 0
  const hasMore = offset + PAGE_SIZE < total

  const deleteCategoryMutation = useMutation({
    mutationFn: (category: string) => dataManagementApi.deleteCategory(orgId!, category),
    onSuccess: (_res, category) => {
      toast.success(`${getCategoryLabel(category)} deleted successfully`)
      queryClient.invalidateQueries({ queryKey: ['data-summary', orgId] })
      queryClient.invalidateQueries({ queryKey: ['all-deployments'] })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      resetDialogState()
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete data')
    },
    onSettled: () => setDeletingCategory(null),
  })

  const wipeMutation = useMutation({
    mutationFn: () => dataManagementApi.wipeAll(orgId!),
    onSuccess: () => {
      toast.success('All data has been wiped')
      queryClient.invalidateQueries({ queryKey: ['data-summary', orgId] })
      queryClient.invalidateQueries({ queryKey: ['all-deployments'] })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      queryClient.invalidateQueries({ queryKey: ['provider-keys'] })
      setWipeDialogOpen(false)
      setWipeConfirmText('')
      setWipeError('')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to wipe data')
    },
  })

  const getCategoryLabel = (key: string) =>
    categories.find((c) => c.key === key)?.label || key

  const hasAnyData = summary.total > 0
  const summaryError = summaryQuery.isError

  if (summaryQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Management"
        description="Manage and delete workspace data. These actions are permanent."
      />

      {/* Warning banner */}
      <div className="flex items-start gap-2.5 rounded-lg border border-warning/20 bg-warning/5 px-3.5 py-2.5 text-sm">
        <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
        <p className="text-muted-foreground">
          Deleted data <span className="font-medium text-foreground">cannot be recovered</span>. Please review carefully before proceeding.
        </p>
      </div>

      {summaryError && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-sm">
          <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            Failed to load summary data. <button onClick={() => summaryQuery.refetch()} className="underline text-foreground font-medium">Retry</button>
          </p>
        </div>
      )}

      {/* Summary card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
              <Brain className="size-3.5 text-primary" />
            </div>
            Workspace Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground">{summary.total.toLocaleString()}</span>
              <span className="text-muted-foreground">Total Items</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HardDrive className="size-3.5 text-muted-foreground" />
              <span className="font-semibold text-foreground">{formatBytes(summary.storageBytes)}</span>
              <span className="text-muted-foreground">Storage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              <span className="font-semibold text-foreground">{formatRelativeTime(summary.lastUpdated)}</span>
              <span className="text-muted-foreground">Last Updated</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category list */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">Data Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/50">
            {categories.map((cat) => {
              const count = getCategoryCount(cat.key)
              const Icon = cat.icon
              return (
                <div
                  key={cat.key}
                  className="group flex items-center gap-3 px-1 py-3 transition-colors hover:bg-muted/30 cursor-pointer"
                  onClick={() => { setViewingCategory(cat.key); setSearch(''); setStatusFilter('all'); setOffset(0) }}
                >
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15`}>
                    <Icon className={`size-4 ${cat.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{cat.label}</span>
                      {cat.warning && count > 0 && (
                        <span className="inline-flex items-center rounded-full bg-warning/10 px-1.5 py-0 text-[9px] font-medium text-warning">
                          CASCADE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-semibold tabular-nums text-foreground/80">{count.toLocaleString()}</span>
                      <p className="text-[10px] text-muted-foreground">items</p>
                    </div>
                    <button
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                      disabled={count === 0 || deleteCategoryMutation.isPending}
                      onClick={(e) => { e.stopPropagation(); setDeletingCategory(cat.key) }}
                    >
                      {deleteCategoryMutation.isPending && deletingCategory === cat.key ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </button>
                    <ChevronRight className="size-4 text-muted-foreground/50 transition-colors group-hover:text-muted-foreground" />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-destructive">
            <div className="flex size-7 items-center justify-center rounded-md bg-destructive/10">
              <AlertTriangle className="size-3.5 text-destructive" />
            </div>
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete <strong>all data</strong> in <strong>{org?.name || 'this workspace'}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Delete Entire Workspace</p>
                <p className="text-xs text-muted-foreground">
                  This will remove {summary.total.toLocaleString()} items including agents, conversations,
                  documents, integrations, provider keys, and analytics.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                disabled={!hasAnyData || wipeMutation.isPending}
                onClick={() => setWipeDialogOpen(true)}
                className="shrink-0 gap-1.5"
              >
                <Trash2 className="size-3.5" />
                Delete Workspace
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View items dialog */}
      <Dialog open={!!viewingCategory} onOpenChange={(open) => { if (!open) resetDialogState() }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {viewingCat && <viewingCat.icon className={`size-4 ${viewingCat.iconColor}`} />}
              {viewingCat?.label}
            </DialogTitle>
            <DialogDescription>
              {total} total{search || statusFilter !== 'all' ? ' (filtered)' : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={viewingCat?.searchPlaceholder ?? 'Search...'}
                className="h-8 pl-8 text-xs"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="size-3" />
                </button>
              )}
            </div>
            {viewingCat?.filterOptions && (
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger size="sm" className="h-8 w-auto text-xs">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {viewingCat.filterOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="max-h-[480px] overflow-auto -mx-1">
            {itemsQuery.isLoading && items.length === 0 ? (
              <div className="space-y-2 px-1">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                  {viewingCat && <viewingCat.icon className="size-5 text-muted-foreground" />}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {search || statusFilter !== 'all' ? 'No matching items' : `No ${viewingCat?.label.toLowerCase()} found`}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    {viewingCat?.columns.map((col) => (
                      <th key={col} className="pb-2 pr-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {items.map((item: Record<string, unknown>, i: number) => (
                    <tr key={String(item.id ?? i)} className="text-sm">
                      {viewingCat?.renderRow(item)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5"
                disabled={itemsQuery.isFetching}
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
              >
                {itemsQuery.isFetching && <Loader2 className="size-3 animate-spin" />}
                Load more ({Math.min(offset + PAGE_SIZE, total)} of {total})
              </Button>
            </div>
          )}

          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      {/* Delete category confirmation */}
      <AlertDialog
        open={deletingCategory !== null}
        onOpenChange={(open) => { if (!open) setDeletingCategory(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-destructive" />
              Delete {deletingCategory ? getCategoryLabel(deletingCategory) : ''}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                This will permanently delete <strong>{getCategoryCount(deletingCategory ?? '').toLocaleString()} {deletingCategory ? getCategoryLabel(deletingCategory).toLowerCase() : ''}</strong>.
              </span>
              {cascadeItems.length > 0 && (
                <div className="rounded-md bg-muted/50 p-2.5 space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">This includes</p>
                  {cascadeItems.map((ci) => (
                    <div key={ci.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{ci.label}</span>
                      <span className="font-medium tabular-nums">{ci.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
              {deletingCategory && categories.find((c) => c.key === deletingCategory)?.warning && (
                <span className="flex items-center gap-1 text-warning text-xs font-medium">
                  <AlertTriangle className="size-3 shrink-0" />
                  {categories.find((c) => c.key === deletingCategory)?.warning}
                </span>
              )}
              <span className="block text-xs text-destructive font-medium">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-1.5"
              onClick={() => { if (deletingCategory) deleteCategoryMutation.mutate(deletingCategory) }}
            >
              {deleteCategoryMutation.isPending && deletingCategory && (
                <Loader2 className="size-3 animate-spin" />
              )}
              Delete {deletingCategory ? getCategoryLabel(deletingCategory) : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Wipe all confirmation */}
      <AlertDialog
        open={wipeDialogOpen}
        onOpenChange={(open) => {
          if (!open) { setWipeDialogOpen(false); setWipeConfirmText(''); setWipeError('') }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-destructive" />
              Delete Entire Workspace
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                This will permanently delete <strong>all data</strong> in{' '}
                <strong>{org?.name || 'the workspace'}</strong>.
              </span>
              {summary.total > 0 && (
                <div className="rounded-md bg-muted/50 p-2.5 space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">This includes</p>
                  {summary.items.filter((i) => i.count > 0).map((i) => (
                    <div key={i.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{getCategoryLabel(i.label).toLowerCase()}</span>
                      <span className="font-medium tabular-nums">{i.count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
              <span className="flex items-center gap-1 text-destructive font-medium text-xs">
                <AlertTriangle className="size-3 shrink-0" />
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="wipe-confirm" className="text-xs">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm
            </Label>
            <Input
              id="wipe-confirm"
              value={wipeConfirmText}
              onChange={(e) => { setWipeConfirmText(e.target.value); setWipeError('') }}
              placeholder="DELETE"
              className={wipeError ? 'border-destructive' : ''}
              autoComplete="off"
            />
            {wipeError && <p className="text-xs text-destructive">{wipeError}</p>}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              size="sm"
              disabled={wipeConfirmText !== 'DELETE' || wipeMutation.isPending}
              onClick={() => {
                if (wipeConfirmText !== 'DELETE') { setWipeError('Please type DELETE to confirm'); return }
                wipeMutation.mutate()
              }}
              className="gap-1.5"
            >
              {wipeMutation.isPending && <Loader2 className="size-3 animate-spin" />}
              Delete Workspace
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
