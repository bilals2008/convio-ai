import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { LayoutDashboard, Database, FlaskConical, History, Loader2 } from 'lucide-react'
import { z } from 'zod'
import { PageContainer } from '@/components/shared/page-container'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { SourcePickerModal } from '@/components/knowledge/source-picker-modal'
import { DocumentTypeBadge } from '@/components/knowledge/document-type-badge'
import { DocumentStatusBadge } from '@/components/knowledge/document-status-badge'
import { KbHeader } from '@/components/knowledge/kb-header'
import { KbOverview, type KbFormValues } from '@/components/knowledge/kb-overview'
import { KbSources } from '@/components/knowledge/kb-sources'
import { KbTestPanel } from '@/components/knowledge/kb-test'
import { KbActivityTab } from '@/components/knowledge/kb-activity'
import { KbErrorCard } from '@/components/knowledge/kb-error-card'
import { KbNextStep } from '@/components/knowledge/kb-next-step'
import {
  DEFAULT_KB_SETTINGS,
  computeHealth,
  deriveStatus,
  type ActivityEvent,
  type KnowledgeBaseDetail,
  type KbSettings,
} from '@/components/knowledge/kb-types'
import { knowledge as knowledgeApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface RawKnowledgeBase {
  id: string
  name: string
  description?: string
  tags?: string[]
  owner?: { id: string; name: string; email?: string }
  documentCount: number
  readyCount?: number
  processingCount?: number
  errorCount?: number
  organizationId: string
  createdAt: string
  updatedAt: string
  lastIndexedAt?: string
}

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  description: z.string().max(1000).optional().default(''),
  tags: z.array(z.string()).default([]),
})

interface DocItem {
  id: string
  name: string
  type: 'txt' | 'pdf' | 'csv' | 'md' | 'json' | 'url'
  status: 'pending' | 'processing' | 'ready' | 'error' | 'archived'
  chunkCount?: number
  createdAt: string
}

