import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Plus,
  Search,
  FileText,
  Upload,
  Type,
  Link2,
  Table2,
  FileJson,
  FileCode,
  HelpCircle,
  MoreHorizontal,
  Filter,
  Trash2,
  RefreshCw,
  Pause,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  BarChart3,
  Loader2,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { knowledge as knowledgeApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

const SVG = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

interface KnowledgeSource {
  id: string
  name: string
  description?: string
  type: string
  status: 'ready' | 'processing' | 'indexing' | 'syncing' | 'failed' | 'paused' | 'uploading'
  documents: number
  chunks: number
  embeddings: number
  lastSynced: string
  updatedAt: string
  createdAt: string
  createdBy: string
  progress?: number
  syncEnabled?: boolean
  syncFrequency?: string
  embeddingModel?: string
}

type StatusFilter = 'all' | 'ready' | 'processing' | 'failed' | 'paused'

const sourceTypes = [
  { id: 'file-upload', label: 'File Upload', desc: 'PDF, DOCX, TXT', icon: Upload, color: 'text-orange-500 bg-orange-500/10', logo: null },
  { id: 'website', label: 'Website', desc: 'Crawl web pages', icon: null, color: 'text-blue-500 bg-blue-500/10', logo: `${SVG}/google-chrome/default.svg` },
  { id: 'sitemap', label: 'Sitemap', desc: 'XML sitemap crawl', icon: Link2, color: 'text-cyan-500 bg-cyan-500/10', logo: null },
  { id: 'notion', label: 'Notion', desc: 'Sync Notion pages', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/notion/default.svg` },
  { id: 'google-drive', label: 'Google Drive', desc: 'Import GDrive files', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/google-drive/default.svg` },
  { id: 'github', label: 'GitHub', desc: 'Repo documentation', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/github/default.svg` },
  { id: 'api', label: 'API Endpoint', desc: 'REST/GraphQL API', icon: Zap, color: 'text-purple-500 bg-purple-500/10', logo: null },
  { id: 'postgresql', label: 'PostgreSQL', desc: 'Database tables', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/postgresql/default.svg` },
  { id: 'mysql', label: 'MySQL', desc: 'Database tables', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/mysql/default.svg` },
  { id: 'mongodb', label: 'MongoDB', desc: 'Collections', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/mongodb/default.svg` },
  { id: 'supabase', label: 'Supabase', desc: 'Supabase tables', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/supabase/default.svg` },
  { id: 'airtable', label: 'Airtable', desc: 'Sync Airtable bases', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/airtable/default.svg` },
  { id: 'confluence', label: 'Confluence', desc: 'Wiki pages', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/confluence/default.svg` },
  { id: 'sharepoint', label: 'SharePoint', desc: 'MS SharePoint docs', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/microsoft-sharepoint/default.svg` },
  { id: 'custom-text', label: 'Custom Text', desc: 'Plain text content', icon: Type, color: 'text-teal-500 bg-teal-500/10', logo: null },
  { id: 'faq', label: 'FAQ', desc: 'Q&A pairs', icon: HelpCircle, color: 'text-pink-500 bg-pink-500/10', logo: null },
  { id: 'csv', label: 'CSV', desc: 'Tabular data', icon: Table2, color: 'text-emerald-500 bg-emerald-500/10', logo: null },
  { id: 'json', label: 'JSON', desc: 'Structured data', icon: FileJson, color: 'text-amber-500 bg-amber-500/10', logo: null },
  { id: 'markdown', label: 'Markdown', desc: 'MD documentation', icon: FileCode, color: 'text-blue-500 bg-blue-500/10', logo: null },
]

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ready: { label: 'Ready', color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle2 },
  processing: { label: 'Processing', color: 'bg-blue-500/10 text-blue-600', icon: Loader2 },
  indexing: { label: 'Indexing', color: 'bg-amber-500/10 text-amber-600', icon: Loader2 },
  syncing: { label: 'Syncing', color: 'text-blue-600', icon: RefreshCw },
  failed: { label: 'Failed', color: 'bg-destructive/10 text-destructive', icon: AlertCircle },
  paused: { label: 'Paused', color: 'bg-muted text-muted-foreground', icon: Pause },
  uploading: { label: 'Uploading', color: 'bg-purple-500/10 text-purple-600', icon: Upload },
}

