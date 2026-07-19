import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dataManagement as dataManagementApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Trash2, AlertTriangle, Brain, MessageSquare, BookOpen, FileText, Link as LinkIcon, Shield, BarChart3 } from 'lucide-react'
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
    description: 'All AI agents and their configurations. Conversations, deployments, and analytics linked to agents will also be deleted.',
    icon: Brain,
    warning: 'This will also delete all conversations, deployments, and analytics for these agents.',
  },
  {
    key: 'conversations',
    label: 'Conversations',
    description: 'All chat conversations and messages across all agents.',
    icon: MessageSquare,
  },
  {
    key: 'knowledge-bases',
    label: 'Knowledge Bases',
    description: 'All knowledge bases and their associated documents and embeddings.',
    icon: BookOpen,
    warning: 'Agents referencing these knowledge bases will lose their knowledge source.',
  },
  {
    key: 'documents',
    label: 'Documents',
    description: 'All uploaded documents and their vector embeddings. Knowledge bases will remain but be empty.',
    icon: FileText,
  },
  {
    key: 'integrations',
    label: 'Integrations',
    description: 'All channel deployments (WhatsApp, Slack, Discord, Telegram, etc.).',
    icon: LinkIcon,
  },
  {
    key: 'provider-keys',
    label: 'Provider Keys',
    description: 'All BYOK API keys (OpenAI, Anthropic, Google, etc.).',
    icon: Shield,
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'All analytics data and performance metrics.',
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
    onSettled: () => {
      setDeletingCategory(null)
    },
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

  const hasAnyData = Object.values(summary).some((count) => count > 0)

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
        description="Manage and delete data in your workspace. These actions are permanent."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const count = summary[cat.key]
          const Icon = cat.icon
          return (
            <div
              key={cat.key}
              className="flex items-start gap-3 rounded-lg border bg-card p-4"
            >
              <div className="size-9 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{cat.label}</span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {count.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {cat.description}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 w-full justify-start gap-1.5"
                  disabled={count === 0 || deleteCategoryMutation.isPending}
                  onClick={() => setDeletingCategory(cat.key)}
                >
                  {deleteCategoryMutation.isPending && deletingCategory === cat.key ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash2 className="size-3" />
                  )}
                  Delete {cat.label.toLowerCase()}
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Wipe All Data */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2 text-base">
            <AlertTriangle className="size-5" />
            Wipe All Data
          </CardTitle>
          <CardDescription>
            Permanently delete all data in this workspace including agents, conversations,
            knowledge bases, documents, integrations, provider keys, analytics, widgets, and tools.
            This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            disabled={!hasAnyData || wipeMutation.isPending}
            onClick={() => setWipeDialogOpen(true)}
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

      {/* Category delete confirmation */}
      <AlertDialog
        open={deletingCategory !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingCategory(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Delete {deletingCategory ? getCategoryLabel(deletingCategory) : ''}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Are you sure you want to delete all {deletingCategory ? getCategoryLabel(deletingCategory).toLowerCase() : ''}?
                This action is permanent and cannot be undone.
              </span>
              {deletingCategory && categories.find((c) => c.key === deletingCategory)?.warning && (
                <span className="block text-destructive font-medium">
                  {categories.find((c) => c.key === deletingCategory)?.warning}
                </span>
              )}
              {deletingCategory && (
                <span className="block text-sm">
                  {summary[deletingCategory].toLocaleString()} {summary[deletingCategory] === 1 ? 'item' : 'items'} will be deleted.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deletingCategory) {
                  deleteCategoryMutation.mutate(deletingCategory)
                }
              }}
            >
              Delete {deletingCategory ? getCategoryLabel(deletingCategory) : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Wipe all confirmation with type-to-confirm */}
      <AlertDialog
        open={wipeDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setWipeDialogOpen(false)
            setWipeConfirmText('')
            setWipeError('')
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Wipe All Data
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <span className="block">
                This will permanently delete <strong>all data</strong> in the <strong>{org?.name || 'workspace'}</strong> workspace, including:
              </span>
              <span className="block text-sm space-y-1">
                {Object.entries(summary)
                  .filter(([, count]) => count > 0)
                  .map(([key, count]) => (
                    <span key={key} className="block">
                      &bull; {count.toLocaleString()} {getCategoryLabel(key).toLowerCase()}
                    </span>
                  ))}
              </span>
              <span className="block text-destructive font-medium">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="wipe-confirm" className="text-sm">
              Type <span className="font-mono font-semibold">DELETE</span> to confirm
            </Label>
            <Input
              id="wipe-confirm"
              value={wipeConfirmText}
              onChange={(e) => {
                setWipeConfirmText(e.target.value)
                setWipeError('')
              }}
              placeholder="DELETE"
              className={wipeError ? 'border-destructive' : ''}
              autoComplete="off"
            />
            {wipeError && (
              <p className="text-xs text-destructive">{wipeError}</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={wipeConfirmText !== 'DELETE' || wipeMutation.isPending}
              onClick={() => {
                if (wipeConfirmText !== 'DELETE') {
                  setWipeError('Please type DELETE to confirm')
                  return
                }
                wipeMutation.mutate()
              }}
            >
              {wipeMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              Wipe All Data
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
