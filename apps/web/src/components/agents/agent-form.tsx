import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { AgentModelPicker } from './agent-model-picker'
import { AgentPromptEditor } from './agent-prompt-editor'
import { AgentSettings } from './agent-settings'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { providerKeys as keysApi, knowledge as knowledgeApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

interface ProviderKeyOption {
  id: string
  provider: string
  keyPreview: string
  label: string | null
}

interface AgentFormData {
  name: string
  description: string
  model: string
  systemPrompt: string
  temperature: number
  maxTokens: number
  providerKeyId?: string
  knowledgeBaseId?: string
}

interface AgentFormProps {
  data: AgentFormData
  onChange: (data: AgentFormData) => void
  errors: Partial<Record<keyof AgentFormData, string>>
  disabled?: boolean
}

export function AgentForm({ data, onChange, errors, disabled }: AgentFormProps) {
  const { orgId } = useOrg()

  const { data: providerKeys } = useQuery<ProviderKeyOption[]>({
    queryKey: ['provider-keys', orgId],
    queryFn: async () => {
      const res = await keysApi.list(orgId!)
      return (res.data.data || []) as ProviderKeyOption[]
    },
    enabled: !!orgId,
  })

  const { data: knowledgeBases } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ['knowledge-bases', orgId],
    queryFn: async () => {
      const res = await knowledgeApi.list(orgId!)
      return (res.data.data || []) as Array<{ id: string; name: string }>
    },
    enabled: !!orgId,
  })

  function update<K extends keyof AgentFormData>(key: K, value: AgentFormData[K]) {
    onChange({ ...data, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="agent-name">Name *</Label>
        <Input
          id="agent-name"
          placeholder="Enter agent name"
          value={data.name}
          onChange={(e) => update('name', e.target.value)}
          disabled={disabled}
          maxLength={100}
          aria-invalid={!!errors.name}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="agent-description">Description</Label>
        <Textarea
          id="agent-description"
          placeholder="Brief description of this agent (optional)"
          value={data.description}
          onChange={(e) => update('description', e.target.value)}
          disabled={disabled}
          maxLength={500}
          rows={2}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Model *</Label>
        <AgentModelPicker
          value={data.model}
          onChange={(v) => update('model', v)}
          disabled={disabled}
        />
        {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
      </div>

      <div className="space-y-2">
        <Label>API Key (optional)</Label>
        <Select
          value={data.providerKeyId || ''}
          onValueChange={(v) => update('providerKeyId', v || undefined)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Use default system key" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Default system key</SelectItem>
            {providerKeys?.map((key) => (
              <SelectItem key={key.id} value={key.id}>
                {key.label || key.provider} ({key.keyPreview})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Optionally use your own API key from the{' '}
          <a href="/settings/provider-keys" className="underline underline-offset-2 hover:text-foreground transition-colors">
            Provider Keys
          </a>{' '}
          settings.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Knowledge Base (optional)</Label>
        <Select
          value={data.knowledgeBaseId || ''}
          onValueChange={(v) => update('knowledgeBaseId', v || undefined)}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="No knowledge base" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No knowledge base</SelectItem>
            {knowledgeBases?.map((kb) => (
              <SelectItem key={kb.id} value={kb.id}>
                {kb.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Connect a knowledge base to enable RAG (Retrieval-Augmented Generation).
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="agent-system-prompt">System Prompt *</Label>
        <AgentPromptEditor
          value={data.systemPrompt}
          onChange={(v) => update('systemPrompt', v)}
          disabled={disabled}
        />
        {errors.systemPrompt && (
          <p className="text-xs text-destructive">{errors.systemPrompt}</p>
        )}
      </div>

      <AgentSettings
        temperature={data.temperature}
        maxTokens={data.maxTokens}
        onTemperatureChange={(v) => update('temperature', v)}
        onMaxTokensChange={(v) => update('maxTokens', v)}
        disabled={disabled}
      />
    </div>
  )
}

export type { AgentFormData }