const mockSources: KnowledgeSource[] = [
  { id: '1', name: 'Product Documentation', description: 'Main product docs and guides', type: 'website', status: 'ready', documents: 24, chunks: 1847, embeddings: 1847, lastSynced: '2026-07-09T10:30:00Z', updatedAt: '2026-07-09T10:30:00Z', createdAt: '2026-06-15T08:00:00Z', createdBy: 'Ahmed', syncEnabled: true, syncFrequency: 'Daily', embeddingModel: 'text-embedding-3-small' },
  { id: '2', name: 'FAQ Database', description: 'Customer support Q&A pairs', type: 'faq', status: 'ready', documents: 156, chunks: 468, embeddings: 468, lastSynced: '2026-07-08T14:00:00Z', updatedAt: '2026-07-08T14:00:00Z', createdAt: '2026-05-20T09:00:00Z', createdBy: 'Sara', syncEnabled: false, embeddingModel: 'text-embedding-3-small' },
  { id: '3', name: 'API Reference', description: 'REST API documentation', type: 'markdown', status: 'processing', documents: 18, chunks: 920, embeddings: 0, lastSynced: '2026-07-09T12:00:00Z', updatedAt: '2026-07-09T12:00:00Z', createdAt: '2026-07-01T11:00:00Z', createdBy: 'Ali', progress: 67, embeddingModel: 'text-embedding-3-small' },
  { id: '4', name: 'Company Wiki', description: 'Internal Notion knowledge base', type: 'notion', status: 'syncing', documents: 89, chunks: 3200, embeddings: 2800, lastSynced: '2026-07-09T11:45:00Z', updatedAt: '2026-07-09T11:45:00Z', createdAt: '2026-04-10T08:00:00Z', createdBy: 'Bilal', syncEnabled: true, syncFrequency: 'Every 6 hours', embeddingModel: 'text-embedding-3-large' },
  { id: '5', name: 'Pricing Data', description: 'Pricing plans and tiers', type: 'json', status: 'failed', documents: 3, chunks: 45, embeddings: 0, lastSynced: '2026-07-07T09:00:00Z', updatedAt: '2026-07-07T09:00:00Z', createdAt: '2026-07-07T08:00:00Z', createdBy: 'Ahmed', embeddingModel: 'text-embedding-3-small' },
  { id: '6', name: 'HR Policies', description: 'Employee handbook and policies', type: 'file-upload', status: 'ready', documents: 12, chunks: 340, embeddings: 340, lastSynced: '2026-07-06T16:00:00Z', updatedAt: '2026-07-06T16:00:00Z', createdAt: '2026-06-01T10:00:00Z', createdBy: 'Sara', syncEnabled: false, embeddingModel: 'text-embedding-3-small' },
  { id: '7', name: 'Sales Playbook', description: 'Sales scripts and objection handling', type: 'custom-text', status: 'paused', documents: 8, chunks: 120, embeddings: 120, lastSynced: '2026-07-05T12:00:00Z', updatedAt: '2026-07-05T12:00:00Z', createdAt: '2026-06-20T14:00:00Z', createdBy: 'Ali', syncEnabled: false, embeddingModel: 'text-embedding-3-small' },
  { id: '8', name: 'Changelog', description: 'Product release notes', type: 'github', status: 'ready', documents: 42, chunks: 560, embeddings: 560, lastSynced: '2026-07-09T08:00:00Z', updatedAt: '2026-07-09T08:00:00Z', createdAt: '2026-03-15T09:00:00Z', createdBy: 'Bilal', syncEnabled: true, syncFrequency: 'Daily', embeddingModel: 'text-embedding-3-small' },
]

