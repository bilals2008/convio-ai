import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Key, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { providerKeys as keysApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

interface ProviderKey {
  id: string
  provider: string
  keyPreview: string
  label: string | null
  createdAt: string
}

const PROVIDERS = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'google', name: 'Google AI' },
  { id: 'groq', name: 'Groq' },
  { id: 'kie', name: 'KIE AI' },
  { id: 'openrouter', name: 'OpenRouter' },
  { id: 'mistral', name: 'Mistral' },
  { id: 'together', name: 'Together' },
  { id: 'deepseek', name: 'DeepSeek' },
  { id: 'perplexity', name: 'Perplexity' },
]

export default function ProviderKeysPage() {
  const { orgId, isLoading: orgLoading } = useOrg()
  const queryClient = useQueryClient()

  const { data: keys, isLoading } = useQuery({
    queryKey: ['provider-keys', orgId],
    queryFn: async () => {
      const res = await keysApi.list(orgId!)
      return (res.data.data || []) as ProviderKey[]
    },
    enabled: !!orgId,
  })

  const [open, setOpen] = useState(false)
  const [provider, setProvider] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [label, setLabel] = useState('')

  const createMutation = useMutation({
    mutationFn: (data: { provider: string; apiKey: string; label?: string }) => {
      if (!orgId) throw new Error('No organization selected')
      return keysApi.create(orgId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-keys', orgId] })
      setOpen(false)
      resetForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (keyId: string) => keysApi.delete(orgId!, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-keys', orgId] })
    },
  })

  function resetForm() {
    setProvider('')
    setApiKey('')
    setLabel('')
  }

  if (orgLoading || isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Provider API Keys" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Provider API Keys"
        description="Connect your own API keys for AI providers. Agents will use these keys instead of the default ones."
        action={
          <div className="shrink-0">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2 text-sm font-medium gap-1.5 transition-colors">
                <Plus className="size-4" />
                Add Key
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Provider Key</DialogTitle>
                  <DialogDescription>
                    Your API key is stored encrypted and used only for your agents.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVIDERS.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label (optional)</Label>
                    <Input
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="My OpenAI key"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setOpen(false); resetForm() }}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createMutation.mutate({ provider, apiKey, label: label || undefined })}
                    disabled={!provider || !apiKey || createMutation.isPending}
                  >
                    {createMutation.isPending ? 'Saving...' : 'Save'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Your Provider Keys</CardTitle>
          <CardDescription>
            Keys are used when running agents. If no key is configured for a provider, the default system key is used.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!keys || keys.length === 0 ? (
            <EmptyState
              icon={Key}
              title="No provider keys"
              description="Add API keys for AI providers you want to use."
            />
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <div
                  key={key.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                      <Key className="size-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize">{key.provider}</span>
                        {key.label && (
                          <span className="text-xs text-muted-foreground">({key.label})</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{key.keyPreview}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      Connected
                    </Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(key.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
