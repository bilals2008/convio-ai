import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
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
import { builtInTools, type BuiltInTool } from '@/components/agents/agent-tool-picker'
import { AgentDetailLayout } from '@/components/agents/agent-detail-layout'
import {
  AgentOverview,
  AgentBuilder,
  AgentKnowledge,
  AgentTestChat,
  AgentAnalytics,
  AgentSettings,
} from '@/components/agents/agent-detail'
import { agents as agentsApi, deployments as deploymentsApi, widgets, mcpServers as mcpApi } from '@/lib/api'
import { useAvailableModels } from '@/lib/hooks/use-available-models'
import { useOrg } from '@/lib/org-context'

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
  status: string
  welcomeMessage?: string
  widgetColor: string
  widgetConfig?: { tools?: string[] }
}

const agentDetailSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  description: z.string(),
  avatar: z.string().optional(),
  model: z.string().min(1, 'Please select a model'),
  systemPrompt: z.string(),
  temperature: z.number().min(0).max(2),
  reasoningEffort: z.string(),
  maxTokens: z.number(),
})

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { orgId } = useOrg()

  const [activeTab, setActiveTab] = useState('overview')
  const [capabilities, setCapabilities] = useState(defaultCapabilities)
  const [tools, setTools] = useState<BuiltInTool[]>(builtInTools.map((t) => ({ ...t })))
  const [linkedMcpServerIds, setLinkedMcpServerIds] = useState<string[]>([])

  const form = useForm({
    resolver: zodResolver(agentDetailSchema),
    defaultValues: {
      name: '',
      description: '',
      avatar: '',
      model: '',
      systemPrompt: '',
      temperature: 0.7,
      reasoningEffort: 'medium',
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

  const { data: agent, isLoading } = useQuery({
    queryKey: ['agent', id],
    queryFn: async () => {
      const res = await agentsApi.get(id!)
      const agentData = res.data.data ?? res.data
      return agentData as Agent
    },
    enabled: !!id,
  })

  const { data: agentDeployments = [] } = useQuery({
    queryKey: ['agent-deployments', id],
    queryFn: async () => {
      const res = await deploymentsApi.list(id!)
      return (res.data.data ?? []) as Array<{ id: string; channel: string; status: string }>
    },
    enabled: !!id,
  })

  const { data: agentWidgets = [] } = useQuery({
    queryKey: ['agent-widgets', agent?.organizationId],
    queryFn: async () => {
      const res = await widgets.list(agent!.organizationId)
      const items = (res.data.data ?? []) as Array<{ id: string; publicKey: string; agent: { id: string }; status: string; name: string }>
      return items.filter((w) => w.agent.id === id && w.status !== 'archived')
    },
    enabled: !!agent?.organizationId,
  })

  const { data: mcpServers } = useQuery({
    queryKey: ['mcp-servers', orgId],
    queryFn: async () => {
      const res = await mcpApi.list(orgId!)
      return (res.data.data || []) as Array<{ id: string; name: string; type: string }>
    },
    enabled: !!orgId,
  })

  const { data: linkedMcpServers } = useQuery({
    queryKey: ['agent-mcp-servers', id],
    queryFn: async () => {
      const res = await mcpApi.listByAgent(id!)
      const servers = res.data.data ?? res.data ?? []
      return (Array.isArray(servers) ? servers : []) as Array<{ id: string; name: string }>
    },
    enabled: !!id,
  })

  useEffect(() => {
    if (linkedMcpServers) {
      setLinkedMcpServerIds(linkedMcpServers.map((s) => s.id))
    }
  }, [linkedMcpServers])

  const shareWidget = agentWidgets[0]
  const [shareLinkOptimistic, setShareLinkOptimistic] = useState<boolean | null>(null)
  const shareLinkEnabled = shareLinkOptimistic ?? !!shareWidget
  const shareUrl = (shareLinkEnabled && shareWidget?.publicKey) ? `${import.meta.env.VITE_APP_URL || 'http://localhost:5173'}/chat/${shareWidget.publicKey}` : undefined

  useEffect(() => {
    setShareLinkOptimistic(null)
  }, [agentWidgets])

  const createShareLink = useMutation({
    mutationFn: () => widgets.create(agent!.organizationId, { name: `${agent!.name} - Share Link`, agentId: id! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-widgets', agent?.organizationId] })
    },
  })

  const removeShareLink = useMutation({
    mutationFn: () => widgets.update(shareWidget!.id, { status: 'archived' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-widgets', agent?.organizationId] })
    },
  })

  const deploymentOptions = [
    { id: 'web-chat-widget', enabled: agentDeployments.some((d) => d.channel === 'web'), deploymentId: agentDeployments.find((d) => d.channel === 'web')?.id },
    { id: 'shareable-link', enabled: shareLinkEnabled },
    { id: 'api-access', enabled: agentDeployments.some((d) => d.channel === 'api'), deploymentId: agentDeployments.find((d) => d.channel === 'api')?.id },
    { id: 'whatsapp', enabled: agentDeployments.some((d) => d.channel === 'whatsapp'), deploymentId: agentDeployments.find((d) => d.channel === 'whatsapp')?.id },
  ]

  const toggleDeployment = useMutation({
    mutationFn: ({ deploymentId, channel, enabled }: { deploymentId?: string; channel: string; enabled: boolean }) => {
      if (enabled && deploymentId) {
        return deploymentsApi.update(deploymentId, { status: 'active' })
      }
      if (enabled) {
        const config = channel === 'web' ? { type: 'widget' } : {}
        return deploymentsApi.create(id!, { channel, config })
      }
      return deploymentsApi.update(deploymentId!, { status: 'inactive' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-deployments', id] })
    },
  })

  useEffect(() => {
    if (agent) {
      form.reset({
        name: agent.name,
        description: agent.description || '',
        avatar: (agent as any).avatar || '',
        model: agent.model,
        systemPrompt: agent.systemPrompt,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens || 2048,
        reasoningEffort: (agent as any).reasoningEffort || 'medium',
      })

      const savedTools = agent.widgetConfig?.tools
      if (savedTools && savedTools.length > 0) {
        setTools((prev) =>
          prev.map((t) => ({ ...t, enabled: savedTools.includes(t.id) }))
        )
      }
    }
  }, [agent, form])

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      await agentsApi.update(id!, data)
      const prevIds = (linkedMcpServers || []).map((s) => s.id)
      const toLink = linkedMcpServerIds.filter((s) => !prevIds.includes(s))
      const toUnlink = prevIds.filter((s) => !linkedMcpServerIds.includes(s))
      await Promise.all([
        ...toLink.map((serverId) =>
          (mcpApi.linkToAgent(id!, serverId) as unknown as Promise<unknown>).catch(() => {})
        ),
        ...toUnlink.map((serverId) =>
          (mcpApi.unlinkFromAgent(id!, serverId) as unknown as Promise<unknown>).catch(() => {})
        ),
      ])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      queryClient.invalidateQueries({ queryKey: ['agent', id] })
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to save agent')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => agentsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      navigate('/agents')
    },
  })

  const handleMcpServerToggle = (serverId: string, checked: boolean) => {
    setLinkedMcpServerIds((prev) =>
      checked ? [...prev, serverId] : prev.filter((s) => s !== serverId)
    )
  }

  const handleSave = form.handleSubmit((data) => {
    updateMutation.mutate({
      name: data.name,
      description: data.description,
      ...(data.avatar ? { avatar: data.avatar } : {}),
      model: data.model,
      systemPrompt: data.systemPrompt,
      temperature: data.temperature,
      reasoningEffort: data.reasoningEffort,
      maxTokens: data.maxTokens,
      tools: tools.filter((t) => t.enabled).map((t) => t.id),
    })
  })

  const handleCapabilityToggle = (capabilityId: string, enabled: boolean) => {
    setCapabilities((prev) =>
      prev.map((c) => (c.id === capabilityId ? { ...c, enabled } : c))
    )
  }

  const handleDeploymentToggle = (optionId: string, enabled: boolean) => {
    const option = deploymentOptions.find((o) => o.id === optionId)
    if (!option) return
    if (optionId === 'shareable-link') {
      setShareLinkOptimistic(enabled)
      if (enabled && !shareWidget) {
        createShareLink.mutate(undefined, {
          onError: () => setShareLinkOptimistic(null),
        })
      } else if (!enabled && shareWidget) {
        removeShareLink.mutate(undefined, {
          onError: () => setShareLinkOptimistic(null),
        })
      }
      return
    }
    const channelMap: Record<string, string> = { 'web-chat-widget': 'web', 'api-access': 'api', 'whatsapp': 'whatsapp' }
    const channel = channelMap[optionId]
    if (!channel) return
    toggleDeployment.mutate({ deploymentId: option.deploymentId, channel, enabled })
  }

  const handleToolToggle = (toolId: string, enabled: boolean) => {
    setTools((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, enabled } : t))
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
    <Tabs ref={tabsRootRef} value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
      <AgentDetailLayout
        agentName={values.name || agent.name}
        agentAvatar={agent.avatar}
        agentDescription={values.description || agent.description}
        activeTab={activeTab}
        isSaving={updateMutation.isPending}
        onSave={handleSave}
        onCopyLink={() => navigator.clipboard.writeText(window.location.href)}
        shareUrl={shareUrl}
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
            tools={tools}
            onToolToggle={handleToolToggle}
            mcpServers={mcpServers}
            linkedMcpServerIds={linkedMcpServerIds}
            onMcpServerToggle={handleMcpServerToggle}
          />
        </TabsContent>

        <TabsContent value="knowledge">
          <AgentKnowledge
            agentId={id!}
            knowledgeBaseId={agent.knowledgeBaseId}
            disabled={updateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="test-chat" className="flex flex-col min-h-0">
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
              tools: tools.filter((t) => t.enabled).map((t) => t.id),
              mcpServerIds: linkedMcpServerIds,
              avatar: agent.avatar,
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
            welcomeMessage={agent.welcomeMessage || ''}
            widgetColor={agent.widgetColor}
            status={agent.status}
            shareUrl={shareUrl}
            deploymentOptions={deploymentOptions}
            onDeploymentToggle={handleDeploymentToggle}
            onSave={(data) => updateMutation.mutate(data)}
            isSaving={updateMutation.isPending}
            disabled={updateMutation.isPending || toggleDeployment.isPending || createShareLink.isPending || removeShareLink.isPending}
          />
        </TabsContent>
      </AgentDetailLayout>
    </Tabs>
  )
}
