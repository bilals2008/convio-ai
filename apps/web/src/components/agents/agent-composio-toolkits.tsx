import { useMemo, useState } from 'react'
import { CheckCircle2, Loader2, Plus, Search, X } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useComposioToolkits } from '@/lib/hooks/use-composio'

/**
 * Connected Composio toolkits picker for the Agent Builder.
 *
 * Only CONNECTED toolkits are offered here — an agent can only use toolkits
 * whose OAuth connection is active at the org level. The full catalog
 * (enable/connect) lives in Settings → Composio; this picker links there for
 * everything else.
 *
 * Brand logos come from theSVG (jsDelivr CDN) with lazy loading.
 */

/** theSVG slug when it differs from the Composio slug. */
const ICON_OVERRIDES: Record<string, string> = {
  googlecalendar: 'google-calendar',
  gcp: 'google-cloud',
}

function brandIconUrl(iconSlug: string): string {
  return `https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/${iconSlug}/default.svg`
}

function ToolkitLogo({ iconSlug, name, className }: { iconSlug: string; name: string; className?: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className={cn('flex items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground', className)}>
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

interface AgentComposioToolkitsProps {
  selectedToolkits: string[]
  onToggle: (slug: string, enabled: boolean) => void
  disabled?: boolean
  compact?: boolean
}

export function AgentComposioToolkits({
  selectedToolkits,
  onToggle,
  disabled,
}: AgentComposioToolkitsProps) {
  const { data: toolkits = [], isLoading } = useComposioToolkits()
  const [showAllOpen, setShowAllOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Only connected toolkits are usable by an agent.
  const connected = useMemo(() => toolkits.filter((t) => t.connected), [toolkits])
  const selectedSet = new Set(selectedToolkits)
  const statusBySlug = useMemo(() => new Map(toolkits.map((t) => [t.slug, t])), [toolkits])

  // Inline rows: connected toolkits first, then any already-selected ones that
  // lost their connection (so the user can see and untick them).
  const inlineToolkits = useMemo(() => {
    const connectedSlugs = new Set(connected.map((t) => t.slug))
    const selectedUnconnected = toolkits.filter((t) => !t.connected && selectedSet.has(t.slug))
    return [...connected, ...selectedUnconnected]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, toolkits, selectedToolkits.join(',')])

  const visibleInline = inlineToolkits.slice(0, 4)
  const hiddenCount = inlineToolkits.length - visibleInline.length

  const filteredAll = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return connected
    return connected.filter((t) => t.slug.includes(q))
  }, [connected, search])

  if (isLoading) {
    return (
      <div className="space-y-0.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2">
            <div className="size-7 animate-pulse rounded-md bg-muted" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (connected.length === 0 && selectedToolkits.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-4 py-5 text-center">
        <p className="text-sm text-muted-foreground">
          No connected apps yet. Connect one in{' '}
          <a href="/settings/composio" className="font-medium text-primary hover:underline">
            Settings → Composio
          </a>{' '}
          to make it available here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-0.5">
        {visibleInline.map((toolkit) => {
          const status = statusBySlug.get(toolkit.slug)
          const isEnabled = selectedSet.has(toolkit.slug) || !!status?.enabled
          const isConnected = status?.connected ?? false

          return (
            <div
              key={toolkit.slug}
              className={cn(
                'flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors',
                !disabled && 'hover:bg-muted/40',
              )}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-white p-1 dark:bg-white/95">
                  <ToolkitLogo
                    iconSlug={ICON_OVERRIDES[toolkit.slug] ?? toolkit.slug}
                    name={toolkit.slug}
                    className="size-full"
                  />
                </div>
                <div className="flex min-w-0 items-center gap-2">
                  <Label className="shrink-0 truncate text-xs font-medium capitalize leading-tight">{toolkit.slug}</Label>
                  {isConnected ? (
                    <Badge variant="outline" className="h-4 gap-1 border-success/25 bg-success/5 px-1.5 py-0 text-[10px] font-medium leading-none text-success">
                      <CheckCircle2 className="size-2.5 shrink-0" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="h-4 gap-1 px-1.5 py-0 text-[10px] font-medium leading-none text-warning">
                      Connection lost
                    </Badge>
                  )}
                </div>
              </div>
              <Switch
                size="sm"
                checked={isEnabled}
                onCheckedChange={(checked) => onToggle(toolkit.slug, checked)}
                disabled={disabled}
                aria-label={`${isEnabled ? 'Remove' : 'Add'} ${toolkit.slug}`}
              />
            </div>
          )
        })}

        {/* Show all — opens the picker dialog when more toolkits exist */}
        {(hiddenCount > 0 || connected.length > 4) && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs text-muted-foreground"
            onClick={() => setShowAllOpen(true)}
            disabled={disabled}
          >
            <Plus /> Show all ({connected.length})
          </Button>
        )}
      </div>

      {/* Full connected-toolkit picker */}
      <Dialog open={showAllOpen} onOpenChange={setShowAllOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>All connected apps</DialogTitle>
            <DialogDescription>
              Toggle which connected apps this agent can use. Connect new apps in Settings → Composio.
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search connected apps…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-80 space-y-0.5 overflow-y-auto">
            {filteredAll.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {search ? `No connected apps match “${search}”` : 'No connected apps yet.'}
              </p>
            ) : (
              filteredAll.map((toolkit) => {
                const isEnabled = selectedSet.has(toolkit.slug)
                return (
                  <div
                    key={toolkit.slug}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/40"
                  >                      <div className="flex min-w-0 items-center gap-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-white p-1 dark:bg-white/95">
                          <ToolkitLogo
                            iconSlug={ICON_OVERRIDES[toolkit.slug] ?? toolkit.slug}
                            name={toolkit.slug}
                            className="size-full"
                          />
                        </div>
                        <Label className="truncate text-xs font-medium capitalize">{toolkit.slug}</Label>
                      </div>

                    <Switch
                      size="sm"
                      checked={isEnabled}
                      onCheckedChange={(checked) => onToggle(toolkit.slug, checked)}
                      disabled={disabled}
                      aria-label={`${isEnabled ? 'Remove' : 'Add'} ${toolkit.slug}`}
                    />
                  </div>
                )
              })
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <p className="text-xs text-muted-foreground">
              {selectedToolkits.length} selected
            </p>
            <Button size="sm" onClick={() => setShowAllOpen(true)}>
              <X /> Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
