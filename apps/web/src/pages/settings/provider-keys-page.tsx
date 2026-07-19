import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Trash2,
  Pencil,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  RefreshCw,
} from 'lucide-react'
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
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
import { toast } from '@/lib/toast'
import { formatRelativeTime } from '@/lib/utils'

interface ProviderKey {
  id: string
  provider: string
  keyPreview: string
  label: string | null
  createdAt: string
}

type ProviderMeta = {
  name: string
  initial: string
  color: string
  placeholder: string
}

const PROVIDER_META: Record<string, ProviderMeta> = {
  openai: { name: 'OpenAI', initial: 'O', color: 'bg-info/10 text-info', placeholder: 'sk-proj-...' },
  anthropic: { name: 'Anthropic', initial: 'A', color: 'bg-warning/10 text-warning', placeholder: 'sk-ant-...' },
  google: { name: 'Google AI', initial: 'G', color: 'bg-success/10 text-success', placeholder: 'AIzaSy...' },
  groq: { name: 'Groq', initial: 'G', color: 'bg-primary/10 text-primary', placeholder: 'gsk_...' },
  kie: { name: 'KIE AI', initial: 'K', color: 'bg-info/10 text-info', placeholder: 'kie-...' },
  openrouter: { name: 'OpenRouter', initial: 'O', color: 'bg-success/10 text-success', placeholder: 'sk-or-...' },
  mistral: { name: 'Mistral', initial: 'M', color: 'bg-warning/10 text-warning', placeholder: '...' },
  together: { name: 'Together', initial: 'T', color: 'bg-primary/10 text-primary', placeholder: '...' },
  deepseek: { name: 'DeepSeek', initial: 'D', color: 'bg-info/10 text-info', placeholder: 'sk-...' },
  perplexity: { name: 'Perplexity', initial: 'P', color: 'bg-success/10 text-success', placeholder: 'pplx-...' },
  opencode: { name: 'OpenCode Zen', initial: 'Z', color: 'bg-primary/10 text-primary', placeholder: 'oc-...' },
}

const PROVIDER_ORDER = [
  'openai',
  'anthropic',
  'google',
  'groq',
  'kie',
  'openrouter',
  'mistral',
  'together',
  'deepseek',
  'perplexity',
  'opencode',
]

const FALLBACK_META: ProviderMeta = {
  name: 'Unknown',
  initial: '?',
  color: 'bg-muted text-muted-foreground',
  placeholder: '...',
}

function getProviderMeta(id: string): ProviderMeta {
  return PROVIDER_META[id] ?? { ...FALLBACK_META, name: id, initial: id.charAt(0).toUpperCase() }
}

