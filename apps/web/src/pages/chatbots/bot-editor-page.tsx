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
import { BotForm } from '@/components/chatbots/bot-form'
import type { BotFormData } from '@/components/chatbots/bot-form'
import { BotWidgetPreview } from '@/components/chatbots/bot-widget-preview'
import { bots as botsApi } from '@/lib/api'

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

const botSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
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

const MOCK_ORG_ID = 'mock-org-id'

export default function BotEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isCreate = !id

  const [formData, setFormData] = useState<BotFormData>(defaultFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof BotFormData, string>>>({})

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

  const createMutation = useMutation({
    mutationFn: (data: BotFormData) =>
      botsApi.create({ ...data, organizationId: MOCK_ORG_ID }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots'] })
      navigate('/chatbots')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: BotFormData) => botsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots'] })
      navigate('/chatbots')
    },
  })

  const saving = createMutation.isPending || updateMutation.isPending

  const handleSave = () => {
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
    if (isCreate) {
      createMutation.mutate(result.data)
    } else {
      updateMutation.mutate(result.data)
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
            <BotWidgetPreview
              name={formData.name}
              welcomeMessage={formData.welcomeMessage}
              widgetColor={formData.widgetColor}
              avatar={formData.avatar}
            />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
