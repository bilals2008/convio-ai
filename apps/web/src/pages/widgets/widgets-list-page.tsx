import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, MessageCircle } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { SearchInput } from '@/components/shared/search-input'
import { Button } from '@/components/ui/button'
import { WidgetCard, WidgetDeleteDialog, type Widget } from '@/components/widgets/widget-card'
import { widgets as widgetsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

export default function WidgetsListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
  const [search, setSearch] = useState('')
  const [deleteWidget, setDeleteWidget] = useState<Widget | null>(null)

  const { data: widgetsData, isLoading } = useQuery({
    queryKey: ['widgets', orgId],
    queryFn: async () => {
      try {
        const res = await widgetsApi.list(orgId!)
        return (res.data.data || []) as Widget[]
      } catch {
        return [] as Widget[]
      }
    },
    enabled: !!orgId,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => widgetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets'] })
    },
  })

  const widgets = widgetsData || []

  const filteredWidgets = widgets.filter((w) => {
    if (!search) return true
    return (
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.botName?.toLowerCase().includes(search.toLowerCase())
    )
  })

  const loadingSkeletons = Array.from({ length: 3 }, (_, i) => (
    <div key={i} className="rounded-xl border bg-card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  ))

  return (
    <PageContainer>
      <PageHeader
        title="Widgets"
        description="Embeddable chat widgets for your website"
        action={
          <Button onClick={() => navigate('/agents/new')}>
            <Plus className="size-4" />
            Create Widget
          </Button>
        }
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search widgets..."
        className="max-w-sm"
      />

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{loadingSkeletons}</div>
      )}

      {!isLoading && filteredWidgets.length === 0 && (
        <EmptyState
          icon={MessageCircle}
          title="No widgets yet"
          description={
            search
              ? 'No widgets match your search. Try a different query.'
              : 'Create your first widget to embed on your website.'
          }
          action={
            search
              ? { label: 'Clear search', onClick: () => setSearch('') }
              : { label: 'Create Widget', onClick: () => navigate('/agents/new') }
          }
        />
      )}

      {!isLoading && filteredWidgets.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWidgets.map((widget) => (
            <WidgetCard key={widget.id} widget={widget} onDelete={setDeleteWidget} />
          ))}
        </div>
      )}

      {deleteWidget && (
        <WidgetDeleteDialog
          open={!!deleteWidget}
          onOpenChange={(open) => { if (!open) setDeleteWidget(null) }}
          widgetName={deleteWidget.name}
          onConfirm={() => {
            deleteMutation.mutate(deleteWidget.id)
            setDeleteWidget(null)
          }}
        />
      )}
    </PageContainer>
  )
}
