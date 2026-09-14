import { useMemo, useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Key, Save, Trash2, Search, CheckCircle2, ArrowUpRight, ArrowDownToLine, X, Unlink } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PageHeader } from '@/components/shared/page-header'
import { PageContainer } from '@/components/shared/page-container'
import { EmptyState } from '@/components/shared/empty-state'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { useOrg } from '@/lib/org-context'
import { COMPOSIO_ENABLED, COMPOSIO_LAUNCH_MESSAGE } from '@/lib/feature-flags'
import { useComposioConfig, useComposioToolkits, useCreateComposioConfig, useUpdateComposioConfig, useDeleteComposioConfig, useConnectComposioToolkit, useDisconnectComposioToolkit } from '@/lib/hooks/use-composio'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'

/**
 * Toolkit catalog (curation kept in sync with the backend's COMMON_TOOLKITS).
 * `icon` is the official brand slug on theSVG — rendered via its jsDelivr CDN
 * with lazy loading so nothing heavy is fetched until the card scrolls in.
 */
interface ToolkitDef {
  slug: string
  name: string
  category: Category
  /** theSVG slug when it differs from the Composio slug */
  icon?: string
}

type Category = 'Productivity' | 'Developer Tools' | 'Communication' | 'CRM & Sales' | 'Finance' | 'Cloud'

const TOOLKIT_CATALOG: ToolkitDef[] = [
  // Productivity
  { slug: 'notion', name: 'Notion', category: 'Productivity' },
  { slug: 'linear', name: 'Linear', category: 'Productivity' },
  { slug: 'jira', name: 'Jira', category: 'Productivity' },
  { slug: 'trello', name: 'Trello', category: 'Productivity' },
  { slug: 'asana', name: 'Asana', category: 'Productivity' },
  { slug: 'airtable', name: 'Airtable', category: 'Productivity' },
  { slug: 'googlecalendar', name: 'Google Calendar', category: 'Productivity', icon: 'google-calendar' },
  { slug: 'gmail', name: 'Gmail', category: 'Productivity' },
  { slug: 'zoom', name: 'Zoom', category: 'Productivity' },
  { slug: 'calendly', name: 'Calendly', category: 'Productivity' },
  { slug: 'typeform', name: 'Typeform', category: 'Productivity' },
  { slug: 'docusign', name: 'DocuSign', category: 'Productivity' },
  // Developer Tools
  { slug: 'github', name: 'GitHub', category: 'Developer Tools' },
  { slug: 'gitlab', name: 'GitLab', category: 'Developer Tools' },
  { slug: 'bitbucket', name: 'Bitbucket', category: 'Developer Tools' },
  { slug: 'vercel', name: 'Vercel', category: 'Developer Tools' },
  { slug: 'netlify', name: 'Netlify', category: 'Developer Tools' },
  { slug: 'cloudflare', name: 'Cloudflare', category: 'Developer Tools' },
  { slug: 'sentry', name: 'Sentry', category: 'Developer Tools' },
  { slug: 'datadog', name: 'Datadog', category: 'Developer Tools' },
  { slug: 'pagerduty', name: 'PagerDuty', category: 'Developer Tools' },
  { slug: 'figma', name: 'Figma', category: 'Developer Tools' },
  // Communication
  { slug: 'slack', name: 'Slack', category: 'Communication' },
  { slug: 'discord', name: 'Discord', category: 'Communication' },
  { slug: 'twilio', name: 'Twilio', category: 'Communication' },
  { slug: 'whatsapp', name: 'WhatsApp', category: 'Communication' },
  { slug: 'telegram', name: 'Telegram', category: 'Communication' },
  { slug: 'intercom', name: 'Intercom', category: 'Communication' },
  { slug: 'zendesk', name: 'Zendesk', category: 'Communication' },
  // CRM & Sales
  { slug: 'hubspot', name: 'HubSpot', category: 'CRM & Sales' },
  { slug: 'salesforce', name: 'Salesforce', category: 'CRM & Sales' },
  { slug: 'linkedin', name: 'LinkedIn', category: 'CRM & Sales' },
  { slug: 'reddit', name: 'Reddit', category: 'CRM & Sales' },
  { slug: 'youtube', name: 'YouTube', category: 'CRM & Sales' },
  // Finance
  { slug: 'stripe', name: 'Stripe', category: 'Finance' },
  { slug: 'shopify', name: 'Shopify', category: 'Finance' },
  { slug: 'quickbooks', name: 'QuickBooks', category: 'Finance' },
  { slug: 'xero', name: 'Xero', category: 'Finance' },
  // Cloud
  { slug: 'aws', name: 'AWS', category: 'Cloud' },
  { slug: 'gcp', name: 'Google Cloud', category: 'Cloud', icon: 'google-cloud' },
  { slug: 'azure', name: 'Azure', category: 'Cloud' },
]

