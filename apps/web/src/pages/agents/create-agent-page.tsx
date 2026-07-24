import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Loader2, Plus, Globe, Link, Code, Plug, User, BrainCircuit, BookOpen, Wrench, Zap, LayoutTemplate } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
const CDN = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

import { PageContainer } from '@/components/shared/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AgentBasicInfo } from '@/components/agents/agent-basic-info'
import { defaultCapabilities } from '@/components/agents/agent-capabilities'
import { AgentToolPicker, builtInTools, type BuiltInTool } from '@/components/agents/agent-tool-picker'
import { AgentKnowledgeSources } from '@/components/agents/agent-knowledge-sources'
import { AgentBehaviorSettings } from '@/components/agents/agent-behavior-settings'
import { AgentTemplateModal, type AgentTemplate } from '@/components/agents/agent-template-modal'
import { agents as agentsApi, mcpServers as mcpApi } from '@/lib/api'
import { useAvailableModels } from '@/lib/hooks/use-available-models'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'

const createSchema = z.object({
  name: z.string().trim().min(1, 'Agent name is required').max(50, 'Name must be 50 characters or less'),
  description: z.string(),
  avatar: z.string(),
  model: z.string().min(1, 'Please select a model'),
  systemPrompt: z.string(),
  temperature: z.number().min(0).max(2),
  reasoningEffort: z.string(),
  toneOfVoice: z.string(),
  language: z.string(),
})

type CreateAgentValues = z.infer<typeof createSchema>

const DEFAULT_DEPLOYMENTS = [
  { id: 'web-chat-widget', label: 'Web chat widget', description: 'Embed on your website', icon: 'globe', enabled: true },
  { id: 'shareable-link', label: 'Shareable link', description: 'A public chat URL', icon: 'link', enabled: false },
  { id: 'api-access', label: 'API access', description: 'Connect through the API', icon: 'code', enabled: false },
  { id: 'whatsapp', label: 'WhatsApp', description: 'WhatsApp Business', icon: 'whatsapp', enabled: true },
]

const DEFAULT_FORM_VALUES: CreateAgentValues = {
  name: '',
  description: '',
  avatar: '',
  model: '',
  systemPrompt: '',
  temperature: 0.7,
  reasoningEffort: 'medium',
  toneOfVoice: 'friendly',
  language: 'english',
}

