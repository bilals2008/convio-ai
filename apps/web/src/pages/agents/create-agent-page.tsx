import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Sparkles, Globe, Link, Code, MessageCircle } from 'lucide-react'
import { z } from 'zod'
import { PageContainer } from '@/components/shared/page-container'
import { Button } from '@/components/ui/button'
import { AgentBasicInfo } from '@/components/agents/agent-basic-info'
import { AgentCapabilities, defaultCapabilities } from '@/components/agents/agent-capabilities'
import { AgentKnowledgeSources } from '@/components/agents/agent-knowledge-sources'
import { AgentDeployment } from '@/components/agents/agent-deployment'
import { AgentBehaviorSettings } from '@/components/agents/agent-behavior-settings'
import { agents as agentsApi, chat as chatApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

const createSchema = z.object({
  name: z.string().min(1, 'Agent name is required').max(50, 'Name must be 50 characters or less'),
  model: z.string().min(1, 'Please select a model'),
  systemPrompt: z.string().optional(),
})

export default function CreateAgentPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [capabilities, setCapabilities] = useState(defaultCapabilities)
  const [deploymentOptions, setDeploymentOptions] = useState([
    { id: 'web-chat-widget', enabled: true },
    { id: 'shareable-link', enabled: false },
    { id: 'api-access', enabled: false },
    { id: 'whatsapp', enabled: false },
  ])
  const [toneOfVoice, setToneOfVoice] = useState('friendly')
  const [language, setLanguage] = useState('english')
  const [model, setModel] = useState('')
  const [temperature, setTemperature] = useState(0.7)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: models = [] } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const res = await chatApi.models()
      return (res.data.data || []) as Array<{ id: string; name: string; provider?: string }>
    },
  })

  const selectedModel = model || models[0]?.id || ''

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => agentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      navigate('/agents')
    },
  })

  const handleCapabilityToggle = (id: string, enabled: boolean) => {
    setCapabilities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled } : c))
    )
  }

  const handleDeploymentToggle = (id: string, enabled: boolean) => {
    setDeploymentOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, enabled } : o))
    )
  }

  const handleCreate = () => {
    const result = createSchema.safeParse({ name, model: model || models[0]?.id || '', systemPrompt })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.errors.forEach((e) => {
        const field = e.path[0] as string
        if (!fieldErrors[field]) {
          fieldErrors[field] = e.message
        }
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})

    createMutation.mutate({
      name,
      description,
      avatar: avatarUrl || undefined,
      model: selectedModel,
      systemPrompt: systemPrompt || `You are ${name}, a helpful AI assistant.`,
      temperature,
      maxTokens: 2048,
      organizationId: orgId,
      capabilities: capabilities.filter((c) => c.enabled).map((c) => c.id),
      deployment: deploymentOptions.filter((o) => o.enabled).map((o) => o.id),
      settings: {
        toneOfVoice,
        language,
      },
    })
  }

  const saving = createMutation.isPending

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create New Agent</h1>
          <p className="text-muted-foreground mt-1">
            Build a powerful AI agent tailored to your business needs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/agents')}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {saving ? 'Creating...' : 'Create Agent'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <AgentBasicInfo
            name={name}
            description={description}
            avatarUrl={avatarUrl}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onAvatarUrlChange={setAvatarUrl}
            errors={{ name: errors.name }}
            disabled={saving}
          />

          {errors.model && (
            <p className="text-xs text-destructive flex items-center gap-1.5 bg-destructive/5 rounded-lg px-3 py-2">
              {errors.model}
            </p>
          )}

          <AgentKnowledgeSources />

          <AgentBehaviorSettings
            toneOfVoice={toneOfVoice}
            language={language}
            model={selectedModel}
            temperature={temperature}
            systemPrompt={systemPrompt}
            models={models}
            onToneChange={setToneOfVoice}
            onLanguageChange={setLanguage}
            onModelChange={setModel}
            onTemperatureChange={setTemperature}
            onSystemPromptChange={setSystemPrompt}
            disabled={saving}
          />
        </div>

        <div className="space-y-4">
          <AgentCapabilities
            capabilities={capabilities}
            onToggle={handleCapabilityToggle}
            disabled={saving}
          />

          <AgentDeployment
            options={[
              { id: 'web-chat-widget', label: 'Web Chat Widget', description: 'Embed on website', icon: <Globe className="size-4" />, enabled: deploymentOptions.find(o => o.id === 'web-chat-widget')?.enabled ?? true },
              { id: 'shareable-link', label: 'Shareable Link', description: 'Public chat URL', icon: <Link className="size-4" />, enabled: deploymentOptions.find(o => o.id === 'shareable-link')?.enabled ?? false },
              { id: 'api-access', label: 'API Access', description: 'REST API endpoint', icon: <Code className="size-4" />, enabled: deploymentOptions.find(o => o.id === 'api-access')?.enabled ?? false },
              { id: 'whatsapp', label: 'WhatsApp', description: 'WhatsApp Business', icon: <MessageCircle className="size-4" />, enabled: deploymentOptions.find(o => o.id === 'whatsapp')?.enabled ?? false },
            ]}
            onToggle={handleDeploymentToggle}
            disabled={saving}
          />
        </div>
      </div>
    </PageContainer>
  )
}
