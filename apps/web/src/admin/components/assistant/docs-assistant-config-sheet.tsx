import { useEffect, useMemo, useState } from 'react'
import { RefreshCw, Settings2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { toast } from '@/lib/toast'
import {
  useDocsAssistantConfig,
  useSaveDocsAssistantConfig,
  useTestDocsAssistantConfig,
  useDocsAssistantModels,
} from '@/admin/hooks/use-docs-assistant-config'

const PROVIDERS = [
  { value: 'agnes', label: 'Agnes AI' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google AI' },
  { value: 'groq', label: 'Groq' },
  { value: 'openrouter', label: 'OpenRouter' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'together', label: 'Together' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'perplexity', label: 'Perplexity' },
  { value: 'opencode', label: 'OpenCode Zen' },
  { value: 'local', label: 'Local (OmniRoute)' },
]

export function DocsAssistantConfigSheet() {
  const [open, setOpen] = useState(false)
  const { data: config } = useDocsAssistantConfig()
  const saveMutation = useSaveDocsAssistantConfig()
  const testMutation = useTestDocsAssistantConfig()

  const [draft, setDraft] = useState({ provider: 'agnes', model: 'agnes-2.5', apiKey: '' })
  const [modelsRefreshKey, setModelsRefreshKey] = useState(0)
  const [modelsKey, setModelsKey] = useState('')
  const { data: availableModels = [], isLoading: modelsLoading, isError: modelsError } =
    useDocsAssistantModels(draft.provider, modelsKey, open, modelsRefreshKey)
  const providerModels = useMemo(() => {
    const models = [...availableModels]
    if (draft.model && !models.some((model) => model.id === draft.model)) {
      models.unshift({ id: draft.model, name: draft.model })
    }
    return models
  }, [availableModels, draft.model])

  useEffect(() => {
    if (config) {
      setDraft({ provider: config.provider, model: config.model, apiKey: '' })
    }
  }, [config])

  useEffect(() => {
    if (draft.model || modelsLoading || providerModels.length === 0) return
    setDraft((current) => ({ ...current, model: providerModels[0].id }))
  }, [draft.model, modelsLoading, providerModels])

  const handleSave = () => {
    const apiKey = draft.apiKey.trim()
    saveMutation.mutate(
      { provider: draft.provider, model: draft.model.trim(), apiKey: apiKey || undefined },
      {
        onSuccess: () => {
          toast.success('Docs assistant config saved')
          setDraft((d) => ({ ...d, apiKey: '' }))
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Failed to save'),
      },
    )
  }

  const handleTest = () => {
    const apiKey = draft.apiKey.trim()
    testMutation.mutate(
      { provider: draft.provider, model: draft.model.trim(), apiKey: apiKey || undefined },
      {
        onSuccess: (res) => {
          const result = res.data.data
          if (result.ok) toast.success(result.message)
          else toast.error(result.message)
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : 'Test failed'),
      },
    )
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs text-muted-foreground" onClick={() => setOpen(true)}>
        <Settings2 className="size-3.5" />
        Docs AI
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full max-w-md">
          <SheetHeader>
            <SheetTitle>Docs assistant</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 p-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Provider</label>
              <Select
                items={PROVIDERS}
                value={draft.provider}
                onValueChange={(next) => {
                  if (typeof next === 'string') {
                    const defaultModel = next === 'agnes' ? 'agnes-2.5' : ''
                    setModelsKey('')
                    setModelsRefreshKey((key) => key + 1)
                    setDraft((d) => ({ ...d, provider: next, model: defaultModel }))
                  }
                }}
              >
                <SelectTrigger className="w-full" aria-label="Provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Model</label>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="h-6 px-2 text-[11px]"
                  onClick={() => {
                    setModelsKey(draft.apiKey.trim())
                    setModelsRefreshKey((key) => key + 1)
                  }}
                  disabled={modelsLoading}
                  aria-label="Refresh models"
                >
                  <RefreshCw className={modelsLoading ? 'size-3 animate-spin' : 'size-3'} />
                  Refresh
                </Button>
              </div>
              <Select
                items={providerModels.map((model) => ({ value: model.id, label: model.name }))}
                value={draft.model || null}
                onValueChange={(next) => {
                  if (typeof next === 'string') setDraft((d) => ({ ...d, model: next }))
                }}
                disabled={modelsLoading || providerModels.length === 0}
              >
                <SelectTrigger className="w-full" aria-label="Model">
                  {modelsLoading ? <span className="text-muted-foreground">Loading models…</span> : <SelectValue placeholder="Select a model" />}
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {providerModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {modelsError
                  ? 'Could not load models. Check the provider key and try refreshing.'
                  : 'Models are loaded from the selected provider.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">API key</label>
              <Input
                type="password"
                value={draft.apiKey}
                onChange={(e) => setDraft((d) => ({ ...d, apiKey: e.target.value }))}
                placeholder={config?.keyPreview ? `Stored: ${config.keyPreview}` : 'Leave blank to keep the current key'}
              />
              <p className="text-[11px] text-muted-foreground">
                {config?.keyPreview
                  ? 'A key is already stored. Enter a new one to replace it.'
                  : 'No key stored yet — set one to use a paid provider.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={handleTest} disabled={testMutation.isPending}>
                {testMutation.isPending ? 'Testing…' : 'Test key'}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saveMutation.isPending || !draft.model.trim()}>
                {saveMutation.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
