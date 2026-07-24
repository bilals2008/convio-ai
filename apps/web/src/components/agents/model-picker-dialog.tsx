import { useState, useMemo, useRef, useEffect, type KeyboardEvent } from "react"
import { Check, ChevronsUpDown, Loader2, Search, AlertCircle, Box } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { ProviderLogo } from "./provider-logos"
import { ModelBadges } from "./model-badges"
import { getModelBadges, providerLabel } from "./model-meta"

interface ModelOption {
  id: string
  name: string
  provider?: string
}

interface ModelPickerProps {
  value: string
  models: ModelOption[]
  onSelect: (value: string) => void
  disabled?: boolean
  loading?: boolean
  error?: boolean
  errorMessage?: string
}

export function ModelPicker({
  value,
  models,
  onSelect,
  disabled,
  loading = false,
  error = false,
  errorMessage,
}: ModelPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [activeId, setActiveId] = useState<string | null>(value || null)
  const searchRef = useRef<HTMLInputElement>(null)
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  const selectedModel = useMemo(() => models.find((m) => m.id === value), [models, value])

  const grouped = useMemo(() => {
    const groups: Record<string, ModelOption[]> = {}
    for (const m of models) {
      const provider = m.provider || "other"
      if (!groups[provider]) groups[provider] = []
      groups[provider].push(m)
    }
    return groups
  }, [models])

  const sortedProviders = useMemo(
    () => Object.keys(grouped).sort((a, b) => providerLabel(a).localeCompare(providerLabel(b))),
    [grouped]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return grouped
    const result: Record<string, ModelOption[]> = {}
    for (const provider of sortedProviders) {
      const matches = grouped[provider].filter((m) =>
        `${m.name} ${m.id} ${m.provider ?? ""}`.toLowerCase().includes(q)
      )
      if (matches.length) result[provider] = matches
    }
    return result
  }, [grouped, query, sortedProviders])

  const isSearching = query.trim().length > 0

  const visibleProviders = Object.keys(filtered).sort((a, b) =>
    providerLabel(a).localeCompare(providerLabel(b))
  )

  const visibleItems = useMemo(() => {
    const items: ModelOption[] = []
    for (const provider of visibleProviders) {
      if (!isSearching && collapsed.has(provider)) continue
      items.push(...filtered[provider])
    }
    return items
  }, [visibleProviders, filtered, collapsed, isSearching])

  useEffect(() => {
    if (activeId && itemRefs.current.has(activeId)) {
      itemRefs.current.get(activeId)?.scrollIntoView({ block: "nearest" })
    }
  }, [activeId])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (next) {
      setQuery("")
      setActiveId(value || models[0]?.id || null)
      requestAnimationFrame(() => searchRef.current?.focus())
    }
  }

  const moveActive = (dir: 1 | -1) => {
    if (visibleItems.length === 0) return
    const idx = visibleItems.findIndex((m) => m.id === activeId)
    const next = idx === -1 ? 0 : (idx + dir + visibleItems.length) % visibleItems.length
    setActiveId(visibleItems[next].id)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      moveActive(1)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      moveActive(-1)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeId) {
        onSelect(activeId)
        setOpen(false)
      }
    }
  }

  const toggleCollapse = (provider: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(provider)) next.delete(provider)
      else next.add(provider)
      return next
    })
  }

  const select = (id: string) => {
    onSelect(id)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "h-10 w-full justify-between gap-2 font-normal"
        )}
      >
        {selectedModel ? (
          <span className="flex min-w-0 items-center gap-2">
            <ProviderLogo provider={selectedModel.provider} className="size-4" />
            <span className="truncate font-medium">{selectedModel.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {selectedModel.id.replace(/-free$/i, '')}
            </span>
          </span>
        ) : loading ? (
          <span className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading models…
          </span>
        ) : error ? (
          <span className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4" />
            Couldn’t load models
          </span>
        ) : (
          <span className="text-muted-foreground">Select a model</span>
        )}
        <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] min-w-80 p-0"
        align="start"
      >
        {/* Sticky search */}
        <div className="sticky top-0 z-10 border-b border-border bg-popover p-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search models…"
              className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[360px] overflow-y-auto p-1.5">
          {loading ? (
            <div className="space-y-2 p-1.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-2 py-2">
                  <Skeleton className="size-5 rounded-[5px]" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <AlertCircle className="size-6 text-destructive" />
              <p className="text-sm font-medium">Failed to load models</p>
              <p className="max-w-[220px] text-xs text-muted-foreground">
                {errorMessage || "Check your connection or API keys in Settings."}
              </p>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
              <Box className="size-6 text-muted-foreground" />
              <p className="text-sm font-medium">No models found</p>
              <p className="max-w-[220px] text-xs text-muted-foreground">
                Try a different search term or configure more providers in Settings.
              </p>
            </div>
          ) : (
            visibleProviders.map((provider) => {
              const isCollapsed = !isSearching && collapsed.has(provider)
              return (
                <div key={provider} className="mb-1">
                  <button
                    type="button"
                    onClick={() => !isSearching && toggleCollapse(provider)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                      isSearching ? "cursor-default" : "hover:bg-muted/60"
                    )}
                    tabIndex={-1}
                  >
                    <ProviderLogo provider={provider} className="size-4" />
                    <span className="text-xs font-semibold">{providerLabel(provider)}</span>
                     <span className="rounded bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                      {filtered[provider].length}
                    </span>
                    {!isSearching && (
                      <ChevronsUpDown
                        className={cn(
                          "ml-auto size-3.5 text-muted-foreground transition-transform",
                          isCollapsed && "-rotate-90"
                        )}
                      />
                    )}
                  </button>

                  {!isCollapsed && (
                    <div className="mt-0.5 space-y-0.5">
                      {filtered[provider].map((m) => {
                        const isSelected = value === m.id
                        const isActive = activeId === m.id
                        const badges = getModelBadges(m)
                        return (
                          <button
                            key={m.id}
                            type="button"
                            ref={(el) => {
                              if (el) itemRefs.current.set(m.id, el)
                              else itemRefs.current.delete(m.id)
                            }}
                            onClick={() => select(m.id)}
                            onMouseEnter={() => setActiveId(m.id)}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors",
                              isActive && "bg-muted",
                              isSelected && "bg-primary/10"
                            )}
                          >
                            <ProviderLogo provider={m.provider} className="size-5" />
                            <span className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate text-sm font-medium">{m.name}</span>
                              <span className="truncate font-mono text-[11px] text-muted-foreground">
                                {m.id.replace(/-free$/i, '')}
                              </span>
                            </span>
                            <ModelBadges badges={badges} className="hidden sm:flex" />
                            <Check
                              className={cn(
                                "size-4 shrink-0",
                                isSelected ? "text-primary opacity-100" : "opacity-0"
                              )}
                            />
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
