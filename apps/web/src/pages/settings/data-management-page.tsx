import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dataManagement as dataManagementApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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

interface DataSummary {
  agents: number
  conversations: number
  'knowledge-bases': number
  documents: number
  integrations: number
  'provider-keys': number
  analytics: number
}

const categories: {
  key: keyof DataSummary
  label: string
  description: string
  icon: typeof Brain
  warning?: string
}[] = [
  {
    key: 'agents',
    label: 'Agents',
    description: 'AI agents, configs, deployments & analytics',
    icon: Brain,
    warning: 'Cascading delete: conversations, deployments, analytics',
  },
  {
    key: 'conversations',
    label: 'Conversations',
    description: 'Chat conversations and messages across agents',
    icon: MessageSquare,
  },
  {
    key: 'knowledge-bases',
    label: 'Knowledge Bases',
    description: 'Knowledge bases, documents & embeddings',
    icon: BookOpen,
    warning: 'Agents lose their knowledge source',
  },
  {
    key: 'documents',
    label: 'Documents',
    description: 'Uploaded docs & vector embeddings',
    icon: FileText,
  },
  {
    key: 'integrations',
    label: 'Integrations',
    description: 'Channel deployments (WhatsApp, Slack, etc.)',
    icon: LinkIcon,
  },
  {
    key: 'provider-keys',
    label: 'Provider Keys',
    description: 'BYOK API keys (OpenAI, Anthropic, etc.)',
    icon: Shield,
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Analytics data & performance metrics',
    icon: BarChart3,
  },
]

export default function DataManagementPage() {
  const { orgId, org } = useOrg()
  const queryClient = useQueryClient()
  const [deletingCategory, setDeletingCategory] = useState<keyof DataSummary | null>(null)
  const [wipeDialogOpen, setWipeDialogOpen] = useState(false)
  const [wipeConfirmText, setWipeConfirmText] = useState('')
  const [wipeError, setWipeError] = useState('')

  const summaryQuery = useQuery({
    queryKey: ['data-summary', orgId],
    queryFn: () => dataManagementApi.summary(orgId!),
    enabled: !!orgId,
  })

  const summary: DataSummary = summaryQuery.data?.data?.data ?? {
    agents: 0,
    conversations: 0,
    'knowledge-bases': 0,
    documents: 0,
    integrations: 0,
    'provider-keys': 0,
    analytics: 0,
  }

  const deleteCategoryMutation = useMutation({
    mutationFn: (category: string) => dataManagementApi.deleteCategory(orgId!, category),
    onSuccess: (_res, category) => {
      toast.success(`${getCategoryLabel(category)} deleted successfully`)
      queryClient.invalidateQueries({ queryKey: ['data-summary', orgId] })
      queryClient.invalidateQueries({ queryKey: ['all-deployments'] })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
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

  const totalItems = Object.values(summary).reduce((sum, count) => sum + count, 0)
  const hasAnyData = totalItems > 0

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary/10">
              <Brain className="size-3.5 text-primary" />
            </div>
            Workspace Data
          </CardTitle>
          <CardDescription>
            {totalItems.toLocaleString()} items across {Object.values(summary).filter((c) => c > 0).length} categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((cat) => {
              const count = summary[cat.key]
              const Icon = cat.icon
              return (
                <div
                  key={cat.key}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{cat.label}</span>
                        {cat.warning && count > 0 && (
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-warning/30 text-warning">
                            Cascade
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm font-semibold tabular-nums">{count.toLocaleString()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                      disabled={count === 0 || deleteCategoryMutation.isPending}
                      onClick={() => setDeletingCategory(cat.key)}
                    >
                      {deleteCategoryMutation.isPending && deletingCategory === cat.key ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Wipe All */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2 text-sm">
            <div className="flex size-7 items-center justify-center rounded-md bg-destructive/10">
              <AlertTriangle className="size-3.5 text-destructive" />
            </div>
            Wipe All Data
          </CardTitle>
          <CardDescription>
            Permanently delete all data in <strong>{org?.name || 'this workspace'}</strong> including agents,
            conversations, knowledge bases, documents, integrations, provider keys, and analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            size="sm"
            disabled={!hasAnyData || wipeMutation.isPending}
            onClick={() => setWipeDialogOpen(true)}
            className="gap-1.5"
          >
            {wipeMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            Wipe All Data
          </Button>
        </CardContent>
      </Card>

      {/* Category delete dialog */}
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
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Are you sure you want to delete all{' '}
                <strong>{deletingCategory ? getCategoryLabel(deletingCategory).toLowerCase() : ''}</strong>?
                This cannot be undone.
              </span>
              {deletingCategory && categories.find((c) => c.key === deletingCategory)?.warning && (
                <span className="flex items-center gap-1 text-destructive font-medium text-xs">
                  <AlertTriangle className="size-3 shrink-0" />
                  {categories.find((c) => c.key === deletingCategory)?.warning}
                </span>
              )}
              {deletingCategory && (
                <span className="block text-xs text-muted-foreground">
                  {summary[deletingCategory].toLocaleString()} {summary[deletingCategory] === 1 ? 'item' : 'items'} will be deleted.
                </span>
              )}
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Wipe all dialog */}
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
              Wipe All Data
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                This will permanently delete <strong>all data</strong> in{' '}
                <strong>{org?.name || 'the workspace'}</strong>.
              </span>
              <span className="block text-xs text-muted-foreground space-y-0.5 rounded-md bg-muted/50 p-2.5">
                {Object.entries(summary)
                  .filter(([, count]) => count > 0)
                  .map(([key, count]) => (
                    <span key={key} className="block">
                      {count.toLocaleString()} {getCategoryLabel(key).toLowerCase()}
                    </span>
                  ))}
              </span>
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
              Wipe All Data
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
