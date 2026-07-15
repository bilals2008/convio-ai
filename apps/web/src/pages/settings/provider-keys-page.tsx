import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Key, Trash2, Pencil, Eye } from 'lucide-react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
  { id: 'opencode', name: 'OpenCode Zen' },
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

  const [editKey, setEditKey] = useState<ProviderKey | null>(null)
  const [editApiKey, setEditApiKey] = useState('')
  const [editLabel, setEditLabel] = useState('')

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

  const updateMutation = useMutation({
    mutationFn: (data: { keyId: string; apiKey?: string; label?: string }) => {
      if (!orgId) throw new Error('No organization selected')
      return keysApi.update(orgId, data.keyId, { apiKey: data.apiKey, label: data.label })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-keys', orgId] })
      setEditKey(null)
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

  function openEdit(key: ProviderKey) {
    setEditKey(key)
    setEditApiKey('')
    setEditLabel(key.label ?? '')
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
        className="flex-row items-center justify-between gap-3"
        title="Provider API Keys"
        description="Bring your own AI provider keys."
        action={
          <div className="shrink-0">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-3 sm:px-4 py-2 text-sm font-medium gap-1.5 transition-colors whitespace-nowrap">
                <Plus className="size-4 shrink-0" />
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
                  className="flex items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Key className="size-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize">{key.provider}</span>
                        {key.label && (
                          <span className="truncate text-xs text-muted-foreground">({key.label})</span>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground font-mono">{key.keyPreview}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                    <Badge className="hidden sm:inline-flex text-[10px] bg-success/10 text-success border-success/20">
                      Connected
                    </Badge>
                    <TooltipProvider>
                      <Popover>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <PopoverTrigger
                                render={<Button size="icon" variant="ghost" />}
                              >
                                <Eye className="size-3.5 text-muted-foreground" />
                              </PopoverTrigger>
                            }
                          />
                          <TooltipContent side="top" className="text-xs">
                            Preview
                          </TooltipContent>
                        </Tooltip>
                        <PopoverContent className="w-64">
                          <PopoverHeader>
                            <PopoverTitle className="capitalize">{key.provider}</PopoverTitle>
                            <PopoverDescription>
                              {key.label || 'No label set'}
                            </PopoverDescription>
                          </PopoverHeader>
                          <div className="mt-3 space-y-1">
                            <p className="text-xs text-muted-foreground">API key</p>
                            <p className="font-mono text-sm">{key.keyPreview}</p>
                          </div>
                          <p className="mt-3 text-[10px] text-muted-foreground">
                            Added {new Date(key.createdAt).toLocaleDateString()}
                          </p>
                        </PopoverContent>
                      </Popover>

                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEdit(key)}
                            >
                              <Pencil className="size-3.5 text-muted-foreground" />
                            </Button>
                          }
                        />
                        <TooltipContent side="top" className="text-xs">
                          Edit
                        </TooltipContent>
                      </Tooltip>

                      <AlertDialog>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <AlertDialogTrigger
                                render={<Button size="icon" variant="ghost" />}
                              >
                                <Trash2 className="size-3.5 text-destructive" />
                              </AlertDialogTrigger>
                            }
                          />
                          <TooltipContent side="top" className="text-xs">
                            Delete
                          </TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete provider key?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove your{' '}
                              <span className="capitalize font-medium">{key.provider}</span> key
                              {key.label ? ` (${key.label})` : ''}. Agents will fall back to the
                              default system key. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => deleteMutation.mutate(key.id)}
                              disabled={deleteMutation.isPending}
                            >
                              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TooltipProvider>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editKey} onOpenChange={(o) => !o && setEditKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Provider Key</DialogTitle>
            <DialogDescription>
              Update the label or replace the API key for{' '}
              <span className="capitalize font-medium">{editKey?.provider}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={editApiKey}
                onChange={(e) => setEditApiKey(e.target.value)}
                placeholder={editKey?.keyPreview || 'Leave blank to keep current'}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to keep the existing key.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Label (optional)</Label>
              <Input
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="My OpenAI key"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditKey(null)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                editKey &&
                updateMutation.mutate({
                  keyId: editKey.id,
                  apiKey: editApiKey || undefined,
                  label: editLabel || undefined,
                })
              }
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
