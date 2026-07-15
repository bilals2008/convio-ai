import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { LayoutDashboard, Plus, Rocket, Search, SlidersHorizontal, ArrowDownAZ, ArrowUpAZ, Clock, Globe2 } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WidgetCard } from '@/components/widgets/widget-card'
import { agents as agentsApi, widgets as widgetsApi } from '@/lib/api'
import { useWidgets, type WidgetSummary } from '@/lib/hooks/use-widgets'
import { useOrg } from '@/lib/org-context'

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
  const { orgId } = useOrg()
  const { data: widgets = [], isLoading } = useWidgets(orgId)
  const [createOpen, setCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [sort, setSort] = useState<SortOption>('updated')

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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widgets', orgId] }),
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight">Website widgets</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Create, test, and publish a chat experience without changing your agent.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          Create Widget
        </Button>
      </div>

      {/* Toolbar */}
      {widgets.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search */}
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search widgets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Filter */}
            <div className="flex items-center rounded-lg border border-border p-0.5">
              {(['all', 'active', 'paused', 'archived'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    filter === f
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Sort */}
            <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SlidersHorizontal className="size-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">
                  <Clock className="size-3.5" />
                  Recently Updated
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
                  Most Domains
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Loading */}
      {!orgId || isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {[0, 1].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-lg border border-border bg-muted/50" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        /* Widget grid */
        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((widget) => (
            <WidgetCard
              key={widget.id}
              widget={widget}
              onCopyEmbed={copyEmbed}
              onArchive={(item) => archiveWidget.mutate(item.id)}
            />
          ))}
        </div>
      ) : widgets.length === 0 ? (
        /* Empty state: no widgets */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <LayoutDashboard className="size-7 text-primary" />
          </div>
          <h3 className="mt-5 text-lg font-semibold">Create your first widget</h3>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Widgets let you embed your AI assistant on any website. Choose an agent, customize the experience, then publish one installation snippet.
          </p>
          <Button className="mt-6" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" />
            Create Widget
          </Button>
        </div>
      ) : (
        /* Empty state: filtered to nothing */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Search className="size-8 text-muted-foreground/40" />
          <h3 className="mt-4 text-sm font-semibold">No widgets found</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search or filter.
          </p>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <form onSubmit={form.handleSubmit((values) => createWidget.mutate(values))}>
            <DialogHeader>
              <DialogTitle>Create a widget</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-5">
              <div className="space-y-2">
                <Label htmlFor="widget-name">Widget name</Label>
                <Input id="widget-name" placeholder="Website assistant" {...form.register('name')} />
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
                  'Creating…'
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
    </div>
  )
}