export default function CreateAgentPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId } = useOrg()
  const { data: models = [], isLoading: modelsLoading, isError: modelsError, error: modelsErrorObj } = useAvailableModels()
  const [capabilities, setCapabilities] = useState(defaultCapabilities)
  const [tools, setTools] = useState<BuiltInTool[]>(builtInTools.map((t) => ({ ...t })))
  const [deploymentOptions, setDeploymentOptions] = useState(DEFAULT_DEPLOYMENTS)
  const [selectedMcpServerIds, setSelectedMcpServerIds] = useState<string[]>([])
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState<string>('')
  const [mcpModalOpen, setMcpModalOpen] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)

  const { data: mcpServers } = useQuery({
    queryKey: ['mcp-servers', orgId],
    queryFn: async () => {
      const res = await mcpApi.list(orgId!)
      return (res.data.data || []) as Array<{ id: string; name: string; type: string }>
    },
    enabled: !!orgId,
  })

  const form = useForm<CreateAgentValues>({
    resolver: zodResolver(createSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  })

  const [activeTemplate, setActiveTemplate] = useState<string | null>(null)

  const applyTemplate = (template: AgentTemplate) => {
    setActiveTemplate(template.id)
    // Prefill the form with the template's suggested settings. The user can
    // edit any of these before creating the agent.
    if (template.name && !form.getValues('name')) {
      form.setValue('name', template.name, { shouldValidate: true })
    }
    if (template.description) {
      form.setValue('description', template.description)
    }
    form.setValue('systemPrompt', template.systemPrompt)
    if (typeof template.suggestedTemperature === 'number') {
      form.setValue('temperature', template.suggestedTemperature)
    }
    if (template.suggestedModel && models.some((m) => m.id === template.suggestedModel)) {
      form.setValue('model', template.suggestedModel, { shouldValidate: true })
    }
  }

  const createMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await agentsApi.create(data)
      const agentId = (res.data as any)?.data?.id ?? (res.data as any)?.id
      if (agentId && selectedMcpServerIds.length > 0) {
        await Promise.all(
          selectedMcpServerIds.map((serverId) =>
            (mcpApi.linkToAgent(agentId, serverId) as unknown as Promise<unknown>).catch(() => {})
          )
        )
      }
      return agentId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent created')
      navigate('/agents')
    },
    onError: (error: Error) => toast.error(error.message || 'Unable to create agent. Please try again.'),
  })

  const handleToolToggle = (id: string, enabled: boolean) => {
    setTools((prev) => prev.map((t) => (t.id === id ? { ...t, enabled } : t)))
  }

  const handleCreate = form.handleSubmit(
    (data) => {
      const model = data.model || models[0]?.id || ''
      if (!model) {
        form.setError('model', { message: 'Please select a model' })
        return
      }

      createMutation.mutate({
        name: data.name,
        description: data.description || undefined,
        avatar: data.avatar || undefined,
        model,
        systemPrompt: data.systemPrompt || `You are ${data.name}, a helpful AI assistant.`,
        temperature: data.temperature,
        reasoningEffort: data.reasoningEffort,
        knowledgeBaseId: selectedKnowledgeBaseId || null,
        maxTokens: 2048,
        organizationId: orgId,
        capabilities: capabilities.filter((c) => c.enabled).map((c) => c.id),
        tools: tools.filter((t) => t.enabled).map((t) => t.id),
        deployment: deploymentOptions.filter((o) => o.enabled).map((o) => o.id),
        settings: { toneOfVoice: data.toneOfVoice, language: data.language },
      })
    },
    () => toast.error('Please fix the form errors before submitting'),
  )

  const saving = createMutation.isPending

  return (
    <PageContainer>
      <form onSubmit={handleCreate} className="space-y-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/agents')}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            <ArrowLeft className="size-3.5" />
            Agents
          </button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/agents')} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={saving || modelsLoading}>
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
              {saving ? 'Creating…' : 'Create agent'}
            </Button>
          </div>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New agent</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up the essentials. You can refine settings after creation.
          </p>
        </div>

        <Separator />

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Main form — 3/5 */}
          <div className="space-y-6 lg:col-span-3">
            {/* Template picker */}
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                  <LayoutTemplate className="size-4.5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Start from a template</p>
                  <p className="text-xs text-muted-foreground">Prefill the prompt and settings, then customize.</p>
                </div>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setTemplateModalOpen(true)} disabled={saving}>
                Browse templates
              </Button>
            </div>

            {/* Identity */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <User className="size-4.5" />
                </div>
                <div>
                  <CardTitle>Identity</CardTitle>
                  <CardDescription>Make your agent recognizable.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <AgentBasicInfo control={form.control} disabled={saving} />
              </CardContent>
            </Card>

            {/* Model & Behavior */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <BrainCircuit className="size-4.5" />
                </div>
                <div>
                  <CardTitle>Model & Behavior</CardTitle>
                  <CardDescription>Choose a model and define how the agent responds.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {form.formState.errors.model && (
                  <p className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    {form.formState.errors.model.message}
                  </p>
                )}
                <AgentBehaviorSettings
                  control={form.control}
                  disabled={saving || modelsLoading}
                  models={models}
                  modelsLoading={modelsLoading}
                  modelsError={modelsError}
                  modelsErrorMessage={modelsErrorObj instanceof Error ? modelsErrorObj.message : undefined}
                />
              </CardContent>
            </Card>

            {/* Knowledge */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                  <BookOpen className="size-4.5" />
                </div>
                <div>
                  <CardTitle>Knowledge</CardTitle>
                  <CardDescription>Connect a knowledge base for RAG.</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <AgentKnowledgeSources
                  value={selectedKnowledgeBaseId}
                  onChange={setSelectedKnowledgeBaseId}
                  disabled={saving}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar — 2/5 */}
          <div className="space-y-6 lg:col-span-2">
            <div className="lg:sticky lg:top-6 lg:space-y-6">
              {/* Tools */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <Wrench className="size-4.5" />
                  </div>
                  <div>
                    <CardTitle>Tools</CardTitle>
                    <CardDescription>Built-in tools your agent can use.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <AgentToolPicker
                    tools={tools}
                    onToggle={handleToolToggle}
                    disabled={saving}
                  />
                </CardContent>
              </Card>

              {/* MCP Servers */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                    <Plug className="size-4.5" />
                  </div>
                  <div>
                    <CardTitle>MCP Servers</CardTitle>
                    <CardDescription>Link external tools via MCP.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {!mcpServers || mcpServers.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No MCP servers configured.{' '}
                      <a href="/settings/mcp-servers" className="underline underline-offset-2 hover:text-foreground">Add one</a>.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {mcpServers.slice(0, 3).map((server) => {
                        const checked = selectedMcpServerIds.includes(server.id)
                        return (
                          <label
                            key={server.id}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={saving}
                              onChange={() =>
                                setSelectedMcpServerIds((prev) =>
                                  checked ? prev.filter((s) => s !== server.id) : [...prev, server.id]
                                )
                              }
                              className="size-4 accent-primary"
                            />
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Plug className="size-3.5 shrink-0 text-muted-foreground" />
                              <span className="text-xs">{server.name}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">({server.type})</span>
                            </div>
                          </label>
                        )
                      })}
                      {mcpServers.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setMcpModalOpen(true)}
                          className="w-full text-center text-xs text-primary hover:underline py-1.5"
                        >
                          See all {mcpServers.length} servers
                        </button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Capabilities */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                    <Zap className="size-4.5" />
                  </div>
                  <div>
                    <CardTitle>Capabilities</CardTitle>
                    <CardDescription>Choose what your agent can do.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0.5">
                    {capabilities.map((capability) => {
                      const available = capability.enabled || capability.id === 'answer-questions' || capability.id === 'knowledge-search'
                      return (
                        <div
                          key={capability.id}
                          className={cn(
                            'flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors',
                            available ? 'hover:bg-muted/40' : 'opacity-50'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                              {capability.icon}
                            </div>
                            <div className="min-w-0">
                              <Label className="text-xs font-medium leading-tight">{capability.label}</Label>
                              <p className="text-[11px] text-muted-foreground leading-tight">{capability.description}</p>
                            </div>
                          </div>
                          <Switch
                            size="sm"
                            checked={capability.enabled}
                            onCheckedChange={(checked) => setCapabilities((c) => c.map((x) => x.id === capability.id ? { ...x, enabled: checked } : x))}
                            disabled={saving || !available}
                          />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Deployment */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-500">
                    <Globe className="size-4.5" />
                  </div>
                  <div>
                    <CardTitle>Deployment</CardTitle>
                    <CardDescription>Where your agent will be available.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0.5">
                    {DEFAULT_DEPLOYMENTS.map((opt) => {
                      const enabled = deploymentOptions.find((o) => o.id === opt.id)?.enabled ?? opt.enabled
                      const available = enabled || opt.id === 'web-chat-widget' || opt.id === 'whatsapp'
                      const isBrand = opt.icon === 'whatsapp'
                      return (
                        <div
                          key={opt.id}
                          className={cn(
                            'flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors',
                            available ? 'hover:bg-muted/40' : 'opacity-50'
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={cn('flex size-7 shrink-0 items-center justify-center rounded-md', enabled ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                              {isBrand ? (
                                <img src={`${CDN}/whatsapp/default.svg`} alt="WhatsApp" className="size-4" />
                              ) : opt.icon === 'globe' ? (
                                <Globe className="size-4" />
                              ) : opt.icon === 'link' ? (
                                <Link className="size-4" />
                              ) : (
                                <Code className="size-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <Label className="text-xs font-medium leading-tight">{opt.label}</Label>
                              <p className="text-[11px] text-muted-foreground leading-tight">{opt.description}</p>
                            </div>
                          </div>
                          <Switch
                            size="sm"
                            checked={enabled}
                            onCheckedChange={(checked) => setDeploymentOptions((c) => c.map((x) => x.id === opt.id ? { ...x, enabled: checked } : x))}
                            disabled={saving || !available}
                          />
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </form>

      <Dialog open={mcpModalOpen} onOpenChange={setMcpModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>MCP Servers</DialogTitle>
            <DialogDescription>Select servers to link to this agent.</DialogDescription>
          </DialogHeader>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {mcpServers?.map((server) => {
              const checked = selectedMcpServerIds.includes(server.id)
              return (
                <label
                  key={server.id}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={saving}
                    onChange={() =>
                      setSelectedMcpServerIds((prev) =>
                        checked ? prev.filter((s) => s !== server.id) : [...prev, server.id]
                      )
                    }
                    className="size-4 accent-primary"
                  />
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Plug className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="text-xs">{server.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">({server.type})</span>
                  </div>
                </label>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      <AgentTemplateModal
        open={templateModalOpen}
        onOpenChange={setTemplateModalOpen}
        activeTemplateId={activeTemplate}
        onSelect={applyTemplate}
        disabled={saving}
      />
    </PageContainer>
  )
}
