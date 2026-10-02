import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dataManagement as dataManagementApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Clock, HardDrive, Download } from 'lucide-react'
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
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

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

async function downloadExport(orgId: string, format: 'csv' | 'json', scope: string) {
  const res = await dataManagementApi.export(orgId, { format, scope })
  const disposition = res.headers['content-disposition']
  const name = disposition?.match(/filename="?(.+?)"?\s*(?:;|$)/)?.[1] ?? `convio-export-${scope}.${format}`
  const blob = res.data instanceof Blob ? res.data : new Blob([JSON.stringify(res.data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = name; a.click()
  URL.revokeObjectURL(url)
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

interface CategoryDef {
  key: CategoryKey
  label: string
  description: string
  icon: typeof Brain
  iconColor: string
}

const categories: CategoryDef[] = [
  {
    key: 'agents',
    label: 'Agents',
    description: 'AI agents, configs, deployments & analytics',
    icon: Brain,
    iconColor: 'text-violet-500',
  },
  {
    key: 'conversations',
    label: 'Conversations',
    description: 'Chat conversations and messages across agents',
    icon: MessageSquare,
    iconColor: 'text-sky-500',
  },
  {
    key: 'knowledge-bases',
    label: 'Knowledge Bases',
    description: 'Knowledge bases, documents & embeddings',
    icon: BookOpen,
    iconColor: 'text-emerald-500',
  },
  {
    key: 'documents',
    label: 'Documents',
    description: 'Uploaded docs & vector embeddings',
    icon: FileText,
    iconColor: 'text-amber-500',
  },
  {
    key: 'integrations',
    label: 'Integrations',
    description: 'Channel deployments (WhatsApp, Slack, etc.)',
    icon: LinkIcon,
    iconColor: 'text-pink-500',
  },
  {
    key: 'provider-keys',
    label: 'Provider Keys',
    description: 'BYOK API keys (OpenAI, Anthropic, etc.)',
    icon: Shield,
    iconColor: 'text-rose-500',
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Analytics data & performance metrics',
    icon: BarChart3,
    iconColor: 'text-cyan-500',
  },
]

export default function DataManagementPage() {
  const { orgId, org } = useOrg()
  const queryClient = useQueryClient()
  const [wipeDialogOpen, setWipeDialogOpen] = useState(false)
  const [wipeConfirmText, setWipeConfirmText] = useState('')
  const [wipeError, setWipeError] = useState('')
  const [exportingScope, setExportingScope] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CategoryKey | null>(null)
  const [cascadeItems, setCascadeItems] = useState<{ label: string; count: number }[]>([])
  const [cascadeLoading, setCascadeLoading] = useState(false)

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
      queryClient.invalidateQueries({ queryKey: ['billing', 'usage', orgId] })
      setWipeDialogOpen(false)
      setWipeConfirmText('')
      setWipeError('')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to wipe data')
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (category: string) => dataManagementApi.deleteCategory(orgId!, category),
    onSuccess: () => {
      toast.success('Data deleted')
      queryClient.invalidateQueries({ queryKey: ['data-summary', orgId] })
      queryClient.invalidateQueries({ queryKey: ['all-deployments'] })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      queryClient.invalidateQueries({ queryKey: ['provider-keys'] })
      queryClient.invalidateQueries({ queryKey: ['billing', 'usage', orgId] })
      setDeleteTarget(null)
      setCascadeItems([])
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete data')
    },
  })

  const openDeleteDialog = async (key: CategoryKey) => {
    setDeleteTarget(key)
    setCascadeItems([])
    setCascadeLoading(true)
    try {
      const res = await dataManagementApi.cascade(orgId!, key)
      setCascadeItems(res.data?.data ?? [])
    } catch {
      setCascadeItems([])
    } finally {
      setCascadeLoading(false)
    }
  }

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

      {/* Export card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
              <Download className="size-3.5 text-primary" />
            </div>
            Export Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              disabled={exportingScope === 'agents'}
              onClick={async () => {
                setExportingScope('agents')
                try { await downloadExport(orgId!, 'csv', 'agents') } catch { toast.error('Export failed') }
                finally { setExportingScope(null) }
              }}
            >
              {exportingScope === 'agents' ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
              Export Agents
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              disabled={exportingScope === 'conversations'}
              onClick={async () => {
                setExportingScope('conversations')
                try { await downloadExport(orgId!, 'csv', 'conversations') } catch { toast.error('Export failed') }
                finally { setExportingScope(null) }
              }}
            >
              {exportingScope === 'conversations' ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
              Export Conversations
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              disabled={exportingScope === 'analytics'}
              onClick={async () => {
                setExportingScope('analytics')
                try { await downloadExport(orgId!, 'csv', 'analytics') } catch { toast.error('Export failed') }
                finally { setExportingScope(null) }
              }}
            >
              {exportingScope === 'analytics' ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
              Export Analytics
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              disabled={exportingScope === 'knowledge-bases'}
              onClick={async () => {
                setExportingScope('knowledge-bases')
                try { await downloadExport(orgId!, 'csv', 'knowledge-bases') } catch { toast.error('Export failed') }
                finally { setExportingScope(null) }
              }}
            >
              {exportingScope === 'knowledge-bases' ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
              Export Knowledge Bases
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 gap-1.5 text-xs"
              disabled={exportingScope === 'deployments'}
              onClick={async () => {
                setExportingScope('deployments')
                try { await downloadExport(orgId!, 'csv', 'deployments') } catch { toast.error('Export failed') }
                finally { setExportingScope(null) }
              }}
            >
              {exportingScope === 'deployments' ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
              Export Deployments
            </Button>
            <Button
              size="sm"
              variant="default"
              className="h-8 gap-1.5 text-xs"
              disabled={exportingScope === 'all'}
              onClick={async () => {
                setExportingScope('all')
                try { await downloadExport(orgId!, 'csv', 'all') } catch { toast.error('Export all failed') }
                finally { setExportingScope(null) }
              }}
            >
              {exportingScope === 'all' ? <Loader2 className="size-3 animate-spin" /> : <Download className="size-3" />}
              Export All
            </Button>
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
                  className="group flex items-center gap-3 px-1 py-3 transition-colors hover:bg-muted/30"
                >
                  <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15`}>
                    <Icon className={`size-4 ${cat.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">{cat.label}</span>
                    <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-semibold tabular-nums text-foreground/80">{count.toLocaleString()}</span>
                      <p className="text-[10px] text-muted-foreground">items</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      disabled={count === 0}
                      onClick={() => openDeleteDialog(cat.key)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
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

      {/* Category delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) { setDeleteTarget(null); setCascadeItems([]) } }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-destructive" />
              Delete {deleteTarget ? getCategoryLabel(deleteTarget) : ''}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                This will permanently delete all <strong>{deleteTarget ? getCategoryLabel(deleteTarget).toLowerCase() : ''}</strong> data in{' '}
                <strong>{org?.name || 'this workspace'}</strong>.
              </span>
              {cascadeLoading ? (
                <div className="flex justify-center py-2"><Loader2 className="size-4 animate-spin text-muted-foreground" /></div>
              ) : cascadeItems.length > 0 && (
                <div className="rounded-md bg-muted/50 p-2.5 space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">This includes</p>
                  {cascadeItems.map((i) => (
                    <div key={i.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{i.label}</span>
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
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteCategoryMutation.isPending}
              onClick={() => deleteTarget && deleteCategoryMutation.mutate(deleteTarget)}
              className="gap-1.5"
            >
              {deleteCategoryMutation.isPending && <Loader2 className="size-3 animate-spin" />}
              Delete
            </Button>
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
