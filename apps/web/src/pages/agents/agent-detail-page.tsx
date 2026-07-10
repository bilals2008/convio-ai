import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Loader2,
  LayoutDashboard,
  Settings,
  BookOpen,
  Wrench,
  MessageSquare,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { defaultCapabilities } from '@/components/agents/agent-capabilities'
import { AgentDetailLayout } from '@/components/agents/agent-detail-layout'
import {
  AgentOverview,
  AgentBuilder,
  AgentKnowledge,
  AgentTestChat,
  AgentAnalytics,
  AgentSettings,
} from '@/components/agents/agent-detail'
import { agents as agentsApi } from '@/lib/api'
import { useAvailableModels } from '@/lib/hooks/use-available-models'

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
  avatar?: string | null
  organizationId: string
  createdAt: string
  updatedAt: string
}

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('overview')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('gpt-4o')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2048)
  const [reasoningEffort, setReasoningEffort] = useState('medium')
  const [toneOfVoice, setToneOfVoice] = useState('friendly')
  const [language, setLanguage] = useState('english')
  const [capabilities, setCapabilities] = useState(defaultCapabilities)

  const { data: models = [], isLoading: modelsLoading, isError: modelsError, error: modelsErrorObj } = useAvailableModels()
  const [deploymentOptions, setDeploymentOptions] = useState([
    { id: 'web-chat-widget', enabled: true },
    { id: 'shareable-link', enabled: false },
    { id: 'api-access', enabled: false },
    { id: 'whatsapp', enabled: false },
  ])

  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      const res = await agentsApi.get(id!)
      return res.data.data as Agent
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (agent) {
      setName(agent.name)
      setDescription(agent.description || '')
      setModel(agent.model)
      setSystemPrompt(agent.systemPrompt)
      setTemperature(agent.temperature)
      setMaxTokens(agent.maxTokens || 2048)
      setReasoningEffort((agent as any).reasoningEffort || 'medium')
    }
  }, [agent])

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => agentsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      queryClient.invalidateQueries({ queryKey: ['agent', id] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => agentsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      navigate('/agents')
    },
  })

  const handleSave = () => {
    updateMutation.mutate({
      name,
      description,
      model,
      systemPrompt,
      temperature,
      reasoningEffort,
      maxTokens,
    })
  }

  const handleCapabilityToggle = (capabilityId: string, enabled: boolean) => {
    setCapabilities((prev) =>
      prev.map((c) => (c.id === capabilityId ? { ...c, enabled } : c))
    )
  }

  const handleDeploymentToggle = (optionId: string, enabled: boolean) => {
    setDeploymentOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, enabled } : o))
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Agent not found</p>
        <Button variant="outline" onClick={() => navigate('/agents')} className="mt-4">
          Back to Agents
        </Button>
      </div>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <AgentDetailLayout
        agentName={agent.name}
        agentAvatar={agent.avatar}
        agentDescription={agent.description}
        isSaving={updateMutation.isPending}
        onSave={handleSave}
        onCopyLink={() => navigator.clipboard.writeText(window.location.href)}
        onDelete={() => {
          if (confirm('Are you sure you want to delete this agent?')) {
            deleteMutation.mutate()
          }
        }}
        tabs={
          <TabsList variant="line">
            <TabsTrigger value="overview">
              <LayoutDashboard className="size-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="builder">
              <Wrench className="size-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="knowledge">
              <BookOpen className="size-4" />
              Knowledge
            </TabsTrigger>
            <TabsTrigger value="test-chat">
              <MessageSquare className="size-4" />
              Test Chat
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="size-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="size-4" />
              Settings
            </TabsTrigger>
          </TabsList>
        }
      >
        <TabsContent value="overview">
          <AgentOverview
            agentName={agent.name}
            agentAvatar={agent.avatar}
            agentDescription={agent.description}
            agentModel={agent.model}
            agentCreatedAt={agent.createdAt}
            agentUpdatedAt={agent.updatedAt}
            hasProviderKey={!!agent.providerKeyId}
            hasKnowledgeBase={!!agent.knowledgeBaseId}
            systemPrompt={agent.systemPrompt}
            onNavigateToTab={setActiveTab}
          />
        </TabsContent>

        <TabsContent value="builder">
          <AgentBuilder
            name={name}
            description={description}
            model={model}
            systemPrompt={systemPrompt}
            temperature={temperature}
            reasoningEffort={reasoningEffort}
            toneOfVoice={toneOfVoice}
            language={language}
            capabilities={capabilities}
            models={models}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onModelChange={setModel}
            onSystemPromptChange={setSystemPrompt}
            onTemperatureChange={setTemperature}
            onReasoningEffortChange={setReasoningEffort}
            onToneChange={setToneOfVoice}
            onLanguageChange={setLanguage}
            onCapabilityToggle={handleCapabilityToggle}
            disabled={updateMutation.isPending}
            modelsLoading={modelsLoading}
            modelsError={modelsError}
            modelsErrorMessage={modelsErrorObj instanceof Error ? modelsErrorObj.message : undefined}
          />
        </TabsContent>

        <TabsContent value="knowledge">
          <AgentKnowledge />
        </TabsContent>

        <TabsContent value="test-chat">
          <AgentTestChat
            agentConfig={{
              name: agent.name,
              model: agent.model,
              systemPrompt: agent.systemPrompt,
              temperature: agent.temperature,
              maxTokens: agent.maxTokens,
              reasoningEffort: reasoningEffort,
              providerKeyId: agent.providerKeyId || undefined,
            }}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AgentAnalytics />
        </TabsContent>

        <TabsContent value="settings">
          <AgentSettings
            deploymentOptions={deploymentOptions}
            onDeploymentToggle={handleDeploymentToggle}
            disabled={updateMutation.isPending}
          />
        </TabsContent>
      </AgentDetailLayout>
    </Tabs>
  )
}
