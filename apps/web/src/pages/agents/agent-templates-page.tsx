import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  LayoutTemplate,
  Headphones,
  Briefcase,
  GraduationCap,
  Zap,
  SlidersHorizontal,
  Search,
  ArrowLeft,
  Wrench,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { agents as agentsApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'
import { cn } from '@/lib/utils'
import type { AgentTemplate } from '@/components/agents/agent-template-modal'

const categories = [
  { id: 'all', label: 'All', icon: null },
  { id: 'support', label: 'Support', icon: Headphones },
  { id: 'business', label: 'Business', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'productivity', label: 'Productivity', icon: Zap },
  { id: 'custom', label: 'Custom', icon: SlidersHorizontal },
] as const

const categoryColors: Record<string, string> = {
  support: 'bg-blue-500/10 text-blue-500',
  business: 'bg-amber-500/10 text-amber-500',
  education: 'bg-green-500/10 text-green-500',
  productivity: 'bg-purple-500/10 text-purple-500',
  custom: 'bg-muted text-muted-foreground',
}

const categoryIcons: Record<string, typeof Headphones> = {
  support: Headphones,
  business: Briefcase,
  education: GraduationCap,
  productivity: Zap,
  custom: SlidersHorizontal,
}

export default function AgentTemplatesPage() {
  const navigate = useNavigate()
  const { orgId } = useOrg()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState('')

  const { data: templates = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['agent-templates', orgId],
    queryFn: async () => {
      const res = await agentsApi.templates(orgId!)
      return (res.data.data || []) as AgentTemplate[]
    },
    enabled: !!orgId,
  })

  const filtered = useMemo(() => {
    let result = templates
    if (activeCategory !== 'all') {
      result = result.filter((t) => t.category === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      )
    }
    return result
  }, [templates, activeCategory, search])

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate('/agents')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Agents
          </button>
          <div className="flex items-center gap-2 pt-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <LayoutTemplate className="size-4 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Templates</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Pick a ready-made template. It pre-fills the agent's prompt and settings — customize freely.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button onClick={() => navigate('/agents/new')} className="shrink-0">
            Create from scratch
          </Button>
        </div>
      </div>

      {/* Search + categories */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-0.5">
          {categories.map((cat) => {
            const Icon = cat.icon
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {Icon && <Icon className="size-3.5" />}
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-sm font-medium">Failed to load templates</p>
          <p className="mt-1 text-xs text-muted-foreground">Something went wrong while fetching templates.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {/* Loading */}
      {!isError && isLoading && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex flex-col gap-3 rounded-xl border border-border/60 p-4">
              <div className="flex items-center gap-2">
                <div className="size-8 animate-pulse rounded-lg bg-muted" />
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted/70" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-muted/70" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 text-center">
          <p className="text-sm font-medium">
            {search ? `No templates matching "${search}"` : 'No templates available.'}
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSearch(''); setActiveCategory('all') }}>
            Clear filters
          </Button>
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((template) => {
            const CatIcon = categoryIcons[template.category] || SlidersHorizontal
            return (
              <div
                key={template.id}
                className="group relative flex flex-col items-start gap-3 rounded-xl border border-border/60 p-4 text-left transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'flex size-8 items-center justify-center rounded-lg',
                    categoryColors[template.category] || 'bg-muted text-muted-foreground'
                  )}>
                    <CatIcon className="size-4" />
                  </span>
                  <span className={cn(
                    'rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize',
                    categoryColors[template.category] || 'bg-muted text-muted-foreground'
                  )}>
                    {template.category}
                  </span>
                </div>

                <div className="min-w-0">
                  <span className="text-sm font-semibold">{template.name}</span>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-3">{template.description}</p>
                </div>

                {template.suggestedTools.length > 0 && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Wrench className="size-3" />
                    {template.suggestedTools.length} tool{template.suggestedTools.length > 1 ? 's' : ''} suggested
                  </div>
                )}

                <Button
                  size="sm"
                  className="mt-auto w-full"
                  onClick={() => navigate(`/agents/new?template=${template.id}`)}
                >
                  Use this template
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* More templates coming soon */}
      <div className="flex items-center justify-center pt-8">
        <p className="text-center text-xs text-muted-foreground">
          More templates coming soon — stay tuned.
        </p>
      </div>
    </PageContainer>
  )
}