function SourceIcon({ source, size = 'md' }: { source: typeof sourceTypes[number]; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'size-8' : 'size-10'
  const imgS = size === 'sm' ? 'size-4' : 'size-5'

  if (source.logo) {
    return (
      <div className={cn('flex items-center justify-center rounded-xl bg-background/80 border border-border/40', s)}>
        <img src={source.logo} alt={source.label} className={imgS} loading="lazy" />
      </div>
    )
  }
  const Icon = source.icon!
  return (
    <div className={cn('flex items-center justify-center rounded-xl', s, source.color)}>
      <Icon className={imgS} />
    </div>
  )
}

function SourceDetailsPanel({
  source,
  open,
  onOpenChange,
}: {
  source: KnowledgeSource | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [autoSync, setAutoSync] = useState(source?.syncEnabled ?? false)

  if (!source) return null

  const status = statusConfig[source.status] || statusConfig.ready
  const StatusIcon = status.icon

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-5 pb-0">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <img
                src={sourceTypes.find((t) => t.id === source.type)?.logo || undefined}
                alt=""
                className="size-5"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle>{source.name}</SheetTitle>
              <SheetDescription className="mt-0.5">{source.description || source.type}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Status</span>
              <Badge className={cn('gap-1', status.color)}>
                <StatusIcon className={cn('size-3', source.status === 'processing' && 'animate-spin')} />
                {status.label}
              </Badge>
            </div>

            {(source.status === 'processing' || source.status === 'indexing') && source.progress !== undefined && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{source.progress}%</span>
                </div>
                <Progress value={source.progress} className="h-1.5" />
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">General</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground">Type</p>
                  <p className="text-sm font-medium capitalize">{source.type.replace('-', ' ')}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground">Documents</p>
                  <p className="text-sm font-medium">{source.documents}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground">Chunks</p>
                  <p className="text-sm font-medium">{source.chunks.toLocaleString()}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground">Embeddings</p>
                  <p className="text-sm font-medium">{source.embeddings.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Indexing</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground">Embedding Model</p>
                  <p className="text-sm font-medium">{source.embeddingModel || 'N/A'}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground">Last Synced</p>
                  <p className="text-sm font-medium">{new Date(source.lastSynced).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sync Settings</h4>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Auto Sync</Label>
                  <p className="text-[11px] text-muted-foreground">Keep data up to date</p>
                </div>
                <Switch checked={autoSync} onCheckedChange={setAutoSync} />
              </div>
              {autoSync && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="6h">Every 6 Hours</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Metadata</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground">Created By</p>
                  <p className="text-sm font-medium">{source.createdBy}</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">{new Date(source.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-5 pt-0 flex items-center gap-2">
          <Button size="sm" className="flex-1 gap-1.5">
            <RefreshCw className="size-3.5" />
            Sync Now
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5">
            <FileText className="size-3.5" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5">
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function KnowledgeInsights({ sources }: { sources: KnowledgeSource[] }) {
  const totalDocs = sources.reduce((a, s) => a + s.documents, 0)
  const indexedDocs = sources.filter((s) => s.status === 'ready').reduce((a, s) => a + s.documents, 0)
  const failedSources = sources.filter((s) => s.status === 'failed').length
  const processingQueue = sources.filter((s) => ['processing', 'indexing', 'syncing', 'uploading'].includes(s.status)).length
  const coverage = totalDocs > 0 ? Math.round((indexedDocs / totalDocs) * 100) : 0

  return (
    <div className="rounded-xl bg-muted/30 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="size-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold">Knowledge Insights</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-[11px] text-muted-foreground">Documents Indexed</p>
          <p className="text-lg font-bold mt-0.5">{indexedDocs.toLocaleString()}</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-[11px] text-muted-foreground">Response Coverage</p>
          <p className="text-lg font-bold mt-0.5">{coverage}%</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-[11px] text-muted-foreground">Processing Queue</p>
          <p className="text-lg font-bold mt-0.5">{processingQueue}</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-[11px] text-muted-foreground">Failed Sources</p>
          <p className={cn('text-lg font-bold mt-0.5', failedSources > 0 && 'text-destructive')}>{failedSources}</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-[11px] text-muted-foreground">Knowledge Freshness</p>
          <p className="text-lg font-bold mt-0.5">98%</p>
        </div>
        <div className="p-3 rounded-lg bg-background/50">
          <p className="text-[11px] text-muted-foreground">Last Sync</p>
          <p className="text-lg font-bold mt-0.5">2h</p>
        </div>
      </div>
    </div>
  )
}

export default function KnowledgeListPage() {
  const navigate = useNavigate()
  const { orgId } = useOrg()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [detailSource, setDetailSource] = useState<KnowledgeSource | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const { data: sourcesData, isLoading } = useQuery({
    queryKey: ['knowledge-sources', orgId],
    queryFn: async () => {
      try {
        const res = await knowledgeApi.list(orgId!)
        return (res.data.data || []) as KnowledgeSource[]
      } catch {
        return mockSources
      }
    },
    enabled: !!orgId,
  })

  const sources = sourcesData || mockSources

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      const matchesSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase()) ||
        s.type.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter
      const matchesType = typeFilter === 'all' || s.type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [sources, search, statusFilter, typeFilter])

  const stats = useMemo(() => ({
    totalSources: sources.length,
    totalDocs: sources.reduce((a, s) => a + s.documents, 0),
    indexedDocs: sources.filter((s) => s.status === 'ready').reduce((a, s) => a + s.documents, 0),
    processing: sources.filter((s) => ['processing', 'indexing', 'syncing', 'uploading'].includes(s.status)).length,
    failed: sources.filter((s) => s.status === 'failed').length,
    storage: '2.4 GB',
  }), [sources])

  const openDetails = (source: KnowledgeSource) => {
    setDetailSource(source)
    setDetailsOpen(true)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage sources used by your AI Agent for context-aware responses.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => navigate('/knowledge/new')}>
          <Plus className="size-3.5" />
          Add Knowledge
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search sources, documents, URLs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8 bg-muted/30 border-0"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="h-9 w-auto">
              <Filter className="size-3.5 mr-1.5" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-9 w-auto">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {sourceTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Add Sources */}
      <div className="rounded-xl bg-muted/30 p-5">
        <h3 className="text-sm font-semibold mb-3">Quick Add Source</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {sourceTypes.map((source) => (
            <button
              key={source.id}
              onClick={() => navigate('/knowledge/new')}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-background/40 border border-border/40 hover:border-primary/30 hover:bg-background/60 transition-all duration-150 group text-center"
            >
              <SourceIcon source={source} />
              <div>
                <p className="text-[11px] font-medium leading-tight">{source.label}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{source.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { icon: Zap, label: 'Total Sources', value: stats.totalSources, color: 'text-primary bg-primary/10' },
          { icon: FileText, label: 'Total Documents', value: stats.totalDocs, color: 'text-blue-500 bg-blue-500/10' },
          { icon: CheckCircle2, label: 'Indexed', value: stats.indexedDocs, color: 'text-emerald-500 bg-emerald-500/10' },
          { icon: Loader2, label: 'Processing', value: stats.processing, color: 'text-amber-500 bg-amber-500/10' },
          { icon: AlertCircle, label: 'Failed', value: stats.failed, color: 'text-destructive bg-destructive/10' },
          { icon: HardDrive, label: 'Storage', value: stats.storage, color: 'text-muted-foreground bg-muted/50' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-3 p-3.5 rounded-xl bg-muted/30 border border-border/40">
            <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', stat.color)}>
              <stat.icon className="size-4.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              <p className="text-base font-bold tabular-nums">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sources */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : filteredSources.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
            <img src={`${SVG}/openai/default.svg`} alt="" className="size-7 opacity-30" />
          </div>
          <h3 className="text-base font-semibold mb-1">No knowledge sources yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-4">
            Your AI Agent doesn't have any knowledge yet. Add a source to get started.
          </p>
          <Button size="sm" className="gap-1.5" onClick={() => navigate('/knowledge/new')}>
            <Plus className="size-3.5" />
            Add Knowledge Source
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSources.map((source) => {
            const st = statusConfig[source.status] || statusConfig.ready
            const StIcon = st.icon
            const srcType = sourceTypes.find((t) => t.id === source.type)

            return (
              <button
                key={source.id}
                onClick={() => openDetails(source)}
                className="text-left p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group border border-transparent hover:border-border/60"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <SourceIcon source={srcType || sourceTypes[0]} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{source.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{source.description}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreHorizontal className="size-4" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => openDetails(source)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Sync Now</DropdownMenuItem>
                      <DropdownMenuItem>Re-index</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
                  <span>{source.documents} docs</span>
                  <span>{source.chunks.toLocaleString()} chunks</span>
                  <Badge className={cn('ml-auto text-[10px] gap-1', st.color)}>
                    <StIcon className={cn('size-2.5', (source.status === 'processing' || source.status === 'indexing') && 'animate-spin')} />
                    {st.label}
                  </Badge>
                </div>

                {(source.status === 'processing' || source.status === 'indexing') && source.progress !== undefined && (
                  <Progress value={source.progress} className="h-1 mb-3" />
                )}

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                  <span>Synced {new Date(source.lastSynced).toLocaleDateString()}</span>
                  <span>{source.createdBy}</span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <KnowledgeInsights sources={sources} />

      <SourceDetailsPanel
        source={detailSource}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  )
}
