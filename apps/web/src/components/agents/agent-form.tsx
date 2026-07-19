import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
import { providerKeys as keysApi, knowledge as knowledgeApi, mcpServers as mcpApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

interface ProviderKeyOption {
  id: string
  provider: string
  keyPreview: string
  label: string | null
}

interface McpServerOption {
  id: string
  name: string
  type: string
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
  mcpServerIds?: string[]
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

  const { data: mcpServers } = useQuery<McpServerOption[]>({
    queryKey: ['mcp-servers', orgId],
    queryFn: async () => {
      const res = await mcpApi.list(orgId!)
      return (res.data.data || []) as McpServerOption[]
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

      <div className="space-y-3">
        <div>
          <Label>MCP Servers (optional)</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Link MCP servers to give this agent access to external tools. Configure servers in{' '}
            <a href="/settings/mcp-servers" className="underline underline-offset-2 hover:text-foreground transition-colors">
              MCP Servers
            </a>
            .
          </p>
        </div>
        {!mcpServers || mcpServers.length === 0 ? (
          <p className="text-xs text-muted-foreground">No MCP servers configured.</p>
        ) : (
          <div className="space-y-2">
            {mcpServers.map((server) => {
              const checked = (data.mcpServerIds || []).includes(server.id)
              return (
                <label
                  key={server.id}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50"
                >
                  <Checkbox
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={(v) => {
                      const current = data.mcpServerIds || []
                      update(
                        'mcpServerIds',
                        v ? [...current, server.id] : current.filter((s) => s !== server.id)
                      )
                    }}
                  />
                  <div className="min-w-0">
                    <span className="text-sm">{server.name}</span>
                    <span className="text-[10px] text-muted-foreground ml-1.5 font-mono">({server.type})</span>
                  </div>
                </label>
              )
            })}
          </div>
        )}
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
