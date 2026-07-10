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
import { AgentForm } from '@/components/agents/agent-form'
import type { AgentFormData } from '@/components/agents/agent-form'
import { AgentChatPanel } from '@/components/agents/agent-chat-panel'
import { agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

const agentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().max(500).optional().default(''),
  model: z.string().min(1, 'Model is required'),
  systemPrompt: z.string().min(10, 'System prompt must be at least 10 characters'),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().min(100).max(8192),
  providerKeyId: z.string().optional(),
  knowledgeBaseId: z.string().optional(),
})

const defaultFormData: AgentFormData = {
  name: '',
  description: '',
  model: 'auto/best-chat',
  systemPrompt: '',
  temperature: 0.7,
  maxTokens: 2048,
  providerKeyId: undefined,
  knowledgeBaseId: undefined,
}

interface Agent {
  id: string
  name: string
  description?: string
  model: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  providerKeyId?: string | null
  knowledgeBaseId?: string | null
  organizationId: string
}

export default function AgentEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
  const isEdit = !!id

  const [formData, setFormData] = useState<AgentFormData>(defaultFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof AgentFormData, string>>>({})
  const [showErrors, setShowErrors] = useState(false)

  const { data: existingAgent, isLoading } = useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      const res = await agentsApi.get(id!)
      return res.data.data as Agent
    },
    enabled: isEdit,
  })

  useEffect(() => {
    if (existingAgent) {
      setFormData({
        name: existingAgent.name,
        description: existingAgent.description || '',
        model: existingAgent.model,
        systemPrompt: existingAgent.systemPrompt,
        temperature: existingAgent.temperature,
        maxTokens: existingAgent.maxTokens || 2048,
        providerKeyId: existingAgent.providerKeyId || undefined,
        knowledgeBaseId: existingAgent.knowledgeBaseId || undefined,
      })
    }
  }, [existingAgent])

  const createMutation = useMutation({
    mutationFn: (data: AgentFormData) =>
      agentsApi.create({ ...data, organizationId: orgId! } as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      navigate('/agents')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: AgentFormData) => agentsApi.update(id!, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      navigate('/agents')
    },
  })

  const saving = createMutation.isPending || updateMutation.isPending

  const handleSave = () => {
    const result = agentSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof AgentFormData, string>> = {}
      result.error.errors.forEach((e) => {
        const field = e.path[0] as keyof AgentFormData
        if (!fieldErrors[field]) {
          fieldErrors[field] = e.message
        }
      })
      setErrors(fieldErrors)
      setShowErrors(true)
      return
    }

    setErrors({})
    setShowErrors(false)
    if (isEdit) {
      updateMutation.mutate(result.data)
    } else {
      createMutation.mutate(result.data)
    }
  }

  if (isEdit && isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Loading..." />
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader
        title={isEdit ? 'Edit Agent' : 'Create Agent'}
        description={
          isEdit
            ? 'Update your agent configuration'
            : 'Configure a new AI agent'
        }
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/agents')}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        }
      />

      {showErrors && Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Please fix the following errors before saving:
          <ul className="mt-1 list-disc list-inside space-y-0.5 text-xs text-destructive/80">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>
                <span className="capitalize font-medium">{field}</span>: {message}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Configure your agent&apos;s behavior and model</CardDescription>
            </CardHeader>
                <CardContent>
              <AgentForm
                data={formData}
                onChange={(data) => {
                  setFormData(data)
                  if (showErrors) setErrors({})
                }}
                errors={errors}
                disabled={saving}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-6">
            <AgentChatPanel
              agentConfig={{
                name: formData.name,
                model: formData.model,
                systemPrompt: formData.systemPrompt,
                temperature: formData.temperature,
                maxTokens: formData.maxTokens,
                providerKeyId: formData.providerKeyId,
              }}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