const CATEGORIES = ['All', 'Productivity', 'Developer Tools', 'Communication', 'CRM & Sales', 'Finance', 'Cloud'] as const

/** How many cards render initially / per "Load more" click. Keeps DOM + network light. */
const PAGE_SIZE = 24

/** Official brand icon URL (theSVG via jsDelivr CDN). */
function brandIconUrl(iconSlug: string): string {
  return `https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/${iconSlug}/default.svg`
}

function ToolkitLogo({ iconSlug, name, className }: { iconSlug: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={cn('flex items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground', className)}>
        {name.slice(0, 2).toUpperCase()}
      </div>
    )
  }
  return (
    <img
      src={brandIconUrl(iconSlug)}
      alt={`${name} logo`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className={cn('object-contain', className)}
    />
  )
}

/** Connection status chip — only rendered when connected. */
function StatusChip() {
  return (
    <Badge variant="outline" className="gap-1 border-success/25 bg-success/5 text-[11px] font-medium text-success">
      <CheckCircle2 className="size-3" /> Connected
    </Badge>
  )
}

export default function ComposioPage() {
  const { orgId, isLoading: orgLoading } = useOrg()
  const queryClient = useQueryClient()

  const { data: config, isLoading: configLoading, error: configError } = useComposioConfig()
  // Keep connection status fresh — flips cards to "Connected" after OAuth completes.
  const { data: toolkits = [], isLoading: toolkitsLoading } = useComposioToolkits({ refetchInterval: 30_000 })
  const createConfig = useCreateComposioConfig()
  const updateConfig = useUpdateComposioConfig()
  const deleteConfig = useDeleteComposioConfig()
  const connectToolkit = useConnectComposioToolkit()
  const disconnectToolkit = useDisconnectComposioToolkit()

  const [apiKey, setApiKey] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Toolkit picker state
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [selectedToolkits, setSelectedToolkits] = useState<string[]>([])
  const [dirty, setDirty] = useState(false)

  // Seed local selection from the saved config (one-way; edits stay local until save)
  useEffect(() => {
    if (config?.enabledToolkits) {
      setSelectedToolkits(config.enabledToolkits)
      setDirty(false)
    }
  }, [config?.enabledToolkits])

  // Reset pagination whenever the filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query, category])

  // OAuth redirect-back: Composio lands here after the hosted auth page with
  // ?composio_connect=<toolkit>&status=success|failed. Show the result,
  // refresh connection status, and clean the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const toolkit = params.get('composio_connect')
    if (!toolkit) return

    const status = params.get('status')
    params.delete('composio_connect')
    params.delete('status')
    params.delete('connected_account_id')
    const qs = params.toString()
    window.history.replaceState(null, '', `${window.location.pathname}${qs ? `?${qs}` : ''}`)

    if (status === 'success') {
      toast.success(`${toolkit} connected successfully`)
    } else {
      toast.error(`${toolkit} connection failed — please try again`)
    }
    void queryClient.invalidateQueries({ queryKey: ['composio-toolkits', orgId] })
  }, [queryClient, orgId])

  const statusBySlug = useMemo(() => new Map(toolkits.map((t) => [t.slug, t])), [toolkits])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return TOOLKIT_CATALOG.filter((t) => {
      if (category !== 'All' && t.category !== category) return false
      if (!q) return true
      return t.name.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q)
    })
  }, [query, category])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  const enabledSet = useMemo(() => new Set(selectedToolkits), [selectedToolkits])
  const selectedDirtyCount = useMemo(
    () => selectedToolkits.filter((s) => !(config?.enabledToolkits ?? []).includes(s)).length +
      (config?.enabledToolkits ?? []).filter((s) => !selectedToolkits.includes(s)).length,
    [selectedToolkits, config?.enabledToolkits],
  )

  const handleToggleToolkit = (slug: string) => {
    if (!config?.hasApiKey) return
    setDirty(true)
    setSelectedToolkits((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    )
  }

  const handleSave = async () => {
    if (!config?.hasApiKey) {
      if (!apiKey.trim()) {
        toast.error('Please enter your Composio API key')
        return
      }
      await createConfig.mutateAsync({ apiKey: apiKey.trim(), enabledToolkits: selectedToolkits })
    } else {
      await updateConfig.mutateAsync({ enabledToolkits: selectedToolkits })
    }
    setDirty(false)
  }

  const handleDelete = async () => {
    await deleteConfig.mutateAsync()
    setShowDeleteDialog(false)
    setApiKey('')
    setSelectedToolkits([])
  }

  // Coming Soon gate — the feature is fully built but not launched yet. Only
  // the centered Coming Soon state is shown; all config/catalog UI stays in
  // the code below.
  if (!COMPOSIO_ENABLED) {
    return (
      <PageContainer>
        <div className="flex flex-1 items-center justify-center py-16">
          <EmptyState
            title="Coming Soon"
            description={COMPOSIO_LAUNCH_MESSAGE}
          />
        </div>
      </PageContainer>
  )
  }

  if (orgLoading || configLoading) {
    return (
      <PageContainer>
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  if (configError) {
    return (
      <PageContainer>
        <EmptyState
          title="Unable to load Composio settings"
          description="Please try again later"
          action={<Button onClick={() => window.location.reload()}>Retry</Button>}
        />
      </PageContainer>
    )
  }

  const hasApiKey = !!config?.hasApiKey
  const pending = createConfig.isPending || updateConfig.isPending

  return (
    <PageContainer>
      <PageHeader
        title="Composio Integrations"
        description="Connect your agents to 40+ apps — Gmail, Slack, GitHub, Notion and more. Enable toolkits for your organization, then attach them per agent."
      />

      <div className="space-y-6">
        {/* API Configuration */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>
                  One organization-wide key from the{' '}
                  <a
                    href="https://app.composio.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Composio Dashboard
                  </a>
                  . Stored encrypted (AES-256-GCM).
                </CardDescription>
              </div>
              {hasApiKey && (
                <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <AlertDialogTrigger
                    render={
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                        <Trash2 /> Remove
                      </Button>
                    }
                  />
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Composio configuration?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This removes your API key and disables all Composio toolkits for this organization. Connected
                        accounts remain in your Composio dashboard. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground">
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {hasApiKey ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-success/25 bg-success/5 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-success/10 text-success">
                    <CheckCircle2 className="size-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">API key configured</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedToolkits.length} toolkit{selectedToolkits.length !== 1 ? 's' : ''} enabled
                      {selectedToolkits.length > 0 && ` · ${toolkits.filter((t) => enabledSet.has(t.slug) && t.connected).length} connected`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative max-w-md">
                  <Key className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Composio API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    disabled={createConfig.isPending}
                    autoComplete="off"
                    className="pl-9"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && apiKey.trim()) void handleSave()
                    }}
                  />
                </div>
                <Button onClick={handleSave} disabled={createConfig.isPending || !apiKey.trim()}>
                  {createConfig.isPending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
                  Save & Verify
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Toolkit Catalog */}
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle>App Catalog</CardTitle>
                <CardDescription>
                  Enable the apps your agents can use. Enable first, then use{' '}
                  <span className="font-medium text-foreground">Connect</span> to authorize via Composio's secure hosted
                  OAuth page.
                </CardDescription>
              </div>
              {hasApiKey && dirty && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedToolkits(config?.enabledToolkits ?? [])
                      setDirty(false)
                    }}
                    disabled={pending}
                  >
                    <X data-icon="inline-start" /> Discard
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={pending}>
                    {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
                    Save {selectedDirtyCount > 0 ? `(${selectedDirtyCount} change${selectedDirtyCount !== 1 ? 's' : ''})` : ''}
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search + category filter */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  role="searchbox"
                  aria-label="Search apps"
                  placeholder="Search apps…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by category">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="tab"
                    aria-selected={category === c}
                    onClick={() => setCategory(c)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      category === c
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {toolkitsLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border p-4">
                    <div className="size-10 shrink-0 animate-pulse rounded-lg bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !hasApiKey ? (
              <EmptyState
                title="Add your API key to manage apps"
                description="Once your Composio key is saved, you can enable and connect apps here."
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                title={`No apps match "${query}"`}
                description="Try a different name or clear the category filter."
              />
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {visible.map((toolkit) => {
                    const status = statusBySlug.get(toolkit.slug)
                    const isEnabled = enabledSet.has(toolkit.slug)
                    const isConnected = status?.connected ?? false
                    const isConnecting = connectToolkit.isPending && connectToolkit.variables === toolkit.slug
                    const isDisconnecting = disconnectToolkit.isPending && disconnectToolkit.variables === toolkit.slug

                    return (
                      <div
                        key={toolkit.slug}
                        className={cn(
                          'group relative flex flex-col gap-3 rounded-lg border p-4 transition-colors',
                          isEnabled || isConnecting
                            ? 'border-primary/40 bg-primary/[0.04]'
                            : 'border-border bg-card hover:border-border/80 hover:bg-muted/30',
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className={cn(
                              'flex size-10 shrink-0 items-center justify-center rounded-lg border bg-white p-1.5 dark:bg-white/95',
                              !isEnabled && 'opacity-80 transition-opacity group-hover:opacity-100',
                            )}>
                              <ToolkitLogo
                                iconSlug={toolkit.icon ?? toolkit.slug}
                                name={toolkit.name}
                                className="size-full"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium leading-tight">{toolkit.name}</p>
                            </div>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => handleToggleToolkit(toolkit.slug)}
                            disabled={!hasApiKey || pending}
                            size="sm"
                            aria-label={`${isEnabled ? 'Disable' : 'Enable'} ${toolkit.name}`}
                          />
                        </div>
                        {/* Uniform footer on EVERY card → identical heights, no gaps.
                            Disabled cards show their category here — connection
                            state/actions are only meaningful when enabled. */}
                        <div className="flex h-6 items-center justify-between gap-2">
                          {isEnabled && isConnecting ? (
                            <Badge variant="outline" className="gap-1 text-[11px] font-medium text-muted-foreground">
                              <Loader2 className="size-3 animate-spin" /> Connecting…
                            </Badge>
                          ) : isEnabled && isConnected ? (
                            <>
                              <StatusChip />
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger
                                    aria-label={`Disconnect ${toolkit.name}`}
                                    disabled={disconnectToolkit.isPending}
                                    onClick={() => disconnectToolkit.mutate(toolkit.slug)}
                                    className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                                  >
                                    {isDisconnecting ? (
                                      <Loader2 className="size-3.5 animate-spin" />
                                    ) : (
                                      <Unlink className="size-3.5" />
                                    )}
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {isDisconnecting ? 'Disconnecting…' : `Disconnect ${toolkit.name} — revokes access`}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </>
                          ) : isEnabled ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger
                                  disabled={connectToolkit.isPending}
                                  onClick={() => connectToolkit.mutate(toolkit.slug)}
                                  className={cn(buttonVariants({ variant: 'outline', size: 'xs' }))}
                                >
                                  <ArrowUpRight /> Connect
                                </TooltipTrigger>
                                <TooltipContent>Authorize {toolkit.name} via Composio&apos;s secure OAuth page</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">{toolkit.category}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Load more — progressive rendering keeps the page fast */}
                {hasMore && (
                  <div className="flex justify-center pt-1">
                    <Button variant="outline" size="sm" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
                      <ArrowDownToLine data-icon="inline-start" />
                      Load more ({filtered.length - visibleCount} remaining)
                    </Button>
                  </div>
                )}

                <p className="border-t pt-4 text-xs text-muted-foreground">
                  {filtered.length} app{filtered.length !== 1 ? 's' : ''}
                  {category !== 'All' && ` in ${category}`}
                  {query && ` matching “${query}”`} · Showing {visible.length}. Enable an app to expose its tools to your
                  agents; connect it once and every agent reuses the same authorization.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