export default function KnowledgeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
  const isCreate = id === 'new'
  const isEdit = !!id && !isCreate

  const [form, setForm] = useState<KbFormValues>({ name: '', description: '', tags: [] })
  const [settings, setSettings] = useState<KbSettings>(DEFAULT_KB_SETTINGS)
  const [errors, setErrors] = useState<Partial<Record<keyof KbFormValues, string>>>({})
  const [saveError, setSaveError] = useState<string | null>(null)

  const [sourceModalOpen, setSourceModalOpen] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [reprocessingId, setReprocessingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [viewDocId, setViewDocId] = useState<string | null>(null)
  const [hasTested, setHasTested] = useState(false)
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([])
  const [activeTab, setActiveTab] = useState(isCreate ? 'overview' : 'sources')

  const [analytics, setAnalytics] = useState({ searches: 0, success: 0, lastLatency: null as number | null })

  const { data: kb, isLoading, error: kbError } = useQuery({
    queryKey: ['knowledge-base', id],
    queryFn: async () => {
      const res = await knowledgeApi.get(id!)
      return res.data.data as RawKnowledgeBase
    },
    enabled: isEdit,
  })

  const { data: documents = [], isLoading: docsLoading } = useQuery({
    queryKey: ['knowledge-base-documents', id],
    queryFn: async () => {
      const res = await knowledgeApi.getDocuments(id!)
      return (res.data.data || []) as DocItem[]
    },
    enabled: isEdit,
    refetchInterval: (query) => {
      const docs = query.state.data as DocItem[] | undefined
      return docs?.some((d) => d.status === 'pending' || d.status === 'processing') ? 2500 : false
    },
  })

  const { data: viewDoc, isLoading: viewLoading } = useQuery({
    queryKey: ['document', viewDocId],
    queryFn: async () => {
      const res = await knowledgeApi.getDocument(viewDocId!)
      return res.data.data as DocItem & { content?: string | null }
    },
    enabled: !!viewDocId,
  })

  const { data: viewDocChunks = [] } = useQuery({
    queryKey: ['document-chunks', viewDocId],
    queryFn: async () => {
      const res = await knowledgeApi.getDocumentChunks(viewDocId!)
      return (res.data.data || []) as Array<{ id: string; content: string; hasEmbedding: boolean }>
    },
    enabled: !!viewDocId,
  })

  const detail: KnowledgeBaseDetail | null = useMemo(() => {
    if (isCreate) {
      return {
        id: 'new',
        name: form.name,
        description: form.description,
        tags: form.tags,
        status: 'draft',
        documentCount: 0,
        readyCount: 0,
        processingCount: 0,
        errorCount: 0,
        organizationId: orgId ?? '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings,
      }
    }
    if (!kb) return null
    const documentCount = kb.documentCount ?? documents.length
    const readyCount = kb.readyCount ?? documents.filter((d) => d.status === 'ready').length
    const processingCount =
      kb.processingCount ?? documents.filter((d) => d.status === 'pending' || d.status === 'processing').length
    const errorCount = kb.errorCount ?? documents.filter((d) => d.status === 'error').length
    return {
      id: kb.id,
      name: kb.name,
      description: kb.description,
      tags: kb.tags ?? [],
      owner: kb.owner,
      status: deriveStatus(readyCount, processingCount, errorCount, documentCount),
      documentCount,
      readyCount,
      processingCount,
      errorCount,
      organizationId: kb.organizationId,
      createdAt: kb.createdAt,
      updatedAt: kb.updatedAt,
      lastIndexedAt: kb.lastIndexedAt,
      settings,
    }
  }, [kb, documents, form, settings, isCreate, orgId])

  const health = useMemo(
    () => computeHealth(documents, settings, analytics.searches > 0 ? analytics.success / analytics.searches : null),
    [documents, settings, analytics],
  )

  const kbInit = useRef(false)
  useEffect(() => {
    if (kb && !kbInit.current) {
      kbInit.current = true
      setForm({ name: kb.name, description: kb.description || '', tags: kb.tags ?? [] })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (kb.settings) setSettings({ ...DEFAULT_KB_SETTINGS, ...kb.settings })
    }
  }, [kb])

  useEffect(() => {
    if (!isEdit || !id) return
    const hasActive = documents.some((d) => d.status === 'pending' || d.status === 'processing')
    if (!hasActive && documents.length > 0) {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
    }
  }, [documents, isEdit, id, queryClient])

  const createMutation = useMutation({
    mutationFn: (data: KbFormValues) =>
      knowledgeApi.create({ ...data, organizationId: orgId! } as Record<string, unknown>),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      const createdId = res.data?.data?.id as string | undefined
      toast.success('Knowledge base created')
      if (createdId) navigate(`/knowledge/${createdId}`)
      else navigate('/knowledge')
    },
    onError: (err: unknown) => toast.error(`Failed to create: ${err instanceof Error ? err.message : String(err)}`),
  })

  const updateMutation = useMutation({
    mutationFn: (data: KbFormValues) =>
      knowledgeApi.update(id!, { name: data.name, description: data.description, tags: data.tags } as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
      toast.success('Knowledge base updated')
    },
    onError: (err: unknown) => toast.error(`Failed to update: ${err instanceof Error ? err.message : String(err)}`),
  })

  const deleteMutation = useMutation({
    mutationFn: () => knowledgeApi.delete(id!),
    onSuccess: () => {
      toast.success('Knowledge base deleted')
      navigate('/knowledge')
    },
    onError: (err: unknown) => toast.error(`Failed to delete: ${err instanceof Error ? err.message : String(err)}`),
  })

  const handleSave = () => {
    setSaveError(null)
    const result = formSchema.safeParse(form)
    if (!result.success) {
      const fe: Partial<Record<keyof KbFormValues, string>> = {}
      result.error.errors.forEach((e) => {
        const field = e.path[0] as keyof KbFormValues
        if (!fe[field]) fe[field] = e.message
      })
      setErrors(fe)
      toast.error(result.error.errors.map((e) => e.message).join('. '))
      return
    }
    setErrors({})
    if (!orgId) {
      setSaveError('Organization not loaded. Please wait and try again.')
      return
    }
    if (isCreate) createMutation.mutate(result.data)
    else updateMutation.mutate(result.data)
  }

  const saving = createMutation.isPending || updateMutation.isPending

  const handleDeleteDocument = async (docId: string) => {
    try {
      await knowledgeApi.deleteDocument(docId)
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-documents', id] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
      toast.success('Document deleted')
    } catch {
      toast.error('Failed to delete document')
    }
  }

  const handleReprocess = async (docId: string) => {
    setReprocessingId(docId)
    try {
      await knowledgeApi.reprocessDocument(docId)
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-documents', id] })
      toast.success('Re-indexing started')
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      toast.error(message || 'Failed to reprocess document')
    } finally {
      setReprocessingId(null)
    }
  }

  const handleUploadFiles = async (files: File[]) => {
    if (!id || isCreate) return
    setUploading(true)
    try {
      for (const file of files) {
        const fd = new FormData()
        fd.append('file', file)
        await knowledgeApi.uploadPdf(id, fd)
      }
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-documents', id] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
      toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded`)
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selected)
    for (const docId of ids) await handleDeleteDocument(docId)
    setSelected(new Set())
    setSelectionMode(false)
  }

  const handleBulkReprocess = async () => {
    const ids = Array.from(selected)
    for (const docId of ids) await handleReprocess(docId)
    setSelected(new Set())
    setSelectionMode(false)
  }

  const handleTestSearch = (meta: { latency: number | null; found: number; query: string }) => {
    setAnalytics((a) => ({
      searches: a.searches + 1,
      success: a.success + (meta.found > 0 ? 1 : 0),
      lastLatency: meta.latency,
    }))
    setActivityEvents((evts) => [
      {
        id: `search-${Date.now()}`,
        type: 'search.executed',
        title: `Search: "${meta.query}"`,
        description: meta.found > 0 ? `Retrieved ${meta.found} chunk${meta.found > 1 ? 's' : ''}.` : 'No matches found.',
        timestamp: new Date().toISOString(),
      },
      ...evts,
    ])
  }

  if (isEdit && isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </PageContainer>
    )
  }

  if (isEdit && kbError) {
    return (
      <PageContainer>
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {kbError instanceof Error ? kbError.message : 'Failed to load knowledge base'}
        </div>
        <Button variant="outline" size="sm" className="mt-4 gap-1.5" onClick={() => navigate('/knowledge')}>
          Back
        </Button>
      </PageContainer>
    )
  }

  if (!detail) return null

  const tabs = isCreate
    ? [
        { value: 'overview', label: 'Overview', icon: LayoutDashboard },
      ]
    : [
        { value: 'overview', label: 'Overview', icon: LayoutDashboard },
        { value: 'sources', label: 'Sources', icon: Database },
        { value: 'test', label: 'Test', icon: FlaskConical },
        { value: 'activity', label: 'Activity', icon: History },
      ]

  return (
    <PageContainer>
      <div className="space-y-5">
        <KbHeader
          kb={detail}
          saving={saving}
          onBack={() => navigate('/knowledge')}
          onSave={handleSave}
          onDelete={() => deleteMutation.mutate()}
          onDuplicate={() => toast.info('Duplicate coming soon')}
          onViewLogs={() => toast.info('Logs coming soon')}
        />

        {!isCreate && (
          <KbNextStep
            kb={detail}
            hasTested={hasTested}
            onAddSource={() => setSourceModalOpen(true)}
            onNavigate={setActiveTab}
          />
        )}

        {!isCreate && (
          <KbErrorCard
            failedCount={detail.errorCount}
            onRetry={() => documents.filter((d) => d.status === 'error').forEach((d) => handleReprocess(d.id))}
            onViewLogs={() => toast.info('Logs coming soon')}
            onDownloadLogs={() => toast.info('Download coming soon')}
            onContactSupport={() => toast.info('Support coming soon')}
          />
        )}

        {saveError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {saveError}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList variant="line" className="!h-11 flex-nowrap whitespace-nowrap md:!h-10 w-max">
            {tabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value} id={t.value === 'test' ? 'tab-test' : undefined}>
                <t.icon className="size-4" />
                {t.label}
                {t.value === 'sources' && detail.documentCount > 0 && (
                  <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px] tabular-nums text-muted-foreground">
                    {detail.documentCount}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <Separator />

          <TabsContent value="overview" className="mt-5">
            <KbOverview
              kb={detail}
              form={form}
              errors={errors}
              onFormChange={setForm}
              settings={settings}
              health={health}
              disabled={saving}
            />
          </TabsContent>

          {!isCreate && (
            <>
              <TabsContent value="sources" className="mt-5">
                <KbSources
                  documents={documents}
                  loading={docsLoading}
                  selectionMode={selectionMode}
                  setSelectionMode={setSelectionMode}
                  selected={selected}
                  toggleSelect={(docId) =>
                    setSelected((prev) => {
                      const next = new Set(prev)
                      if (next.has(docId)) next.delete(docId)
                      else next.add(docId)
                      return next
                    })
                  }
                  onAddSource={() => setSourceModalOpen(true)}
                  onPreview={setViewDocId}
                  onDelete={handleDeleteDocument}
                  onReprocess={handleReprocess}
                  reprocessingId={reprocessingId}
                  onBulkDelete={handleBulkDelete}
                  onBulkReprocess={handleBulkReprocess}
                  onUploadFiles={handleUploadFiles}
                  uploading={uploading}
                />
              </TabsContent>

              <TabsContent value="test" className="mt-5">
                <KbTestPanel knowledgeBaseId={id!} onTested={() => setHasTested(true)} onSearch={handleTestSearch} />
              </TabsContent>

              <TabsContent value="activity" className="mt-5">
                <KbActivityTab documents={documents} events={activityEvents} />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <Dialog open={!!viewDocId} onOpenChange={(open) => !open && setViewDocId(null)}>
        <DialogContent className="w-[90vw] max-w-none max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {viewDoc?.name || 'Document'}
              {viewDoc && (
                <>
                  <DocumentTypeBadge type={viewDoc.type} />
                  <DocumentStatusBadge status={viewDoc.status} />
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {typeof viewDoc?.chunkCount === 'number'
                ? `${viewDoc.chunkCount} chunk${viewDoc.chunkCount !== 1 ? 's' : ''} indexed`
                : 'Document preview'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6">
            <Tabs defaultValue="content" className="flex h-full flex-col">
              <TabsList className="mb-3 w-fit">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="chunks">Chunks ({viewDocChunks.length})</TabsTrigger>
          </TabsList>
          <Separator />
              <TabsContent value="content" className="flex-1 overflow-auto">
                <ScrollArea className="h-full rounded-lg border bg-muted/20 p-4">
                  {viewLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                      {viewDoc?.content?.trim() ? viewDoc.content : 'No extracted content yet. Wait for indexing or reprocess the document.'}
                    </pre>
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="chunks" className="flex-1 overflow-auto">
                <ScrollArea className="h-full rounded-lg border bg-muted/20 p-4">
                  {viewDocChunks.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">No chunks yet</p>
                  ) : (
                    <div className="space-y-2">
                      {viewDocChunks.map((chunk, i) => (
                        <div key={chunk.id} className="rounded-lg border border-border/40 bg-background/50 p-3">
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-medium text-muted-foreground">#{i + 1}</span>
                            <span
                              className={cn(
                                'rounded px-1.5 py-0.5 text-[10px] font-medium',
                                chunk.hasEmbedding ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive',
                              )}
                            >
                              {chunk.hasEmbedding ? 'embedded' : 'no embedding'}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap break-words text-xs text-foreground/90">{chunk.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          <div className="flex justify-end gap-2 border-t border-border/60 px-6 py-4">
            {viewDocId && (
              <Button
                variant="outline"
                size="sm"
                disabled={viewDoc?.status === 'processing' || viewDoc?.status === 'pending'}
                onClick={() => handleReprocess(viewDocId)}
              >
                Re-index
              </Button>
            )}
            <Button size="sm" onClick={() => setViewDocId(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleUploadFiles(Array.from(e.target.files))
          e.target.value = ''
        }}
      />
      <SourcePickerModal
        open={sourceModalOpen}
        onOpenChange={setSourceModalOpen}
        onSelect={(sourceId) => {
          setSourceModalOpen(false)
          if (sourceId === 'file-upload') {
            setTimeout(() => fileInputRef.current?.click(), 100)
          }
        }}
      />
    </PageContainer>
  )
}
