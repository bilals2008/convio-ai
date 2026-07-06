import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { z } from 'zod'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Section } from '@/components/shared/page-container'
import { KnowledgeForm } from '@/components/knowledge/knowledge-form'
import type { KnowledgeFormData } from '@/components/knowledge/knowledge-form'
import { DocumentCard } from '@/components/knowledge/document-card'
import { DocumentUploadForm } from '@/components/knowledge/document-upload-form'
import { knowledge as knowledgeApi } from '@/lib/api'

type DocType = 'txt' | 'pdf' | 'csv' | 'md' | 'json' | 'url'
type DocStatus = 'pending' | 'processing' | 'ready' | 'error' | 'archived'

interface DocumentItem {
  id: string
  name: string
  type: DocType
  status: DocStatus
  content?: string
  url?: string
  createdAt: string
}

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  documentCount: number
  documents?: DocumentItem[]
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

const MOCK_ORG_ID = 'mock-org-id'

export default function KnowledgeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isCreate = id === 'new'
  const isEdit = !!id && !isCreate

  const [formData, setFormData] = useState<KnowledgeFormData>(defaultFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof KnowledgeFormData, string>>>({})
  const [uploadLoading, setUploadLoading] = useState(false)

  const { data: kb, isLoading } = useQuery({
    queryKey: ['knowledge-base', id],
    queryFn: async () => {
      const res = await knowledgeApi.get(id!)
      return res.data.data as KnowledgeBase
    },
    enabled: isEdit,
  })

  useEffect(() => {
    if (kb) {
      setFormData({ name: kb.name, description: kb.description || '' })
    }
  }, [kb])

  const createMutation = useMutation({
    mutationFn: (data: KnowledgeFormData) =>
      knowledgeApi.create({ ...data, organizationId: MOCK_ORG_ID }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      navigate('/knowledge')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: KnowledgeFormData) => knowledgeApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
    },
  })

  const handleSave = () => {
    const result = kbSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof KnowledgeFormData, string>> = {}
      result.error.errors.forEach((e) => {
        const field = e.path[0] as keyof KnowledgeFormData
        if (!fieldErrors[field]) fieldErrors[field] = e.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    if (isCreate) {
      createMutation.mutate(result.data)
    } else if (isEdit) {
      updateMutation.mutate(result.data)
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending

  const handleUploadDocument = (data: { name: string; type: DocType; content?: string; url?: string }) => {
    if (!isEdit || !id) return
    setUploadLoading(true)
    knowledgeApi.uploadDocument(id, data).finally(() => {
      setUploadLoading(false)
      queryClient.invalidateQueries({ queryKey: ['knowledge-base', id] })
    })
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

  return (
    <PageContainer>
      <PageHeader
        title={isCreate ? 'Create Knowledge Base' : kb?.name || 'Knowledge Base'}
        description={isCreate ? 'Create a new knowledge base' : kb?.description || ''}
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
          <Section title="Documents" description={`${kb.documents?.length || 0} documents in this knowledge base`}>
            <Card>
              <CardContent className="pt-6">
                <DocumentUploadForm onSubmit={handleUploadDocument} loading={uploadLoading} />
              </CardContent>
            </Card>

            {kb.documents && kb.documents.length > 0 && (
              <div className="space-y-2">
                {kb.documents.map((doc) => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    onView={() => {}}
                    onDelete={() => {}}
                  />
                ))}
              </div>
            )}
          </Section>
        </>
      )}
    </PageContainer>
  )
}
