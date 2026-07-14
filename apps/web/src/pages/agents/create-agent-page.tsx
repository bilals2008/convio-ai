import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Loader2, Plus, Globe, Link, Code, Lightbulb, ExternalLink } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
const CDN = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

import { PageContainer } from '@/components/shared/page-container'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AgentBasicInfo } from '@/components/agents/agent-basic-info'
import { AgentTemplatePicker, type AgentTemplate } from '@/components/agents/agent-template-picker'
import { defaultCapabilities } from '@/components/agents/agent-capabilities'
import { AgentKnowledgeSources } from '@/components/agents/agent-knowledge-sources'
import { AgentBehaviorSettings } from '@/components/agents/agent-behavior-settings'
import { agents as agentsApi } from '@/lib/api'
import { useAvailableModels } from '@/lib/hooks/use-available-models'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'

const createSchema = z.object({
  name: z.string().trim().min(1, 'Agent name is required').max(50, 'Name must be 50 characters or less'),
  description: z.string(),
  avatarUrl: z.string(),
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
  avatarUrl: '',
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
  const [deploymentOptions, setDeploymentOptions] = useState(DEFAULT_DEPLOYMENTS)
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
    mutationFn: (data: Record<string, unknown>) => agentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent created')
      navigate('/agents')
    },
    onError: (error: Error) => toast.error(error.message || 'Unable to create agent. Please try again.'),
  })

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
        avatar: data.avatarUrl || undefined,
        model,
        systemPrompt: data.systemPrompt || `You are ${data.name}, a helpful AI assistant.`,
        temperature: data.temperature,
        reasoningEffort: data.reasoningEffort,
        maxTokens: 2048,
        organizationId: orgId,
        capabilities: capabilities.filter((c) => c.enabled).map((c) => c.id),
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
            <Card>
              <CardHeader>
                <CardTitle>Start from a template</CardTitle>
                <CardDescription>Optional. Prefill the prompt and settings, then customize.</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentTemplatePicker
                  selectedId={activeTemplate ?? undefined}
                  onSelect={applyTemplate}
                  disabled={saving}
                />
              </CardContent>
            </Card>

            {/* Identity */}
            <Card>
              <CardHeader>
                <CardTitle>Identity</CardTitle>
                <CardDescription>Make your agent recognizable.</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentBasicInfo control={form.control} disabled={saving} />
              </CardContent>
            </Card>

            {/* Model & Behavior */}
            <Card>
              <CardHeader>
                <CardTitle>Model & Behavior</CardTitle>
                <CardDescription>Choose a model and define how the agent responds.</CardDescription>
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
              <CardHeader>
                <CardTitle>Knowledge</CardTitle>
                <CardDescription>Optional. Add sources after creation.</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentKnowledgeSources />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar — 2/5 */}
          <div className="space-y-6 lg:col-span-2">
            <div className="lg:sticky lg:top-6 lg:space-y-6">
              {/* Capabilities */}
              <Card>
                <CardHeader>
                  <CardTitle>Capabilities</CardTitle>
                  <CardDescription>Choose what your agent can do.</CardDescription>
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
                <CardHeader>
                  <CardTitle>Deployment</CardTitle>
                  <CardDescription>Where your agent will be available.</CardDescription>
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

              {/* Tips */}
              <Card className="border-border/50 bg-muted/20">
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
                      <Lightbulb className="size-3.5 text-primary" />
                    </div>
                    <span className="text-sm font-medium">Tips</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                      Start with a clear name and description.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                      Add knowledge sources to improve accuracy.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                      You can always change settings later.
                    </li>
                  </ul>
                  <a
                    href="https://docs.convio.ai/agents"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    Learn more
                    <ExternalLink className="size-3" />
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </PageContainer>
  )
}
