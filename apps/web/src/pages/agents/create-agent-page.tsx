import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Sparkles, Globe, Link, Code, MessageCircle } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { Button } from '@/components/ui/button'
import { AgentBasicInfo } from '@/components/agents/agent-basic-info'
import { AgentCapabilities, defaultCapabilities } from '@/components/agents/agent-capabilities'
import { AgentKnowledgeSources } from '@/components/agents/agent-knowledge-sources'
import { AgentDeployment } from '@/components/agents/agent-deployment'
import { AgentBehaviorSettings } from '@/components/agents/agent-behavior-settings'
import { agents as agentsApi, chat as chatApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

export default function CreateAgentPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [capabilities, setCapabilities] = useState(defaultCapabilities)
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<string[]>([])
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
  const [errors, setErrors] = useState<{ name?: string }>({})

  const { data: models = [], isLoading: modelsLoading } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const res = await chatApi.models()
      return (res.data.data || []) as Array<{ id: string; name: string }>
    },
  })

  useEffect(() => {
    if (models.length > 0 && !model) {
      setModel(models[0].id)
    }
  }, [models, model])

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

  const handleKnowledgeSourceSelect = (id: string) => {
    setSelectedKnowledgeSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleDeploymentToggle = (id: string, enabled: boolean) => {
    setDeploymentOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, enabled } : o))
    )
  }

  const handleCreate = () => {
    if (!name.trim()) {
      setErrors({ name: 'Name is required' })
      return
    }
    setErrors({})

    createMutation.mutate({
      name,
      description,
      model,
      systemPrompt: systemPrompt || `You are ${name}, a helpful AI assistant.`,
      temperature,
      maxTokens: 2048,
      organizationId: orgId,
      capabilities: capabilities.filter((c) => c.enabled).map((c) => c.id),
      knowledgeSources: selectedKnowledgeSources,
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AgentBasicInfo
            name={name}
            description={description}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            errors={errors}
            disabled={saving}
          />

          <AgentKnowledgeSources
            selected={selectedKnowledgeSources}
            onSelect={handleKnowledgeSourceSelect}
            disabled={saving}
          />

          <AgentBehaviorSettings
            toneOfVoice={toneOfVoice}
            language={language}
            model={model}
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

        <div className="space-y-6">
          <AgentCapabilities
            capabilities={capabilities}
            onToggle={handleCapabilityToggle}
            disabled={saving}
          />

          <AgentDeployment
            options={[
              { id: 'web-chat-widget', label: 'Web Chat Widget', description: 'Add to your website', icon: <Globe className="size-4" />, enabled: deploymentOptions.find(o => o.id === 'web-chat-widget')?.enabled ?? true },
              { id: 'shareable-link', label: 'Shareable Link', description: 'Create a public link', icon: <Link className="size-4" />, enabled: deploymentOptions.find(o => o.id === 'shareable-link')?.enabled ?? false },
              { id: 'api-access', label: 'API Access', description: 'Access via API', icon: <Code className="size-4" />, enabled: deploymentOptions.find(o => o.id === 'api-access')?.enabled ?? false },
              { id: 'whatsapp', label: 'WhatsApp', description: 'Connect on WhatsApp', icon: <MessageCircle className="size-4" />, enabled: deploymentOptions.find(o => o.id === 'whatsapp')?.enabled ?? false },
            ]}
            onToggle={handleDeploymentToggle}
            disabled={saving}
          />
        </div>
      </div>
    </PageContainer>
  )
}
