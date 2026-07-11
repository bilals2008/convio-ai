import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Loader2,
  Save,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { z } from 'zod'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Section } from '@/components/shared/page-container'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { KnowledgeForm } from '@/components/knowledge/knowledge-form'
import type { KnowledgeFormData } from '@/components/knowledge/knowledge-form'
import { DocumentCard } from '@/components/knowledge/document-card'
import type { DocumentItem } from '@/components/knowledge/document-card'
import { DocumentStatusBadge } from '@/components/knowledge/document-status-badge'
import { DocumentTypeBadge } from '@/components/knowledge/document-type-badge'
import { DocumentUploadForm } from '@/components/knowledge/document-upload-form'
import { knowledge as knowledgeApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type DocType = 'txt' | 'pdf' | 'csv' | 'md' | 'json' | 'url'

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

export default function KnowledgeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
  const isCreate = id === 'new'
  const isEdit = !!id && !isCreate

  const [formData, setFormData] = useState<KnowledgeFormData>(defaultFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof KnowledgeFormData, string>>>({})
  const [uploadLoading, setUploadLoading] = useState(false)
  const [viewDocId, setViewDocId] = useState<string | null>(null)
  const [reprocessingId, setReprocessingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

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

  const documentCount = kb?.documentCount ?? documents.length
  const readyCount =
    kb?.readyCount ?? documents.filter((d) => d.status === 'ready').length
  const processingCount =
    kb?.processingCount ??
    documents.filter((d) => d.status === 'pending' || d.status === 'processing').length
  const errorCount =
    kb?.errorCount ?? documents.filter((d) => d.status === 'error').length

  useEffect(() => {
    if (kb) {
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
    } else {
      toast.error('Cannot save: unknown page state')
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending

  const handleUploadDocument = async (data: {
    name: string
    type: DocType
    content?: string
    url?: string
  }) => {
    if (!isEdit || !id) return
    if (data.type === 'pdf') {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-documents', id] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
      toast.success('PDF uploaded — indexing for RAG…')
      return
    }
    setUploadLoading(true)
    try {
      await knowledgeApi.uploadDocument(id, data)
      queryClient.invalidateQueries({ queryKey: ['knowledge-base-documents', id] })
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
      toast.success('Document added — indexing for RAG…')
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined
      toast.error(message || 'Failed to upload document')
    } finally {
      setUploadLoading(false)
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
        <PageHeader title="Loading..." />
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
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
            <Button variant="outline" onClick={() => navigate('/knowledge')}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
          }
        />
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {kbError instanceof Error ? kbError.message : 'Something went wrong'}
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={isCreate ? 'Create Knowledge Base' : kb?.name || 'Knowledge Base'}
        description={
          isCreate
            ? 'Create a knowledge base, then add documents for RAG'
            : kb?.description || 'Manage documents and indexing status'
        }
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/knowledge')}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      />

      {saveError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {saveError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>Name and description of your knowledge base</CardDescription>
        </CardHeader>
        <CardContent>
          <KnowledgeForm
            data={formData}
            onChange={setFormData}
            errors={errors}
            disabled={saving}
          />
        </CardContent>
      </Card>

      {isEdit && kb && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              {
                label: 'Documents',
                value: documentCount,
                icon: FileText,
                tone: 'text-foreground bg-muted/50',
              },
              {
                label: 'Ready (RAG)',
                value: readyCount,
                icon: CheckCircle2,
                tone: 'text-success bg-success/10',
              },
              {
                label: 'Indexing',
                value: processingCount,
                icon: Loader2,
                tone: 'text-info bg-info/10',
                spin: processingCount > 0,
              },
              {
                label: 'Errors',
                value: errorCount,
                icon: AlertCircle,
                tone: 'text-destructive bg-destructive/10',
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 p-3.5"
              >
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-lg',
                    stat.tone,
                  )}
                >
                  <stat.icon className={cn('size-4', stat.spin && 'animate-spin')} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                  <p className="text-base font-bold tabular-nums">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <Section
            title="Documents"
            description={`${documentCount} document${documentCount !== 1 ? 's' : ''} · indexed for retrieval-augmented generation`}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <CardTitle className="text-base">Add source</CardTitle>
                </div>
                <CardDescription>
                  Upload a PDF, paste text, or index a URL. Status moves Pending → Indexing → Ready.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentUploadForm
                  onSubmit={handleUploadDocument}
                  knowledgeBaseId={id!}
                  loading={uploadLoading}
                />
              </CardContent>
            </Card>

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
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-12 text-center">
                <FileText className="mb-3 size-8 text-muted-foreground/40" />
                <p className="text-sm font-medium">No documents yet</p>
                <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                  Add text, PDFs, or URLs above. Once status is Ready, agents using this knowledge
                  base will retrieve matching chunks in chat.
                </p>
              </div>
            )}
          </Section>
        </>
      )}

      <Dialog open={!!viewDocId} onOpenChange={(open) => !open && setViewDocId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
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
          <ScrollArea className="max-h-[50vh] rounded-lg border bg-muted/20 p-4">
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
          {viewDocId && (
            <div className="flex justify-end gap-2">
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}
