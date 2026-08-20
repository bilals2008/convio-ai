import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Trash2,
  Pencil,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  RefreshCw,
  PlugZap,
  Lightbulb,
  LayoutGrid,
  List,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/shared/loading'
import { SearchInput } from '@/components/shared/search-input'
import { SelectionCheckbox } from '@/components/shared/selection-checkbox'
import { BulkActionBar } from '@/components/shared/bulk-action-bar'
import { useBulkSelection } from '@/lib/hooks/use-bulk-selection'
import { ProviderLogo } from '@/components/agents/provider-logos'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { providerKeys as keysApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { toast } from '@/lib/toast'
import { cn, formatRelativeTime } from '@/lib/utils'

interface ProviderKey {
  id: string
  provider: string
  keyPreview: string
  label: string | null
  createdAt: string
}

type ProviderMeta = {
  name: string
  placeholder: string
}

const PROVIDER_META: Record<string, ProviderMeta> = {
  openai: { name: 'OpenAI', placeholder: 'sk-proj-...' },
  anthropic: { name: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { name: 'Google AI', placeholder: 'AIzaSy...' },
  groq: { name: 'Groq', placeholder: 'gsk_...' },
  openrouter: { name: 'OpenRouter', placeholder: 'sk-or-...' },
  mistral: { name: 'Mistral', placeholder: '...' },
  together: { name: 'Together', placeholder: '...' },
  deepseek: { name: 'DeepSeek', placeholder: 'sk-...' },
  perplexity: { name: 'Perplexity', placeholder: 'pplx-...' },
  opencode: { name: 'OpenCode Zen', placeholder: 'oc-...' },
}

const PROVIDER_ORDER = [
  'openai',
  'anthropic',
  'google',
  'groq',
  'openrouter',
  'mistral',
  'together',
  'deepseek',
  'perplexity',
  'opencode',
]

const FALLBACK_META: ProviderMeta = {
  name: 'Unknown',
  placeholder: '...',
}

function getProviderMeta(id: string): ProviderMeta {
  return PROVIDER_META[id] ?? { ...FALLBACK_META, name: id }
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

  // Toolbar: text search + per-provider filter
  const [search, setSearch] = useState('')
  const [providerFilter, setProviderFilter] = useState('all')
  const [view, setView] = useState<'list' | 'card'>(() => {
    return localStorage.getItem('provider-keys-view') === 'list' ? 'list' : 'card'
  })
  const changeView = (next: 'list' | 'card') => {
    setView(next)
    localStorage.setItem('provider-keys-view', next)
  }
  // Tracks which row is running a key test so its button can show a spinner
  const [testingId, setTestingId] = useState<string | null>(null)

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

  const visibleKeys = useMemo(() => {
    if (!keys) return []
    const seen = new Set<string>()
    return keys.filter((k) => {
      if (seen.has(k.provider)) return false
      seen.add(k.provider)
      return true
    })
  }, [keys])

  const displayKeys = useMemo(() => {
    const q = search.trim().toLowerCase()
    return visibleKeys.filter((k) => {
      if (providerFilter !== 'all' && k.provider !== providerFilter) return false
      if (!q) return true
      const meta = getProviderMeta(k.provider)
      const hay = `${meta.name} ${k.label ?? ''} ${k.keyPreview}`.toLowerCase()
      return hay.includes(q)
    })
  }, [visibleKeys, search, providerFilter])

  const bulk = useBulkSelection(displayKeys)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const exitSelectionMode = bulk.exitSelectionMode

  useEffect(() => {
    exitSelectionMode()
  }, [search, providerFilter, view, exitSelectionMode])

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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!orgId) throw new Error('No organization selected')
      await Promise.all(ids.map((id) => keysApi.delete(orgId, id)))
    },
    onSuccess: (_data, ids) => {
      queryClient.invalidateQueries({ queryKey: ['provider-keys', orgId] })
      toast.success(`${ids.length} provider key${ids.length !== 1 ? 's' : ''} deleted`)
      bulk.exitSelectionMode()
      setBulkDeleteOpen(false)
    },
    onError: () => {
      toast.error('Failed to delete some keys')
      bulk.exitSelectionMode()
      setBulkDeleteOpen(false)
    },
  })

  async function handleTest(keyId: string) {
    if (!orgId) return
    setTestingId(keyId)
    try {
      const res = await keysApi.test(orgId, keyId)
      const r = res.data?.data as { ok: boolean; message: string } | undefined
      if (r?.ok) toast.success(r.message || 'Key is valid')
      else toast.error(r?.message || 'Test failed')
    } catch {
      toast.error('Could not test this key')
    } finally {
      setTestingId(null)
    }
  }

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

  const hasActiveSearch = !!search.trim()

  function renderRowActions(key: ProviderKey) {
    const meta = getProviderMeta(key.provider)
    const isTesting = testingId === key.id
    return (
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="icon-sm"
                  variant="ghost"
                  aria-label={`Test ${meta.name} key`}
                  onClick={() => handleTest(key.id)}
                  disabled={testingId !== null}
                >
                  {isTesting ? (
                    <RefreshCw className="size-3.5 animate-spin text-primary" />
                  ) : (
                    <PlugZap className="size-3.5 text-muted-foreground" />
                  )}
                </Button>
              }
            />
            <TooltipContent side="top" className="text-xs">
              Test connection
            </TooltipContent>
          </Tooltip>
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
            onOpenChange={(o) => setDeleteId(o ? key.id : null)}
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
                  {key.label ? ` (${key.label})` : ''}. Agents will fall back to the default
                  system key. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
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
    )
  }

  function renderListItem(key: ProviderKey) {
    const meta = getProviderMeta(key.provider)
    return (
      <div
        key={key.id}
        className="group flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/30"
      >
        <div className="flex min-w-0 items-center gap-3">
          <ProviderLogo provider={key.provider} className="size-7 rounded-md" />
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
        <div className="flex shrink-0 items-center gap-2">
          <SelectionCheckbox
            isSelected={bulk.isSelected(key.id)}
            onToggle={() => bulk.toggleSelect(key.id)}
          />
          {renderRowActions(key)}
        </div>
      </div>
    )
  }

  function renderCard(key: ProviderKey) {
    const meta = getProviderMeta(key.provider)
    return (
      <div
        key={key.id}
        className="group relative flex flex-col rounded-xl border border-border/60 bg-card p-5 transition-all hover:border-primary/30 hover:shadow-soft-lg"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <ProviderLogo provider={key.provider} className="size-9 rounded-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-[15px] font-semibold">{meta.name}</h3>
                {key.label && (
                  <Badge variant="outline" className="shrink-0 text-[10px] font-normal">
                    {key.label}
                  </Badge>
                )}
              </div>
              <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                {key.keyPreview}
              </p>
            </div>
          </div>
          <SelectionCheckbox
            isSelected={bulk.isSelected(key.id)}
            onToggle={() => bulk.toggleSelect(key.id)}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            <span className="flex items-center gap-1">
              <ShieldCheck className="size-3" />
              Encrypted
            </span>
          </Badge>
          <span className="text-[11px] text-muted-foreground">
            Added {formatRelativeTime(key.createdAt)}
          </span>
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3">
          <span className="text-xs text-muted-foreground">{meta.name} key</span>
          {renderRowActions(key)}
        </div>
      </div>
    )
  }

  return (
    <PageContainer>
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
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Your keys are encrypted</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Keys are stored encrypted and only decrypted when running agents. They are never
            exposed in logs, responses, or the dashboard.
          </p>
        </div>
        <Popover>
          <PopoverTrigger
            render={
              <Button size="icon-sm" variant="ghost" aria-label="Show tips">
                <Lightbulb className="size-4 text-primary" />
              </Button>
            }
          />
          <PopoverContent align="end" side="top" className="w-72">
            <p className="text-sm font-medium">Tips</p>
            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              <li>Use the Test button to verify a key before running agents.</li>
              <li>Without a key for a provider, agents fall back to the default system key.</li>
              <li>Add a label to tell keys apart, e.g. "Production" or "Staging".</li>
              <li>Only org admins can add, edit, or delete keys.</li>
            </ul>
          </PopoverContent>
        </Popover>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search providers, labels, or key previews..."
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder="Provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All providers</SelectItem>
              {visibleKeys.map((k) => {
                const meta = getProviderMeta(k.provider)
                return (
                  <SelectItem key={k.provider} value={k.provider}>
                    {meta.name}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => changeView('card')}
              className={cn(
                'inline-flex size-7 items-center justify-center rounded-md text-sm transition-colors',
                view === 'card'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="Card view"
            >
              <LayoutGrid className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => changeView('list')}
              className={cn(
                'inline-flex size-7 items-center justify-center rounded-md text-sm transition-colors',
                view === 'list'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label="List view"
            >
              <List className="size-3.5" />
            </button>
          </div>
      </div>
      </div>

      <div>
          {pageLoading ? (
            view === 'card' ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full" />
                ))}
              </div>
            ) : (
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
            )
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
          ) : visibleKeys.length === 0 ? (
            <EmptyState
              icon={KeyRound}
              title="No provider keys"
              description="Add API keys for AI providers you want to use. Without a key, agents fall back to the default system key."
              action={{
                label: 'Add your first key',
                onClick: () => setOpen(true),
              }}
            />
          ) : displayKeys.length === 0 ? (
            <EmptyState
              icon={KeyRound}
              title="No keys match your search"
              description="Try a different search term or clear the search."
              action={{ label: 'Clear search', onClick: () => setSearch('') }}
            />
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  {displayKeys.length} key{displayKeys.length !== 1 ? 's' : ''}
                  {hasActiveSearch ? ' found' : ''}
                </p>
                {hasActiveSearch && (
                  <Button variant="ghost" size="sm" onClick={() => setSearch('')}>
                    Clear search
                  </Button>
                )}
              </div>

              {bulk.selectedCount > 0 && (
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2">
                  <button
                    type="button"
                    onClick={bulk.toggleSelectAll}
                    className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Checkbox checked={bulk.isAllSelected} className="size-4" />
                    {bulk.isAllSelected ? 'Deselect all' : `Select all ${displayKeys.length}`}
                  </button>
                  <BulkActionBar
                    onExitSelectionMode={bulk.exitSelectionMode}
                    action={
                      <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
                        <Trash2 className="size-4" />
                        Delete ({bulk.selectedCount})
                      </Button>
                    }
                  />
                </div>
              )}

              {view === 'card' ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {displayKeys.map(renderCard)}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {displayKeys.map(renderListItem)}
                </div>
              )}
            </>
          )}
        </div>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {bulk.selectedCount} provider key{bulk.selectedCount !== 1 ? 's' : ''}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the selected keys. Agents will fall back to the
              default system key for those providers. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={bulkDeleteMutation.isPending}
              onClick={() => bulkDeleteMutation.mutate(Array.from(bulk.selectedIds))}
            >
              {bulkDeleteMutation.isPending ? 'Deleting...' : `Delete ${bulk.selectedCount}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </PageContainer>
  )
}
