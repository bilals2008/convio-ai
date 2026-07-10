import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CheckCircle2, Code, Globe, Link, Loader2, MessageCircle, Plus } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'sonner'
import { PageContainer } from '@/components/shared/page-container'
import { Button } from '@/components/ui/button'
import { AgentBasicInfo } from '@/components/agents/agent-basic-info'
import { AgentCapabilities, defaultCapabilities } from '@/components/agents/agent-capabilities'
import { AgentKnowledgeSources } from '@/components/agents/agent-knowledge-sources'
import { AgentDeployment } from '@/components/agents/agent-deployment'
import { AgentBehaviorSettings } from '@/components/agents/agent-behavior-settings'
import { agents as agentsApi } from '@/lib/api'
import { useAvailableModels } from '@/lib/hooks/use-available-models'
import { useOrg } from '@/lib/org-context'

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
  { id: 'web-chat-widget', enabled: true },
  { id: 'shareable-link', enabled: false },
  { id: 'api-access', enabled: false },
  { id: 'whatsapp', enabled: false },
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

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => agentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      toast.success('Agent created')
      navigate('/agents')
    },
    onError: (error: Error) => toast.error(error.message || 'Unable to create agent. Please try again.'),
  })

  const handleCreate = form.handleSubmit((data) => {
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
      capabilities: capabilities.filter((capability) => capability.enabled).map((capability) => capability.id),
      deployment: deploymentOptions.filter((option) => option.enabled).map((option) => option.id),
      settings: { toneOfVoice: data.toneOfVoice, language: data.language },
    })
  })

  const saving = createMutation.isPending

  return (
    <PageContainer>
      <form onSubmit={handleCreate} className="mx-auto max-w-7xl space-y-6 pb-24">
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">Create an agent</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">Set the essentials now. You can refine knowledge, tools, and deployments whenever you are ready.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/agents')} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving || modelsLoading}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              {saving ? 'Creating agent…' : 'Create agent'}
            </Button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <main className="space-y-6">
            <section className="space-y-1">
              <h2 className="text-base font-semibold">Identity</h2>
              <p className="text-sm text-muted-foreground">Make it recognizable to your team and customers.</p>
            </section>
            <AgentBasicInfo control={form.control} disabled={saving} />

            <section className="space-y-1 pt-2">
              <h2 className="text-base font-semibold">How it responds</h2>
              <p className="text-sm text-muted-foreground">Choose a model and define the assistant’s operating instructions.</p>
            </section>
            {form.formState.errors.model && <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{form.formState.errors.model.message}</p>}
            <AgentBehaviorSettings
              control={form.control}
              disabled={saving || modelsLoading}
              models={models}
              modelsLoading={modelsLoading}
              modelsError={modelsError}
              modelsErrorMessage={modelsErrorObj instanceof Error ? modelsErrorObj.message : undefined}
            />

            <section className="space-y-1 pt-2">
              <h2 className="text-base font-semibold">Knowledge</h2>
              <p className="text-sm text-muted-foreground">Add trusted sources to improve response quality.</p>
            </section>
            <AgentKnowledgeSources />
          </main>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-md border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                <h2 className="text-sm font-semibold">Setup checklist</h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" /> Name your agent</li>
                <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-primary" /> Select a model</li>
                <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-muted-foreground" /> Add knowledge later</li>
              </ul>
            </div>
            <AgentCapabilities capabilities={capabilities} onToggle={(id, enabled) => setCapabilities((current) => current.map((capability) => capability.id === id ? { ...capability, enabled } : capability))} disabled={saving} />
            <AgentDeployment
              options={[
                { id: 'web-chat-widget', label: 'Web chat widget', description: 'Embed on your website', icon: <Globe className="size-4" />, enabled: deploymentOptions.find((option) => option.id === 'web-chat-widget')?.enabled ?? true },
                { id: 'shareable-link', label: 'Shareable link', description: 'A public chat URL', icon: <Link className="size-4" />, enabled: deploymentOptions.find((option) => option.id === 'shareable-link')?.enabled ?? false },
                { id: 'api-access', label: 'API access', description: 'Connect through the API', icon: <Code className="size-4" />, enabled: deploymentOptions.find((option) => option.id === 'api-access')?.enabled ?? false },
                { id: 'whatsapp', label: 'WhatsApp', description: 'WhatsApp Business', icon: <MessageCircle className="size-4" />, enabled: deploymentOptions.find((option) => option.id === 'whatsapp')?.enabled ?? false },
              ]}
              onToggle={(id, enabled) => setDeploymentOptions((current) => current.map((option) => option.id === id ? { ...option, enabled } : option))}
              disabled={saving}
            />
          </aside>
        </div>
      </form>
    </PageContainer>
  )
}
