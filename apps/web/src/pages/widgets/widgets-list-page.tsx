import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { MessageCircle, Plus, Rocket } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WidgetCard } from '@/components/widgets/widget-card'
import { agents as agentsApi, widgets as widgetsApi } from '@/lib/api'
import { useWidgets, type WidgetSummary } from '@/lib/hooks/use-widgets'
import { useOrg } from '@/lib/org-context'

const createWidgetSchema = z.object({ name: z.string().trim().min(1, 'Widget name is required').max(100), agentId: z.string().uuid('Select an agent') })
type CreateWidgetValues = z.infer<typeof createWidgetSchema>

export default function WidgetsListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
  const { data: widgets = [], isLoading } = useWidgets(orgId)
  const [createOpen, setCreateOpen] = useState(false)
  const form = useForm<CreateWidgetValues>({ resolver: zodResolver(createWidgetSchema), defaultValues: { name: '', agentId: '' } })
  const { data: agents = [] } = useQuery({ queryKey: ['agents-for-widgets', orgId], queryFn: async () => (await agentsApi.list(orgId!)).data.data as Array<{ id: string; name: string }>, enabled: Boolean(orgId), staleTime: 5 * 60 * 1000 })
  const createWidget = useMutation({ mutationFn: (values: CreateWidgetValues) => widgetsApi.create(orgId!, values), onSuccess: (response) => { queryClient.invalidateQueries({ queryKey: ['widgets', orgId] }); setCreateOpen(false); form.reset(); navigate(`/widgets/${response.data.data.id}`) }, onError: (error: Error) => toast.error(error.message || 'Could not create widget') })
  const updateWidget = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => widgetsApi.update(id, { status }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widgets', orgId] }), onError: (error: Error) => toast.error(error.message) })
  const archiveWidget = useMutation({ mutationFn: (id: string) => widgetsApi.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widgets', orgId] }) })
  const copyEmbed = async (widget: WidgetSummary) => { const response = await widgetsApi.getEmbed(widget.id); await navigator.clipboard.writeText(response.data.data.snippet); toast.success('Embed code copied') }

  return <PageContainer><div className="mx-auto max-w-6xl space-y-6"><PageHeader title="Website widgets" description="Create, test, and publish a chat experience without changing your agent." action={<Button onClick={() => setCreateOpen(true)}><Plus className="size-4" />Create widget</Button>} />
    {!orgId || isLoading ? <div className="grid gap-4 md:grid-cols-2">{[0, 1].map((item) => <div key={item} className="h-40 animate-pulse rounded-md bg-muted" />)}</div> : widgets.length ? <div className="grid gap-4 md:grid-cols-2">{widgets.map((widget) => <WidgetCard key={widget.id} widget={widget} onCopyEmbed={copyEmbed} onStatusChange={(item) => updateWidget.mutate({ id: item.id, status: item.status === 'active' ? 'paused' : 'active' })} onArchive={(item) => archiveWidget.mutate(item.id)} />)}</div> : <EmptyState icon={MessageCircle} title="Create your first widget" description="Choose an agent, customize the experience, then publish one installation snippet." action={{ label: 'Create widget', onClick: () => setCreateOpen(true) }} />}
    <Dialog open={createOpen} onOpenChange={setCreateOpen}><DialogContent><form onSubmit={form.handleSubmit((values) => createWidget.mutate(values))}><DialogHeader><DialogTitle>Create a widget</DialogTitle></DialogHeader><div className="space-y-4 py-5"><div className="space-y-2"><Label htmlFor="widget-name">Widget name</Label><Input id="widget-name" placeholder="Website assistant" {...form.register('name')} /><p className="text-xs text-destructive">{form.formState.errors.name?.message}</p></div><div className="space-y-2"><Label>Agent</Label><Select value={form.watch('agentId')} onValueChange={(value) => form.setValue('agentId', value ?? '', { shouldValidate: true })}><SelectTrigger><SelectValue placeholder="Choose an agent" /></SelectTrigger><SelectContent>{agents.map((agent) => <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>)}</SelectContent></Select><p className="text-xs text-destructive">{form.formState.errors.agentId?.message}</p></div></div><DialogFooter><Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button type="submit" disabled={createWidget.isPending}>{createWidget.isPending ? 'Creating…' : <><Rocket className="size-4" />Continue to setup</>}</Button></DialogFooter></form></DialogContent></Dialog>
  </div></PageContainer>
}
