import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Save, AlertCircle } from 'lucide-react'
import { z } from 'zod'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BotForm } from '@/components/chatbots/bot-form'
import type { BotFormData } from '@/components/chatbots/bot-form'
import { BotChatPanel } from '@/components/chatbots/bot-chat-panel'
import { bots as botsApi, agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

type BotStatus = 'draft' | 'active' | 'paused' | 'archived'

interface Chatbot {
  id: string
  name: string
  description?: string
  avatar?: string
  widgetColor: string
  status: BotStatus
  agentId: string
  welcomeMessage?: string
  organizationId: string
}

interface AgentDetail {
  model: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  providerKeyId?: string | null
}

const botSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().default(''),
  agentId: z.string().min(1, 'Please select an agent'),
  welcomeMessage: z.string().max(500).optional().default(''),
  widgetColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color'),
  avatar: z.string().optional().default(''),
  status: z.enum(['draft', 'active', 'paused', 'archived']),
})

const defaultFormData: BotFormData = {
  name: '',
  description: '',
  agentId: '',
  welcomeMessage: '',
  widgetColor: '#fb923c',
  avatar: '',
  status: 'draft',
}

export default function BotEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
  const isCreate = !id

  const [formData, setFormData] = useState<BotFormData>(defaultFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof BotFormData, string>>>({})
  const [saveError, setSaveError] = useState<string | null>(null)

  const { data: existingBot, isLoading } = useQuery({
    queryKey: ['chatbot', id],
    queryFn: async () => {
      const res = await botsApi.get(id!)
      return res.data.data as Chatbot
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (existingBot) {
      setFormData({
        name: existingBot.name,
        description: existingBot.description || '',
        agentId: existingBot.agentId,
        welcomeMessage: existingBot.welcomeMessage || '',
        widgetColor: existingBot.widgetColor || '#fb923c',
        avatar: existingBot.avatar || '',
        status: existingBot.status || 'draft',
      })
    }
  }, [existingBot])

  const { data: linkedAgent } = useQuery({
    queryKey: ['agent', formData.agentId],
    queryFn: async () => {
      const res = await agentsApi.get(formData.agentId)
      return res.data.data as AgentDetail
    },
    enabled: !!formData.agentId && formData.agentId.length > 0,
  })

  const createMutation = useMutation({
    mutationFn: (data: BotFormData) =>
      botsApi.create({ ...data, organizationId: orgId! } as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots'] })
      navigate('/chatbots')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to create bot'
      setSaveError(msg)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: BotFormData) => botsApi.update(id!, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots'] })
      navigate('/chatbots')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update bot'
      setSaveError(msg)
    },
  })

  const saving = createMutation.isPending || updateMutation.isPending

  const handleSave = () => {
    setSaveError(null)
    const result = botSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof BotFormData, string>> = {}
      result.error.errors.forEach((e) => {
        const field = e.path[0] as keyof BotFormData
        if (!fieldErrors[field]) fieldErrors[field] = e.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    const payload = result.data
    if (payload.avatar === '') delete (payload as any).avatar
    if (isCreate) {
      createMutation.mutate(payload)
    } else {
      updateMutation.mutate(payload)
    }
  }

  if (id && isLoading) {
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

  const agentConfig = linkedAgent
    ? {
        model: linkedAgent.model,
        systemPrompt: linkedAgent.systemPrompt,
        temperature: linkedAgent.temperature,
        maxTokens: linkedAgent.maxTokens,
        providerKeyId: linkedAgent.providerKeyId || undefined,
      }
    : undefined

  return (
    <PageContainer>
      <PageHeader
        title={isCreate ? 'Create Bot' : 'Edit Bot'}
        description={isCreate ? 'Configure a new chatbot' : 'Update your chatbot configuration'}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/chatbots')}>
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
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {saveError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Set up your bot details and behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <BotForm
                data={formData}
                onChange={setFormData}
                errors={errors}
                disabled={saving}
                isCreate={isCreate}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-6">
            {agentConfig ? (
              <BotChatPanel
                botName={formData.name}
                widgetColor={formData.widgetColor}
                avatar={formData.avatar}
                agentConfig={agentConfig}
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                <p className="text-sm text-muted-foreground">
                  {formData.agentId ? 'Loading agent config...' : 'Select an agent to preview the chatbot'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
