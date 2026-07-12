import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Loader2,
  Save,
  Search,
  Plus,
  MessageSquare,
} from 'lucide-react'
import { z } from 'zod'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { KnowledgeForm } from '@/components/knowledge/knowledge-form'
import type { KnowledgeFormData } from '@/components/knowledge/knowledge-form'
import { DocumentCard } from '@/components/knowledge/document-card'
import type { DocumentItem } from '@/components/knowledge/document-card'
import { DocumentStatusBadge } from '@/components/knowledge/document-status-badge'
import { DocumentTypeBadge } from '@/components/knowledge/document-type-badge'
import { WorkflowSteps } from '@/components/knowledge/workflow-steps'
import { KbSettingsPanel } from '@/components/knowledge/kb-settings-panel'
import { NoDocuments, NoSearchResults } from '@/components/knowledge/kb-empty-states'
import { SourcePickerModal } from '@/components/knowledge/source-picker-modal'
import { knowledge as knowledgeApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  documentCount: number
  readyCount?: number
  processingCount?: number
  errorCount?: number
  organizationId: string
  createdAt: string
  updatedAt: string
}

const kbSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  description: z.string().max(1000).optional().default(''),
})

const defaultFormData: KnowledgeFormData = {
  name: '',
  description: '',
}

function getWorkflowStep(docCount: number, readyCount: number, processingCount: number, hasSearch: boolean, agentCount: number): number {
  if (docCount === 0) return 0
  if (processingCount > 0) return 2
  if (readyCount > 0 && !hasSearch) return 2
  if (readyCount > 0 && hasSearch && agentCount === 0) return 3
  if (readyCount > 0 && agentCount > 0) return 4
  return 1
}

