import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  Loader2,
  Unplug,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { knowledge as knowledgeApi, agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { toast } from 'sonner'
import { DocumentStatusBadge } from '@/components/knowledge/document-status-badge'

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  documentCount: number
  readyCount?: number
  processingCount?: number
  errorCount?: number
}

interface DocumentItem {
  id: string
  name: string
  type: string
  status: 'pending' | 'processing' | 'ready' | 'error' | 'archived'
  chunkCount?: number
}

interface AgentKnowledgeProps {
  agentId: string
  knowledgeBaseId?: string | null
  disabled?: boolean
}

export function AgentKnowledge({
  agentId,
  knowledgeBaseId,
  disabled,
}: AgentKnowledgeProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
  const [selectedId, setSelectedId] = useState(knowledgeBaseId || '')

  useEffect(() => {
    setSelectedId(knowledgeBaseId || '')
  }, [knowledgeBaseId])

  const { data: knowledgeBases = [], isLoading: kbLoading } = useQuery({
    queryKey: ['knowledge-bases', orgId],
    queryFn: async () => {
      const res = await knowledgeApi.list(orgId!)
      return (res.data.data || []) as KnowledgeBase[]
    },
    enabled: !!orgId,
  })

  const activeKbId = selectedId || knowledgeBaseId || ''

  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['knowledge-base-documents', activeKbId],
    queryFn: async () => {
      const res = await knowledgeApi.getDocuments(activeKbId)
      return (res.data.data || []) as DocumentItem[]
    },
    enabled: !!activeKbId,
    refetchInterval: (query) => {
      const docs = query.state.data as DocumentItem[] | undefined
      const hasActive = docs?.some(
        (d) => d.status === 'pending' || d.status === 'processing',
      )
      return hasActive ? 3000 : false
    },
  })

  const saveMutation = useMutation({
    mutationFn: (nextKbId: string | null) =>
      agentsApi.update(agentId, { knowledgeBaseId: nextKbId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', agentId] })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success(
        selectedId
          ? 'Knowledge base connected — RAG is enabled for this agent'
          : 'Knowledge base disconnected',
      )
    },
    onError: () => {
      toast.error('Failed to update knowledge base')
    },
  })

  const connectedKb = knowledgeBases.find((kb) => kb.id === (knowledgeBaseId || ''))
  const readyCount =
    connectedKb?.readyCount ?? documents.filter((d) => d.status === 'ready').length
  const totalChunks = documents.reduce((sum, d) => sum + (d.chunkCount ?? 0), 0)

  const handleConnect = () => {
    if (!selectedId) {
      toast.error('Select a knowledge base first')
      return
    }
    saveMutation.mutate(selectedId)
  }

  const handleDisconnect = () => {
    setSelectedId('')
    saveMutation.mutate(null)
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Zap className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">RAG Knowledge Base</h3>
            <p className="text-xs text-muted-foreground">
              Connect a knowledge base so this agent retrieves relevant document chunks at chat time
            </p>
          </div>
        </div>

        {knowledgeBaseId && connectedKb ? (
          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <CheckCircle2 className="size-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">{connectedKb.name}</p>
                <p className="text-xs text-muted-foreground">
                  {connectedKb.documentCount} documents · {readyCount} ready
                  {totalChunks > 0 ? ` · ${totalChunks} chunks` : ''}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/knowledge/${knowledgeBaseId}`)}
              >
                <ExternalLink className="size-3.5" />
                Open KB
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled || saveMutation.isPending}
                onClick={handleDisconnect}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Unplug className="size-3.5" />
                )}
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="mb-5 rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
            No knowledge base connected. RAG is off for this agent.
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs font-medium">Select knowledge base</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={selectedId || knowledgeBaseId || ''}
              onValueChange={(v) => setSelectedId(v || '')}
              disabled={disabled || kbLoading || saveMutation.isPending}
            >
              <SelectTrigger className="w-full sm:flex-1">
                <SelectValue placeholder={kbLoading ? 'Loading…' : 'Choose a knowledge base'} />
              </SelectTrigger>
              <SelectContent>
                {knowledgeBases.length === 0 ? (
                  <SelectItem value="__empty" disabled>
                    No knowledge bases yet
                  </SelectItem>
                ) : (
                  knowledgeBases.map((kb) => (
                    <SelectItem key={kb.id} value={kb.id}>
                      {kb.name}
                      {typeof kb.documentCount === 'number'
                        ? ` (${kb.documentCount} docs)`
                        : ''}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={handleConnect}
              disabled={
                disabled ||
                saveMutation.isPending ||
                !selectedId ||
                selectedId === knowledgeBaseId
              }
            >
              {saveMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <BookOpen className="size-4" />
              )}
              {knowledgeBaseId ? 'Update' : 'Connect'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Need a new one?{' '}
            <button
              type="button"
              className="text-primary underline-offset-2 hover:underline"
              onClick={() => navigate('/knowledge/new')}
            >
              Create knowledge base
            </button>
          </p>
        </div>
      </div>

      {activeKbId && (
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <FileText className="size-3.5" />
              </div>
              <h3 className="text-sm font-semibold">Indexed documents</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/knowledge/${activeKbId}`)}
            >
              Manage
            </Button>
          </div>

          {docsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : documents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              This knowledge base has no documents yet. Add sources to enable retrieval.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {documents.slice(0, 8).map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{doc.name}</p>
                    <p className="text-[11px] text-muted-foreground uppercase">
                      {doc.type}
                      {typeof doc.chunkCount === 'number'
                        ? ` · ${doc.chunkCount} chunks`
                        : ''}
                    </p>
                  </div>
                  <DocumentStatusBadge status={doc.status} />
                </li>
              ))}
            </ul>
          )}

          {documents.length > 8 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              +{documents.length - 8} more — open the knowledge base to see all
            </p>
          )}
        </div>
      )}

    </div>
  )
}
