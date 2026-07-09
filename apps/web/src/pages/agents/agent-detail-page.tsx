import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Loader2,
  Save,
  Share,
  MoreVertical,
  Brain,
  MessageSquare,
  BarChart3,
  Settings,
  BookOpen,
  Wrench,
  Trash2,
  Copy,
  ExternalLink,
  Globe,
  Link,
  Code,
  MessageCircle,
} from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AgentBasicInfo } from '@/components/agents/agent-basic-info'
import { AgentCapabilities, defaultCapabilities } from '@/components/agents/agent-capabilities'
import { AgentKnowledgeSources } from '@/components/agents/agent-knowledge-sources'
import { AgentDeployment } from '@/components/agents/agent-deployment'
import { AgentBehaviorSettings } from '@/components/agents/agent-behavior-settings'
import { AgentChatPanel } from '@/components/agents/agent-chat-panel'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { agents as agentsApi } from '@/lib/api'
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
  organizationId: string
  createdAt: string
  updatedAt: string
}

export default function AgentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()

  const [activeTab, setActiveTab] = useState('test-chat')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [model, setModel] = useState('gpt-4o')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(2048)
  const [toneOfVoice, setToneOfVoice] = useState('friendly')
  const [language, setLanguage] = useState('english')
  const [capabilities, setCapabilities] = useState(defaultCapabilities)
  const [selectedKnowledgeSources, setSelectedKnowledgeSources] = useState<string[]>([])
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
      maxTokens,
    })
  }

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

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  if (!agent) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Agent not found</p>
          <Button variant="outline" onClick={() => navigate('/agents')} className="mt-4">
            Back to Agents
          </Button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/agents')}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{agent.name}</h1>
              <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                <span className="size-1.5 rounded-full bg-green-500 mr-1" />
                Live
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-green-500" />
                Widget Status: Live
              </span>
              <span>Last updated: {new Date(agent.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share className="size-4 mr-2" />
            Share
          </Button>
          <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            Update
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(window.location.href)}>
                <Copy className="size-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ExternalLink className="size-4 mr-2" />
                Open Widget
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this agent?')) {
                    deleteMutation.mutate()
                  }
                }}
              >
                <Trash2 className="size-4 mr-2" />
                Delete Agent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="builder" className="gap-2">
            <Wrench className="size-4" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="gap-2">
            <BookOpen className="size-4" />
            Knowledge
          </TabsTrigger>
          <TabsTrigger value="test-chat" className="gap-2">
            <MessageSquare className="size-4" />
            Test Chat
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="size-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="size-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Total Conversations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-green-500/10">
                    <Brain className="size-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Messages Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <BarChart3 className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">0%</p>
                    <p className="text-sm text-muted-foreground">Satisfaction Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="builder" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <AgentBasicInfo
                name={name}
                description={description}
                onNameChange={setName}
                onDescriptionChange={setDescription}
                disabled={updateMutation.isPending}
              />

              <AgentBehaviorSettings
                toneOfVoice={toneOfVoice}
                language={language}
                model={model}
                temperature={temperature}
                systemPrompt={systemPrompt}
                onToneChange={setToneOfVoice}
                onLanguageChange={setLanguage}
                onModelChange={setModel}
                onTemperatureChange={setTemperature}
                onSystemPromptChange={setSystemPrompt}
                disabled={updateMutation.isPending}
              />
            </div>

            <div className="space-y-6">
              <AgentCapabilities
                capabilities={capabilities}
                onToggle={handleCapabilityToggle}
                disabled={updateMutation.isPending}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="mt-6">
          <AgentKnowledgeSources
            selected={selectedKnowledgeSources}
            onSelect={handleKnowledgeSourceSelect}
            disabled={updateMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="test-chat" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-0">
                  <AgentChatPanel
                    agentConfig={{
                      name: agent.name,
                      model: agent.model,
                      systemPrompt: agent.systemPrompt,
                      temperature: agent.temperature,
                      maxTokens: agent.maxTokens,
                      providerKeyId: agent.providerKeyId || undefined,
                    }}
                    className="min-h-[600px]"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Conversations</h3>
                  <Button variant="outline" size="sm" className="w-full mb-3">
                    + New
                  </Button>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 cursor-pointer hover:bg-primary/10 transition-colors">
                      <p className="font-medium text-sm">Pricing Plans</p>
                      <p className="text-xs text-muted-foreground truncate">Tell me about your pricing...</p>
                      <p className="text-[10px] text-muted-foreground mt-1">2 min ago</p>
                    </div>
                    <div className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <p className="font-medium text-sm">Integrations</p>
                      <p className="text-xs text-muted-foreground truncate">What platforms do you support?</p>
                      <p className="text-[10px] text-muted-foreground mt-1">1 hour ago</p>
                    </div>
                    <div className="p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                      <p className="font-medium text-sm">Refund Policy</p>
                      <p className="text-xs text-muted-foreground truncate">How does the refund process work?</p>
                      <p className="text-[10px] text-muted-foreground mt-1">3 hours ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                <Trash2 className="size-4 mr-2" />
                Clear Conversations
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center py-12">
                Analytics coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <AgentDeployment
            options={[
              { id: 'web-chat-widget', label: 'Web Chat Widget', description: 'Add to your website', icon: <Globe className="size-4" />, enabled: deploymentOptions.find(o => o.id === 'web-chat-widget')?.enabled ?? true },
              { id: 'shareable-link', label: 'Shareable Link', description: 'Create a public link', icon: <Link className="size-4" />, enabled: deploymentOptions.find(o => o.id === 'shareable-link')?.enabled ?? false },
              { id: 'api-access', label: 'API Access', description: 'Access via API', icon: <Code className="size-4" />, enabled: deploymentOptions.find(o => o.id === 'api-access')?.enabled ?? false },
              { id: 'whatsapp', label: 'WhatsApp', description: 'Connect on WhatsApp', icon: <MessageCircle className="size-4" />, enabled: deploymentOptions.find(o => o.id === 'whatsapp')?.enabled ?? false },
            ]}
            onToggle={handleDeploymentToggle}
            disabled={updateMutation.isPending}
          />
        </TabsContent>
      </Tabs>
    </PageContainer>
  )
}