export default function KnowledgeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
  const isCreate = id === 'new'
  const isEdit = !!id && !isCreate

  const [formData, setFormData] = useState<KnowledgeFormData>(defaultFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof KnowledgeFormData, string>>>({})
  const [viewDocId, setViewDocId] = useState<string | null>(null)
  const [reprocessingId, setReprocessingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string
      content: string
      documentId: string
      documentName: string
      score: number
    }>
  >([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [sourceModalOpen, setSourceModalOpen] = useState(false)

  const { data: kb, isLoading, error: kbError } = useQuery({
    queryKey: ['knowledge-base', id],
    queryFn: async () => {
      const res = await knowledgeApi.get(id!)
      return res.data.data as KnowledgeBase
    },
    enabled: isEdit,
  })

  const { data: documents = [] } = useQuery({
    queryKey: ['knowledge-base-documents', id],
    queryFn: async () => {
      const res = await knowledgeApi.getDocuments(id!)
      return (res.data.data || []) as DocumentItem[]
    },
    enabled: isEdit,
    refetchInterval: (query) => {
      const docs = query.state.data as DocumentItem[] | undefined
      const hasActive = docs?.some(
        (d) => d.status === 'pending' || d.status === 'processing',
      )
      return hasActive ? 2500 : false
    },
  })

  const { data: viewDoc, isLoading: viewLoading } = useQuery({
    queryKey: ['document', viewDocId],
    queryFn: async () => {
      const res = await knowledgeApi.getDocument(viewDocId!)
      return res.data.data as DocumentItem & { content?: string | null }
    },
    enabled: !!viewDocId,
  })

  const { data: viewDocChunks = [] } = useQuery({
    queryKey: ['document-chunks', viewDocId],
    queryFn: async () => {
      const res = await knowledgeApi.getDocumentChunks(viewDocId!)
      return (res.data.data || []) as Array<{
        id: string
        content: string
        hasEmbedding: boolean
        createdAt: string
      }>
    },
    enabled: !!viewDocId,
  })

  const documentCount = kb?.documentCount ?? documents.length
  const readyCount = kb?.readyCount ?? documents.filter((d) => d.status === 'ready').length
  const processingCount = kb?.processingCount ?? documents.filter((d) => d.status === 'pending' || d.status === 'processing').length

  const workflowStep = isEdit
    ? getWorkflowStep(documentCount, readyCount, processingCount, hasSearched, 0)
    : 0

  const kbInitialized = useRef(false)
  useEffect(() => {
    if (kb && !kbInitialized.current) {
      kbInitialized.current = true
      setFormData({ name: kb.name, description: kb.description || '' })
    }
  }, [kb])

  useEffect(() => {
    if (!isEdit || !id) return
    const hasActive = documents.some(
      (d) => d.status === 'pending' || d.status === 'processing',
    )
    if (!hasActive && documents.length > 0) {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
    }
  }, [documents, isEdit, id, queryClient])

  const createMutation = useMutation({
    mutationFn: (data: KnowledgeFormData) => {
      return knowledgeApi.create({ ...data, organizationId: orgId! })
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      const createdId = res.data?.data?.id as string | undefined
      if (createdId) {
        toast.success('Knowledge base created')
        navigate(`/knowledge/${createdId}`)
      } else {
        toast.success('Knowledge base created')
        navigate('/knowledge')
      }
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Failed to create: ${msg}`)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: KnowledgeFormData) => knowledgeApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
      toast.success('Knowledge base updated')
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err)
      toast.error(`Failed to update: ${msg}`)
    },
  })

  const handleSave = () => {
    setSaveError(null)
    const result = kbSchema.safeParse(formData)
    if (!result.success) {
      const msgs = result.error.errors.map((e) => e.message)
      const fieldErrors: Partial<Record<keyof KnowledgeFormData, string>> = {}
      result.error.errors.forEach((e) => {
        const field = e.path[0] as keyof KnowledgeFormData
        if (!fieldErrors[field]) fieldErrors[field] = e.message
      })
      setErrors(fieldErrors)
      toast.error(msgs.join('. '))
      return
    }
    setErrors({})
    if (!orgId) {
      const msg = 'Organization not loaded. Please wait and try again.'
      setSaveError(msg)
      toast.error(msg)
      return
    }
    if (isCreate) {
      createMutation.mutate(result.data)
    } else if (isEdit) {
      updateMutation.mutate(result.data)
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending

  const handleSearch = async () => {
    if (!searchQuery.trim() || !id) return
    setSearching(true)
    setHasSearched(true)
    try {
      const res = await knowledgeApi.searchChunks(id, searchQuery.trim(), 10)
      setSearchResults((res.data.data || []) as typeof searchResults)
    } catch {
      toast.error('Search failed')
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

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

  if (isEdit && isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-8 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </PageContainer>
    )
  }

  if (isEdit && kbError) {
    return (
      <PageContainer>
        <PageHeader
          title="Error"
          description="Failed to load knowledge base"
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/knowledge')}>
              <ArrowLeft className="size-3.5 mr-1.5" />
              Back
            </Button>
          }
        />
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {kbError instanceof Error ? kbError.message : 'Something went wrong'}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <button
              onClick={() => navigate('/knowledge')}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors -ml-1"
            >
              <ArrowLeft className="size-4" />
            </button>
            <h1 className="text-xl font-bold tracking-tight truncate">
              {isCreate ? 'Create Knowledge Base' : kb?.name || 'Knowledge Base'}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground ml-10">
            {isCreate
              ? 'Create a knowledge base, then add documents for RAG'
              : kb?.description || `${documentCount} document${documentCount !== 1 ? 's' : ''} · ${readyCount} ready`}
          </p>
        </div>
        {!isCreate && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSourceModalOpen(true)}
              className="gap-1.5"
            >
              <Plus className="size-3.5" />
              Add Source
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
        {isCreate && (
          <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5 shrink-0">
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            {saving ? 'Creating...' : 'Create'}
          </Button>
        )}
      </div>

      {isEdit && kb && (
        <WorkflowSteps currentStep={workflowStep} />
      )}

      {saveError && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {saveError}
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-card p-5">
        <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Details</p>
        <KnowledgeForm
          data={formData}
          onChange={setFormData}
          errors={errors}
          disabled={saving}
        />
      </div>

      {isEdit && kb && (
        <>
          <div className="rounded-xl border border-border/60 bg-card">
            <div className="flex items-center justify-between p-4 border-b border-border/60">
              <div>
                <p className="text-sm font-semibold">Sources</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {documentCount === 0
                    ? 'Add your first source to get started'
                    : `${documentCount} document${documentCount !== 1 ? 's' : ''} · ${readyCount} ready for RAG`}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setSourceModalOpen(true)}
              >
                <Plus className="size-3.5" />
                Add Source
              </Button>
            </div>

            <div className="p-4">
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      onView={setViewDocId}
                      onDelete={handleDeleteDocument}
                      onReprocess={handleReprocess}
                      reprocessing={reprocessingId === doc.id}
                    />
                  ))}
                </div>
              ) : (
                <NoDocuments onAddSource={() => setSourceModalOpen(true)} />
              )}
            </div>
          </div>

          <KbSettingsPanel />
        </>
      )}

      {isEdit && (
        <div className="rounded-xl border border-border/60 bg-card">
          <div className="p-4 border-b border-border/60">
            <p className="text-sm font-semibold">Test</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Search across your indexed content to verify retrieval quality
            </p>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ask a question or type keywords..."
                className="flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={searching || !searchQuery.trim()}
                size="sm"
                className="gap-1.5 shrink-0"
              >
                {searching ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
                Search
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2">
                {searchResults.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="rounded-lg border border-border/60 bg-muted/20 p-3"
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {chunk.documentName}
                      </span>
                      <span className="rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
                        {Math.round(chunk.score * 100)}% match
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-xs text-foreground/90">
                      {chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !searching && hasSearched && (
              <NoSearchResults query={searchQuery} />
            )}

            {searchResults.length === 0 && !searchQuery && (
              <div className="flex items-center gap-2 pt-3 text-xs text-muted-foreground">
                <MessageSquare className="size-3.5" />
                Try searching for topics in your documents to verify retrieval works correctly.
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={!!viewDocId} onOpenChange={(open) => !open && setViewDocId(null)}>
        <DialogContent className="sm:max-w-none w-[90vw] max-h-[85vh] flex flex-col p-0">
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
              {viewDoc?.url ? ` · ${viewDoc.url}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden px-6">
            <Tabs defaultValue="content" className="w-full h-full flex flex-col">
              <TabsList className="mb-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="chunks">
                  Chunks ({viewDocChunks.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="content" className="flex-1 overflow-auto">
                <ScrollArea className="h-full rounded-lg border bg-muted/20 p-4">
                  {viewLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs text-foreground">
                      {viewDoc?.content?.trim()
                        ? viewDoc.content
                        : 'No extracted content yet. Wait for indexing or reprocess the document.'}
                    </pre>
                  )}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="chunks" className="flex-1 overflow-auto">
                <ScrollArea className="h-full rounded-lg border bg-muted/20 p-4">
                  {viewDocChunks.length === 0 ? (
                    <p className="py-8 text-center text-xs text-muted-foreground">
                      No chunks yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {viewDocChunks.map((chunk, i) => (
                        <div
                          key={chunk.id}
                          className="rounded-lg border border-border/40 bg-background/50 p-3"
                        >
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <span className="text-[10px] font-medium text-muted-foreground">
                              #{i + 1}
                            </span>
                            <span
                              className={cn(
                                'rounded px-1.5 py-0.5 text-[10px] font-medium',
                                chunk.hasEmbedding
                                  ? 'bg-success/10 text-success'
                                  : 'bg-destructive/10 text-destructive',
                              )}
                            >
                              {chunk.hasEmbedding ? 'embedded' : 'no embedding'}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap break-words text-xs text-foreground/90">
                            {chunk.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
          <div className="flex justify-end gap-2 px-6 pb-4 pt-2 border-t border-border/60">
            {viewDocId && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={
                    viewDoc?.status === 'processing' || viewDoc?.status === 'pending'
                  }
                  onClick={() => handleReprocess(viewDocId)}
                >
                  Re-index
                </Button>
                <Button size="sm" onClick={() => setViewDocId(null)}>
                  Close
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <SourcePickerModal
        open={sourceModalOpen}
        onOpenChange={setSourceModalOpen}
        onSelect={() => {
          setSourceModalOpen(false)
        }}
      />
    </PageContainer>
  )
}
