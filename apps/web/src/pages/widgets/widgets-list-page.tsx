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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { widgets as widgetsApi, agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

export default function WidgetsListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
  const [search, setSearch] = useState('')
  const [deleteWidget, setDeleteWidget] = useState<Widget | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [widgetPosition, setWidgetPosition] = useState('bottom-right')
  const [primaryColor, setPrimaryColor] = useState('#fb923c')
  const [greeting, setGreeting] = useState('Hello! How can I help you?')

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

  const { data: agentsData } = useQuery({
    queryKey: ['agents-for-widgets', orgId],
    queryFn: async () => {
      const res = await agentsApi.list(orgId!)
      return (res.data.data || []) as { id: string; name: string }[]
    },
    enabled: !!orgId,
  })

  const enableWidgetMutation = useMutation({
    mutationFn: async () => {
      const res = await agentsApi.update(selectedAgentId, {
        widgetColor: primaryColor,
        welcomeMessage: greeting,
        widgetConfig: { position: widgetPosition, primaryColor, greeting },
        status: 'active',
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets'] })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      setCreateOpen(false)
      setSelectedAgentId('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => widgetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['widgets'] })
    },
  })

  const widgets = widgetsData || []
  const agents = agentsData || []

  const filteredWidgets = widgets.filter((w) => {
    if (!search) return true
    return (
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.agentName?.toLowerCase().includes(search.toLowerCase())
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
          <Button size="lg" onClick={() => setCreateOpen(true)}>
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
              : 'Enable widget mode on an agent to embed it on your website.'
          }
          action={
            search
              ? { label: 'Clear search', onClick: () => setSearch('') }
              : { label: 'Create Widget', onClick: () => setCreateOpen(true) }
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

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Widget</DialogTitle>
            <DialogDescription>
              Enable widget mode on an agent to embed it on your website.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Select Agent</Label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an agent..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(agents) && agents.length > 0 ? (
                    agents.map((a: { id: string; name: string }) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__none" disabled>No agents available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Select value={widgetPosition} onValueChange={setWidgetPosition}>
                <SelectTrigger id="position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Primary Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-12 h-9 p-1"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="greeting">Greeting Message</Label>
              <Input
                id="greeting"
                value={greeting}
                onChange={(e) => setGreeting(e.target.value)}
                placeholder="Hello! How can I help you?"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => enableWidgetMutation.mutate()}
              disabled={!selectedAgentId || enableWidgetMutation.isPending}
            >
              {enableWidgetMutation.isPending ? 'Enabling...' : 'Enable Widget'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
