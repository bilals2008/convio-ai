import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { LayoutDashboard, Database, FlaskConical, History, Loader2, PenLine, Check, X, Globe, BookOpen } from 'lucide-react'
import { FileIcon } from '@/components/shared/file-icon'
import { z } from 'zod'
import { PageContainer } from '@/components/shared/page-container'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

import { DocumentTypeBadge } from '@/components/knowledge/document-type-badge'
import { DocumentStatusBadge } from '@/components/knowledge/document-status-badge'
import { KbHeader } from '@/components/knowledge/kb-header'
import { KbOverview, type KbFormValues } from '@/components/knowledge/kb-overview'
import { KbSources } from '@/components/knowledge/kb-sources'
import { KbTestPanel } from '@/components/knowledge/kb-test'
import { KbActivityTab } from '@/components/knowledge/kb-activity'
import { KbQaPanel } from '@/components/knowledge/kb-qa-panel'
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
import type { SourceType } from '@/components/knowledge/source-picker-modal'
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
  const location = useLocation()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
  const isCreate = id === 'new'
  const isEdit = !!id && !isCreate

  const [form, setForm] = useState<KbFormValues>({ name: '', description: '', tags: [] })
  const [settings] = useState<KbSettings>(DEFAULT_KB_SETTINGS)
  const [errors, setErrors] = useState<Partial<Record<keyof KbFormValues, string>>>({})
  const [saveError, setSaveError] = useState<string | null>(null)

  const [selectionMode, setSelectionMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [reprocessingId, setReprocessingId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ done: number; total: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [viewDocId, setViewDocId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [urlDialogOpen, setUrlDialogOpen] = useState(false)
  const [urlsInput, setUrlsInput] = useState('')
  const [sitemapInput, setSitemapInput] = useState('')
  const [importJob, setImportJob] = useState<{ id: string; found: number } | null>(null)
  const [textDialogOpen, setTextDialogOpen] = useState(false)
  const [textKind, setTextKind] = useState<'text' | 'faq'>('text')
  const [textName, setTextName] = useState('')
  const [textContent, setTextContent] = useState('')
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

  const docsQuery = useInfiniteQuery({
    queryKey: ['knowledge-base-documents', id],
    queryFn: async ({ pageParam }) => {
      const res = await knowledgeApi.getDocuments(id!, { cursor: pageParam, limit: 50 })
      return res.data as { data: DocItem[]; nextCursor: string | null }
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: isEdit,
    refetchInterval: (query) => {
      const docs = query.state.data?.pages.flatMap((p) => p.data) ?? []
      return docs.some((d) => d.status === 'pending' || d.status === 'processing') ? 2500 : false
    },
  })
  const documents = useMemo(() => docsQuery.data?.pages.flatMap((p) => p.data) ?? [], [docsQuery])
  const docsLoading = docsQuery.isLoading

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
      // Retrieval settings aren't persisted by the API — there is no settings
      // column on KnowledgeBase — so there is nothing to hydrate here.
    }
  }, [kb])

  const pendingSource = useRef(false)
  useEffect(() => {
    if (!isEdit || pendingSource.current) return
    const sourceType = (location.state as { sourceType?: SourceType } | null)?.sourceType
    navigate(location.pathname, { replace: true })
    if (!sourceType) return
    pendingSource.current = true
    setActiveTab('sources')
    if (['website', 'sitemap', 'api'].includes(sourceType)) setUrlDialogOpen(true)
    else if (sourceType === 'custom-text' || sourceType === 'faq') {
      setTextKind(sourceType === 'faq' ? 'faq' : 'text')
      setTextDialogOpen(true)
    } else setTimeout(() => fileInputRef.current?.click(), 100)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const duplicateMutation = useMutation({
    mutationFn: () => knowledgeApi.duplicate(id!),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      toast.success('Knowledge base duplicated')
      const newId = res.data?.data?.id as string | undefined
      if (newId) navigate(`/knowledge/${newId}`)
    },
    onError: (err: unknown) => toast.error(`Failed to duplicate: ${err instanceof Error ? err.message : String(err)}`),
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

  const isDirty = useMemo(() => {
    if (isCreate) return true
    if (!kb) return false
    const tagsChanged = (form.tags ?? []).join('\u0001') !== (kb.tags ?? []).join('\u0001')
    return (
      form.name !== kb.name ||
      (form.description ?? '') !== (kb.description ?? '') ||
      tagsChanged
    )
  }, [isCreate, kb, form])

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

  const addUrlMutation = useMutation({
    mutationFn: async (urls: { name: string; url: string }[]) => {
      for (const item of urls) {
        await knowledgeApi.uploadDocument(id!, { type: 'url', name: item.name, url: item.url })
      }
    },
    onSuccess: (_data, urls) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-documents', id] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
      toast.success(`${urls.length} web page${urls.length > 1 ? 's' : ''} added`)
      setUrlDialogOpen(false)
      setUrlsInput('')
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Failed to add web page'),
  })

  const editMutation = useMutation({
    mutationFn: (data: { content: string }) => knowledgeApi.updateDocument(viewDocId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', viewDocId] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-documents', id] })
      toast.success('Document updated')
      setIsEditing(false)
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Failed to update document')
    },
  })

  const addTextMutation = useMutation({
    mutationFn: (data: { name: string; content: string }) =>
      knowledgeApi.uploadDocument(id!, { type: 'txt', ...data }),
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-documents', id] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
      toast.success(vars.name ? `"${vars.name}" added` : textKind === 'faq' ? 'FAQ added' : 'Text added')
      setTextDialogOpen(false)
      setTextName('')
      setTextContent('')
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Failed to add source'),
  })

  const sitemapMutation = useMutation({
    mutationFn: (url: string) => knowledgeApi.expandSitemap(id!, url),
    onSuccess: (res) => {
      const { jobId, found } = (res.data?.data ?? {}) as { jobId?: string; found?: number }
      setUrlsInput('')
      if (jobId) setImportJob({ id: jobId, found: found ?? 0 })
      else setUrlDialogOpen(false)
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : 'Sitemap import failed'),
  })

  const { data: importJobStatus } = useQuery({
    queryKey: ['sitemap-job', importJob?.id],
    queryFn: async () => {
      const res = await knowledgeApi.getSitemapStatus(id!, importJob!.id)
      return res.data.data as { total: number; done: number; failed: number; status: 'running' | 'done' }
    },
    enabled: !!importJob,
    refetchInterval: 700,
  })

  const jobDone = importJobStatus?.status === 'done'
  const jobFinishedRef = useRef(false)
  useEffect(() => {
    if (!jobDone || !importJob || jobFinishedRef.current) return
    jobFinishedRef.current = true
    const { total, failed } = importJobStatus!
    if (failed > 0) toast.warning(`Sitemap import finished: ${total - failed} ok, ${failed} failed`)
    else toast.success(`${total} page${total !== 1 ? 's' : ''} imported from sitemap`)
    queryClient.invalidateQueries({ queryKey: ['knowledge-base-documents', id] })
    queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
    setImportJob(null)
    setSitemapInput('')
    setUrlDialogOpen(false)
  }, [jobDone, importJob, importJobStatus, id, queryClient])

  const handleUploadFiles = async (files: File[]) => {
    if (!id || isCreate) return
    setUploading(true)
    setUploadProgress({ done: 0, total: files.length })
    let failed = 0
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fd = new FormData()
        fd.append('file', file)
        try {
          await knowledgeApi.uploadPdf(id, fd)
        } catch (err) {
          failed++
          const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
          toast.error(`${file.name}: ${message || 'upload failed'}`)
        }
        setUploadProgress({ done: i + 1, total: files.length })
      }
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-documents', id] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
      const ok = files.length - failed
      if (ok > 0) toast.success(`${ok} file${ok > 1 ? 's' : ''} uploaded${failed ? `, ${failed} failed` : ''}`)
    } finally {
      setUploading(false)
      setUploadProgress(null)
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
      <PageContainer className="max-w-5xl">
        <div className="space-y-4">
          <Skeleton className="h-3 w-36" />
          <div className="flex items-start gap-3.5">
            <Skeleton className="size-11 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-3 w-72" />
            </div>
          </div>
        </div>
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-11 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </PageContainer>
    )
  }

  if (isEdit && kbError) {
    return (
      <PageContainer className="max-w-5xl">
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
        { value: 'qa', label: 'Q&A', icon: BookOpen },
      ]

  return (
    <PageContainer className="max-w-5xl">
      <KbHeader
        kb={detail}
        saving={saving}
        dirty={isDirty}
        onBack={() => navigate('/knowledge')}
        onSave={handleSave}
        onDelete={() => deleteMutation.mutate()}
        onDuplicate={() => duplicateMutation.mutate()}
        onViewLogs={() => toast.info('Logs coming soon')}
      />

      {!isCreate && (
        <KbNextStep
          kb={detail}
          hasTested={hasTested}
          onAddSource={() => setTimeout(() => fileInputRef.current?.click(), 100)}
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
              {t.value === 'sources' && documents.length > 0 && (
                 <span className="ml-1 rounded bg-muted px-1.5 text-[10px] tabular-nums text-muted-foreground">
                  {documents.length}
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
                onAddFile={() => setTimeout(() => fileInputRef.current?.click(), 100)}
                onAddWebsite={() => setUrlDialogOpen(true)}
                onPreview={setViewDocId}
                onDelete={handleDeleteDocument}
                onReprocess={handleReprocess}
                reprocessingId={reprocessingId}
                onBulkDelete={handleBulkDelete}
                onBulkReprocess={handleBulkReprocess}
                onUploadFiles={handleUploadFiles}
                uploading={uploading}
                uploadProgress={uploadProgress}
              />
              {docsQuery.hasNextPage && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => docsQuery.fetchNextPage()}
                    disabled={docsQuery.isFetchingNextPage}
                  >
                    {docsQuery.isFetchingNextPage && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                    Load more ({documents.length} loaded)
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="test" className="mt-5">
              <KbTestPanel knowledgeBaseId={id!} onTested={() => setHasTested(true)} onSearch={handleTestSearch} />
            </TabsContent>

            <TabsContent value="qa" className="mt-5">
              <KbQaPanel knowledgeBaseId={id!} />
            </TabsContent>

            <TabsContent value="activity" className="mt-5">
              <KbActivityTab documents={documents} events={activityEvents} />
            </TabsContent>
          </>
        )}
      </Tabs>

      <Dialog open={!!viewDocId} onOpenChange={(open) => { if (!open) { setViewDocId(null); setIsEditing(false) } }}>
        <DialogContent style={{ maxWidth: '80vw' }} className="h-[80vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/60">
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {viewDoc && <FileIcon type={viewDoc.type} size={20} />}
              <span className="truncate">{viewDoc?.name || 'Document'}</span>
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

          <div className="flex-1 overflow-hidden px-6 py-4">
            <Tabs defaultValue="content" className="flex h-full flex-col">
              <TabsList className="mb-3 w-fit">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="chunks">Chunks ({viewDocChunks.length})</TabsTrigger>
              </TabsList>
              <Separator />
              <TabsContent value="content" className="flex-1 overflow-auto mt-3">
                <ScrollArea className="h-full rounded-lg p-4">
                  {viewLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : isEditing ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[50vh] resize-y font-mono text-xs leading-relaxed"
                      placeholder="Edit document content..."
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-foreground">
                      {viewDoc?.content?.trim() ? viewDoc.content : 'No extracted content yet. Wait for indexing or reprocess the document.'}
                    </pre>
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="chunks" className="flex-1 overflow-auto mt-3">
                <ScrollArea className="h-full rounded-lg p-4">
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
                          <p className="whitespace-pre-wrap break-words text-xs text-foreground/90 leading-relaxed">{chunk.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex justify-end gap-2 border-t border-border/60 px-6 py-4">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={editMutation.isPending}>
                  <X className="size-3.5 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={() => editMutation.mutate({ content: editContent })} disabled={editMutation.isPending}>
                  {editMutation.isPending ? <Loader2 className="size-3.5 animate-spin mr-1" /> : <Check className="size-3.5 mr-1" />}
                  Save
                </Button>
              </>
            ) : (
              <>
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
                {viewDocId && viewDoc?.type !== 'url' && viewDoc?.type !== 'pdf' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setEditContent(viewDoc?.content || ''); setIsEditing(true) }}
                  >
                    <PenLine className="size-3.5 mr-1" />
                    Edit
                  </Button>
                )}
                <Button size="sm" onClick={() => { setViewDocId(null); setIsEditing(false) }}>
                  Close
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.txt,.md,.markdown,.csv,.json"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleUploadFiles(Array.from(e.target.files))
          e.target.value = ''
        }}
      />
      <Dialog open={urlDialogOpen} onOpenChange={(open) => {
        setUrlDialogOpen(open)
        if (!open) { setUrlsInput(''); setSitemapInput(''); setImportJob(null); jobFinishedRef.current = false }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add web pages</DialogTitle>
            <DialogDescription>Paste one or more URLs (one per line) to add as sources.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">URLs</label>
              <textarea
                value={urlsInput}
                onChange={(e) => setUrlsInput(e.target.value)}
                placeholder="https://example.com/page1&#10;https://example.com/page2&#10;https://example.com/page3"
                rows={5}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 resize-y font-mono"
              />
              {urlsInput.trim() && (
                <p className="text-xs text-muted-foreground">
                  {urlsInput.trim().split('\n').filter(Boolean).length} URL{urlsInput.trim().split('\n').filter(Boolean).length > 1 ? 's' : ''} detected
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-muted-foreground">
              <Separator className="flex-1" />
              or
              <Separator className="flex-1" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Import from sitemap.xml</label>
              {importJob && importJobStatus ? (
                <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Loader2 className="size-3.5 animate-spin text-primary" />
                      {jobDone ? 'Finishing up…' : 'Importing pages'}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {importJobStatus.done}/{importJobStatus.total}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${importJobStatus.total ? (importJobStatus.done / importJobStatus.total) * 100 : 0}%` }}
                    />
                  </div>
                  {importJobStatus.failed > 0 && (
                    <p className="text-[11px] text-destructive">{importJobStatus.failed} page{importJobStatus.failed !== 1 ? 's' : ''} failed — re-index them later from Sources</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={sitemapInput}
                      onChange={(e) => setSitemapInput(e.target.value)}
                      placeholder="https://example.com/sitemap.xml"
                      className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 shrink-0"
                      disabled={!sitemapInput.trim() || sitemapMutation.isPending}
                      onClick={() => sitemapMutation.mutate(sitemapInput.trim())}
                    >
                      {sitemapMutation.isPending ? <Loader2 className="size-3.5 animate-spin mr-1.5" /> : <Globe className="size-3.5 mr-1.5" />}
                      {sitemapMutation.isPending ? 'Fetching…' : 'Import'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Fetches the sitemap and adds up to 50 pages.</p>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setUrlDialogOpen(false); setUrlsInput('') }}>Cancel</Button>
              <Button
                size="sm"
                disabled={!urlsInput.trim() || addUrlMutation.isPending}
                onClick={() => {
                  const urls = urlsInput.trim().split('\n').map(u => u.trim()).filter(Boolean)
                  const items = urls.map(u => ({ name: u, url: u }))
                  addUrlMutation.mutate(items)
                }}
              >
                {addUrlMutation.isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                Add {urlsInput.trim().split('\n').filter(Boolean).length > 1 ? `(${urlsInput.trim().split('\n').filter(Boolean).length})` : ''} page{urlsInput.trim().split('\n').filter(Boolean).length > 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={textDialogOpen} onOpenChange={(open) => {
        setTextDialogOpen(open)
        if (!open) { setTextName(''); setTextContent('') }
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{textKind === 'faq' ? 'Add FAQ' : 'Add text'}</DialogTitle>
            <DialogDescription>
              {textKind === 'faq'
                ? 'Paste Q&A pairs — one question per line, answer on the next line.'
                : 'Give it a title and paste the content to index.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <input
                value={textName}
                onChange={(e) => setTextName(e.target.value)}
                placeholder={textKind === 'faq' ? 'e.g. Support FAQ' : 'e.g. Product notes'}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Content</label>
              <Textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={8}
                placeholder={
                  textKind === 'faq'
                    ? 'Q: What are your support hours?\nA: Mon-Fri, 9am-6pm.\n\nQ: How do I reset my password?\nA: Use the forgot password link on the login page.'
                    : 'Paste or type the text content here…'
                }
                className="resize-y font-mono text-xs leading-relaxed"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setTextDialogOpen(false); setTextName(''); setTextContent('') }}>Cancel</Button>
              <Button
                size="sm"
                disabled={!textContent.trim() || !textName.trim() || addTextMutation.isPending}
                onClick={() => addTextMutation.mutate({ name: textName.trim(), content: textContent.trim() })}
              >
                {addTextMutation.isPending && <Loader2 className="size-3.5 animate-spin mr-1.5" />}
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </PageContainer>
  )
}
