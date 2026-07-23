import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { LayoutDashboard, Plus, Rocket, Globe2, Clock, ArrowDownAZ, ArrowUpAZ, SlidersHorizontal, AlertCircle, Archive, CheckSquare, Square } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { SearchInput } from '@/components/shared/search-input'
import { BulkActionBar } from '@/components/shared/bulk-action-bar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { WidgetCard, WidgetCardSkeleton } from '@/components/widgets/widget-card'
import { agents as agentsApi, widgets as widgetsApi } from '@/lib/api'
import { useWidgets, type WidgetSummary } from '@/lib/hooks/use-widgets'
import { useOrg } from '@/lib/org-context'
import { useBulkSelection } from '@/lib/hooks/use-bulk-selection'

const createWidgetSchema = z.object({
  name: z.string().trim().min(1, 'Widget name is required').max(100),
  agentId: z.string().uuid('Select an agent'),
})
type CreateWidgetValues = z.infer<typeof createWidgetSchema>

type FilterStatus = 'all' | 'active' | 'paused' | 'archived'
type SortOption = 'updated' | 'newest' | 'oldest' | 'domains'

export default function WidgetsListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId, isLoading: orgLoading } = useOrg()
  const { widgets = [], isLoading, isError, refetch } = useWidgets(orgId)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [sort, setSort] = useState<SortOption>('updated')
  const [archiveTarget, setArchiveTarget] = useState<WidgetSummary | null>(null)
  const [bulkArchiveOpen, setBulkArchiveOpen] = useState(false)

  const form = useForm<CreateWidgetValues>({
    resolver: zodResolver(createWidgetSchema),
    defaultValues: { name: '', agentId: '' },
  })

  const { data: agents = [] } = useQuery({
    queryKey: ['agents-for-widgets', orgId],
    queryFn: async () => (await agentsApi.list(orgId!)).data.data as Array<{ id: string; name: string }>,
    enabled: Boolean(orgId),
    staleTime: 5 * 60 * 1000,
  })

  const createWidget = useMutation({
    mutationFn: (values: CreateWidgetValues) => widgetsApi.create(orgId!, values),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['widgets', orgId] })
      setCreateOpen(false)
      form.reset()
      navigate(`/widgets/${response.data.data.id}`)
    },
    onError: (error: Error) => toast.error(error.message || 'Could not create widget'),
  })

  const archiveWidget = useMutation({
    mutationFn: (id: string) => widgetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets', orgId] })
      toast.success('Widget archived')
      setArchiveTarget(null)
    },
    onError: (error: Error) => toast.error(error.message || 'Could not archive widget'),
  })

  const copyEmbed = async (widget: WidgetSummary) => {
    const response = await widgetsApi.getEmbed(widget.id)
    await navigator.clipboard.writeText(response.data.data.snippet)
    toast.success('Embed code copied')
  }

  const filtered = useMemo(() => {
    let result = widgets

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.agent.name.toLowerCase().includes(q),
      )
    }

    if (filter !== 'all') {
      result = result.filter((w) => w.status === filter)
    }

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'domains':
          return b.allowedDomains.length - a.allowedDomains.length
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

    return result
  }, [widgets, search, filter, sort])

  const bulk = useBulkSelection(filtered)

  const bulkArchiveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => widgetsApi.delete(id)))
    },
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} widget${ids.length !== 1 ? 's' : ''} archived`)
      queryClient.invalidateQueries({ queryKey: ['widgets', orgId] })
      bulk.exitSelectionMode()
      setBulkArchiveOpen(false)
    },
    onError: () => {
      toast.error('Failed to archive some widgets')
    },
  })

  const hasActiveFilters = !!search.trim() || filter !== 'all' || sort !== 'updated'
  const loading = orgLoading || isLoading

  const clearFilters = () => {
    setSearch('')
    setFilter('all')
    setSort('updated')
  }

  return (
    <PageContainer className="space-y-4 [&>:last-child]:mb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <LayoutDashboard className="size-4 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Website widgets</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Create, test, and publish a chat experience without changing your agent.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {bulk.selectionMode ? (
            <BulkActionBar
              onExitSelectionMode={bulk.exitSelectionMode}
              action={
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={bulk.selectedCount === 0}
                  onClick={() => setBulkArchiveOpen(true)}
                >
                  <Archive className="size-4" />
                  Archive {bulk.selectedCount > 0 ? `(${bulk.selectedCount})` : ''}
                </Button>
              }
            />
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={bulk.enterSelectionMode}>
                <CheckSquare className="size-4" />
                Select
              </Button>
              <Button onClick={() => setCreateOpen(true)} className="shrink-0">
                <Plus className="size-4" />
                Create Widget
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Toolbar */}
      {widgets.length > 0 && (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search widgets by name or agent..."
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={filter} onValueChange={(v) => setFilter((v ?? 'all') as FilterStatus)}>
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">Live</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v) => setSort((v ?? 'updated') as SortOption)}>
              <SelectTrigger className="h-9 w-[180px]">
                <SlidersHorizontal className="size-3.5" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">
                  <Clock className="size-3.5" />
                  Recently updated
                </SelectItem>
                <SelectItem value="newest">
                  <ArrowDownAZ className="size-3.5" />
                  Newest
                </SelectItem>
                <SelectItem value="oldest">
                  <ArrowUpAZ className="size-3.5" />
                  Oldest
                </SelectItem>
                <SelectItem value="domains">
                  <Globe2 className="size-3.5" />
                  Most domains
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="size-6 text-destructive" />
          </div>
          <p className="text-sm font-medium">Failed to load widgets</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Something went wrong while fetching your widgets.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {/* Loading state */}
      {!isError && loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <WidgetCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty: no widgets at all */}
      {!loading && !isError && widgets.length === 0 && (
        <EmptyState
          icon={LayoutDashboard}
          title="No widgets yet"
          description="Widgets let you embed your AI assistant on any website. Choose an agent, customize the experience, then publish one installation snippet."
          action={{ label: 'Create Widget', onClick: () => setCreateOpen(true) }}
        />
      )}

      {/* Empty: filters match nothing */}
      {!loading && !isError && widgets.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon={LayoutDashboard}
          title="No widgets match your filters"
          description="Try a different search term or clear the filters."
          action={{ label: 'Clear filters', onClick: clearFilters }}
        />
      )}

      {/* List */}
      {!loading && !isError && filtered.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filtered.length} widget{filtered.length !== 1 ? 's' : ''}
              {hasActiveFilters ? ' found' : ''}
            </p>
            {bulk.selectionMode ? (
              <button
                type="button"
                onClick={bulk.toggleSelectAll}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {bulk.isAllSelected ? (
                  <CheckSquare className="size-4 text-primary" />
                ) : (
                  <Square className="size-4" />
                )}
                {bulk.isAllSelected ? 'Deselect all' : 'Select all'}
              </button>
            ) : hasActiveFilters ? (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((widget) => (
              <WidgetCard
                key={widget.id}
                widget={widget}
                onCopyEmbed={copyEmbed}
                onArchive={(item) => setArchiveTarget(item)}
                selectionMode={bulk.selectionMode}
                isSelected={bulk.isSelected(widget.id)}
                onToggleSelect={() => bulk.toggleSelect(widget.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* Bulk archive confirmation */}
      <AlertDialog open={bulkArchiveOpen} onOpenChange={setBulkArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {bulk.selectedCount} widget{bulk.selectedCount !== 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              {bulk.selectedCount} widget{bulk.selectedCount !== 1 ? 's' : ''} will be archived. You can restore them later from the Archived filter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkArchiveMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={bulkArchiveMutation.isPending}
              onClick={() => bulkArchiveMutation.mutate(Array.from(bulk.selectedIds))}
            >
              {bulkArchiveMutation.isPending ? 'Archiving...' : `Archive ${bulk.selectedCount} widget${bulk.selectedCount !== 1 ? 's' : ''}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive confirmation (single) */}
      <AlertDialog open={!!archiveTarget} onOpenChange={(open) => !open && setArchiveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive widget</AlertDialogTitle>
            <AlertDialogDescription>
              {archiveTarget
                ? `"${archiveTarget.name}" will be archived. You can restore it later from the Archived filter.`
                : 'This widget will be archived.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveWidget.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={archiveWidget.isPending}
              onClick={() => archiveTarget && archiveWidget.mutate(archiveTarget.id)}
            >
              {archiveWidget.isPending ? 'Archiving...' : 'Archive'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <form onSubmit={form.handleSubmit((values) => createWidget.mutate(values))}>
            <DialogHeader>
              <DialogTitle>Create a widget</DialogTitle>
              <DialogDescription>
                Pick a name and the agent this widget will use. You can adjust everything else later.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-5">
              <div className="space-y-2">
                <Label htmlFor="widget-name">Widget name</Label>
                <Input
                  id="widget-name"
                  placeholder="Website assistant"
                  {...form.register('name')}
                  autoFocus
                />
                <p className="text-xs text-destructive">{form.formState.errors.name?.message}</p>
              </div>
              <div className="space-y-2">
                <Label>Agent</Label>
                <Select
                  value={form.watch('agentId')}
                  onValueChange={(value) => form.setValue('agentId', value ?? '', { shouldValidate: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-destructive">{form.formState.errors.agentId?.message}</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createWidget.isPending}>
                {createWidget.isPending ? (
                  'Creating...'
                ) : (
                  <>
                    <Rocket className="size-4" />
                    Continue to setup
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
