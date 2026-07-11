import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

const agentDetailSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  description: z.string(),
  model: z.string().min(1, 'Please select a model'),
  systemPrompt: z.string(),
  temperature: z.number().min(0).max(2),
  reasoningEffort: z.string(),
  toneOfVoice: z.string(),
  language: z.string(),
  maxTokens: z.number(),
})

type AgentDetailValues = z.infer<typeof agentDetailSchema>

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState('overview')
  const [capabilities, setCapabilities] = useState(defaultCapabilities)

  const form = useForm({
    resolver: zodResolver(agentDetailSchema),
    defaultValues: {
      name: '',
      description: '',
      model: '',
      systemPrompt: '',
      temperature: 0.7,
      reasoningEffort: 'medium',
      toneOfVoice: 'friendly',
      language: 'english',
      maxTokens: 2048,
    },
  })

  const tabsRootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = tabsRootRef.current
    if (!root) return
    const active = root.querySelector('[data-active]')
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [activeTab])

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
      form.reset({
        name: agent.name,
        description: agent.description || '',
        model: agent.model,
        systemPrompt: agent.systemPrompt,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens || 2048,
        reasoningEffort: (agent as any).reasoningEffort || 'medium',
        toneOfVoice: 'friendly',
        language: 'english',
      })
    }
  }, [agent, form])

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

  const handleSave = form.handleSubmit((data) => {
    updateMutation.mutate({
      name: data.name,
      description: data.description,
      model: data.model,
      systemPrompt: data.systemPrompt,
      temperature: data.temperature,
      reasoningEffort: data.reasoningEffort,
      maxTokens: data.maxTokens,
    })
  })

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

  const values = form.watch()

  return (
    <Tabs ref={tabsRootRef} value={activeTab} onValueChange={setActiveTab}>
      <AgentDetailLayout
        agentName={values.name || agent.name}
        agentAvatar={agent.avatar}
        agentDescription={values.description || agent.description}
        isSaving={updateMutation.isPending}
        onSave={handleSave}
        onCopyLink={() => navigator.clipboard.writeText(window.location.href)}
        onDelete={() => {
          if (confirm('Are you sure you want to delete this agent?')) {
            deleteMutation.mutate()
          }
        }}
        tabs={
          <TabsList variant="line" className="!h-11 flex-nowrap whitespace-nowrap md:!h-10 w-max">
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
            control={form.control}
            capabilities={capabilities}
            onCapabilityToggle={handleCapabilityToggle}
            disabled={updateMutation.isPending}
            models={models}
            modelsLoading={modelsLoading}
            modelsError={modelsError}
            modelsErrorMessage={modelsErrorObj instanceof Error ? modelsErrorObj.message : undefined}
          />
        </TabsContent>

        <TabsContent value="knowledge">
          <AgentKnowledge
            agentId={id!}
            knowledgeBaseId={agent.knowledgeBaseId}
            disabled={updateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="test-chat">
          <AgentTestChat
            agentId={id!}
            agentConfig={{
              name: values.name,
              model: values.model,
              systemPrompt: values.systemPrompt,
              temperature: values.temperature,
              maxTokens: values.maxTokens,
              reasoningEffort: values.reasoningEffort,
              providerKeyId: agent.providerKeyId || undefined,
              knowledgeBaseId: agent.knowledgeBaseId || null,
            }}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <AgentAnalytics agentId={id!} />
        </TabsContent>

        <TabsContent value="settings">
          <AgentSettings
            agentModel={agent.model}
            hasKnowledgeBase={!!agent.knowledgeBaseId}
            hasProviderKey={!!agent.providerKeyId}
            createdAt={agent.createdAt}
            deploymentOptions={deploymentOptions}
            onDeploymentToggle={handleDeploymentToggle}
            disabled={updateMutation.isPending}
          />
        </TabsContent>
      </AgentDetailLayout>
    </Tabs>
  )
}
