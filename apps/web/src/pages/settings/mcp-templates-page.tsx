import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutTemplate,
  Plug,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Search,
  Box,
  AppWindow,
  Database,
  Terminal,
} from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { mcpServerTemplates } from '@/lib/mcp-templates'
import { McpHelpButton, McpHelpModal } from '@/components/mcp/mcp-help-modal'

const categories = [
  { id: 'all', label: 'All' },
  { id: 'apps', label: 'Apps', icon: AppWindow },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'devtools', label: 'Dev Tools', icon: Box },
  { id: 'custom', label: 'Custom', icon: Terminal },
]

const categoryColors: Record<string, string> = {
  apps: 'bg-blue-500/10 text-blue-500',
  data: 'bg-emerald-500/10 text-emerald-500',
  devtools: 'bg-purple-500/10 text-purple-500',
  custom: 'bg-amber-500/10 text-amber-500',
}

function ProviderIcon({ provider }: { provider: string }) {
  const CDN = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'
  return (
    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', categoryColors[provider] || 'bg-muted text-muted-foreground')}>
      <img src={`${CDN}/${provider}/default.svg`} alt={provider} className="size-5" loading="lazy" />
    </span>
  )
}

export default function McpTemplatesPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  const filtered = useMemo(() => {
    let result = mcpServerTemplates
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
  }, [activeCategory, search])

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate('/mcp-servers')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            MCP Servers
          </button>
          <div className="flex items-center gap-2 pt-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
              <LayoutTemplate className="size-4 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">MCP Templates</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Pre-configured servers for popular tools. Pick one, connect it, and link it to your agents.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <McpHelpButton onClick={() => setHelpOpen(true)} />
          <Button onClick={() => navigate('/mcp-servers')} className="shrink-0">
            Add custom server
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

      {/* Empty */}
      {filtered.length === 0 && (
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
      {filtered.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((template) => (
            <div
              key={template.id}
              className="group relative flex flex-col items-start gap-3 rounded-xl border border-border/60 p-4 text-left transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex w-full items-start gap-3">
                <ProviderIcon provider={template.provider} />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-semibold">{template.name}</span>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-3">{template.description}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-[10px]">
                  {template.type === 'stdio' ? 'Stdio' : 'Streamable HTTP'}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {template.authType === 'oauth' ? (
                    <span className="flex items-center gap-1"><ShieldCheck className="size-3" /> OAuth</span>
                  ) : template.authType === 'header' ? (
                    <span className="flex items-center gap-1"><KeyRound className="size-3" /> API Key</span>
                  ) : (
                    'No auth'
                  )}
                </Badge>
              </div>

              <Button
                size="sm"
                className="mt-auto w-full"
                onClick={() => navigate(`/mcp-servers?template=${template.id}`)}
              >
                <Plug className="size-3.5" />
                Use this template
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <McpHelpModal open={helpOpen} onOpenChange={setHelpOpen} />
    </PageContainer>
  )
}