export default function ProviderKeysPage() {
  const { orgId, isLoading: orgLoading } = useOrg()
  const queryClient = useQueryClient()

  const {
    data: keys,
    isLoading,
    isError,
    refetch,
  } = useQuery({
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

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const configuredProviders = useMemo(
    () => new Set(keys?.map((k) => k.provider) ?? []),
    [keys],
  )

  const availableProviders = useMemo(
    () => PROVIDER_ORDER.filter((id) => !configuredProviders.has(id)),
    [configuredProviders],
  )

  const createMutation = useMutation({
    mutationFn: (data: { provider: string; apiKey: string; label?: string }) => {
      if (!orgId) throw new Error('No organization selected')
      return keysApi.create(orgId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-keys', orgId] })
      setOpen(false)
      resetForm()
      toast.success('Provider key added')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to add provider key'),
  })

  const updateMutation = useMutation({
    mutationFn: (data: { keyId: string; apiKey?: string; label?: string }) => {
      if (!orgId) throw new Error('No organization selected')
      return keysApi.update(orgId, data.keyId, { apiKey: data.apiKey, label: data.label })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-keys', orgId] })
      setEditKey(null)
      toast.success('Provider key updated')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to update provider key'),
  })

  const deleteMutation = useMutation({
    mutationFn: (keyId: string) => keysApi.delete(orgId!, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-keys', orgId] })
      setDeleteId(null)
      toast.success('Provider key deleted')
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete provider key'),
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

  const pageLoading = orgLoading || isLoading

  return (
    <div className="space-y-6">
      <PageHeader
        className="flex-row items-center justify-between gap-3"
        title="Provider API Keys"
        description="Bring your own AI provider keys for your agents."
        action={
          <div className="shrink-0">
            <Button onClick={() => setOpen(true)} disabled={pageLoading}>
              <Plus className="size-4 shrink-0" />
              Add Key
            </Button>
            <Dialog
              open={open}
              onOpenChange={(o) => {
                setOpen(o)
                if (!o) resetForm()
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Provider Key</DialogTitle>
                  <DialogDescription>
                    Your API key is stored encrypted and used only for your agents.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Select value={provider} onValueChange={setProvider}>
                      <SelectTrigger id="provider">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProviders.length === 0 ? (
                          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
                            All providers are configured.
                          </div>
                        ) : (
                          availableProviders.map((id) => {
                            const meta = getProviderMeta(id)
                            return (
                              <SelectItem key={id} value={id}>
                                {meta.name}
                              </SelectItem>
                            )
                          })
                        )}
                      </SelectContent>
                    </Select>
                    {availableProviders.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Delete a key to add a different provider.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={provider ? getProviderMeta(provider).placeholder : 'sk-...'}
                      autoComplete="off"
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste the secret key from your provider dashboard.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="label">Label (optional)</Label>
                    <Input
                      id="label"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="Production key"
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

      {/* Security callout */}
      <div className="flex items-start gap-3 rounded-lg border border-success/20 bg-success/5 p-3.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-success/10">
          <ShieldCheck className="size-4 text-success" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium">Your keys are encrypted</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Keys are stored encrypted and only decrypted when running agents. They are never
            exposed in logs, responses, or the dashboard.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="flex items-center gap-2">
                Your Provider Keys
                {keys && keys.length > 0 && (
                  <Badge variant="secondary" className="text-[10px]">
                    {keys.length}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                Keys are used when running agents. If no key is configured for a provider, the
                default system key is used.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pageLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                  <Skeleton className="size-9 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
                <AlertCircle className="size-6 text-destructive" />
              </div>
              <p className="text-sm font-medium">Failed to load provider keys</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Something went wrong while fetching your keys.
              </p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                <RefreshCw className="size-3.5" />
                Try again
              </Button>
            </div>
          ) : !keys || keys.length === 0 ? (
            <EmptyState
              icon={KeyRound}
              title="No provider keys"
              description="Add API keys for AI providers you want to use. Without a key, agents fall back to the default system key."
              action={{
                label: 'Add your first key',
                onClick: () => setOpen(true),
              }}
            />
          ) : (
            <div className="space-y-2.5">
              {keys.map((key) => {
                const meta = getProviderMeta(key.provider)
                return (
                  <div
                    key={key.id}
                    className="group flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${meta.color}`}
                      >
                        {meta.initial}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{meta.name}</span>
                          {key.label && (
                            <Badge variant="outline" className="text-[10px] font-normal">
                              {key.label}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2">
                          <code className="truncate text-xs text-muted-foreground">
                            {key.keyPreview}
                          </code>
                          <span className="text-muted-foreground/40">·</span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">
                            {formatRelativeTime(key.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                size="icon-sm"
                                variant="ghost"
                                aria-label={`Edit ${meta.name} key`}
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
                        <AlertDialog
                          open={deleteId === key.id}
                          onOpenChange={(o) => {
                            if (!o) setDeleteId(null)
                          }}
                        >
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <AlertDialogTrigger
                                  render={
                                    <Button
                                      size="icon-sm"
                                      variant="ghost"
                                      aria-label={`Delete ${meta.name} key`}
                                    />
                                  }
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
                                <span className="font-medium capitalize">{meta.name}</span> key
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
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editKey}
        onOpenChange={(o) => {
          if (!o) setEditKey(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Provider Key</DialogTitle>
            <DialogDescription>
              Update the label or replace the API key for{' '}
              <span className="font-medium">{editKey ? getProviderMeta(editKey.provider).name : ''}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editApiKey">API Key</Label>
              <Input
                id="editApiKey"
                type="password"
                value={editApiKey}
                onChange={(e) => setEditApiKey(e.target.value)}
                placeholder={editKey?.keyPreview || 'Leave blank to keep current'}
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to keep the existing key.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLabel">Label (optional)</Label>
              <Input
                id="editLabel"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="Production key"
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
