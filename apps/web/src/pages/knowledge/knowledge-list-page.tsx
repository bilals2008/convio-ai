import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  CheckCircle2,
  Loader2,
  Zap,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { knowledge as knowledgeApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

const SVG = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  documentCount: number
  readyCount?: number
  processingCount?: number
  errorCount?: number
  createdAt: string
  updatedAt: string
}

const implementedSources = new Set([
  'file-upload', 'website', 'custom-text', 'faq', 'csv', 'json', 'markdown', 'api',
])

const sourceTypes = [
  { id: 'file-upload', label: 'File Upload', desc: 'PDF, DOCX, TXT', icon: Upload, color: 'text-orange-500 bg-orange-500/10', logo: null, comingSoon: false },
  { id: 'website', label: 'Website', desc: 'Crawl web pages', icon: null, color: 'text-blue-500 bg-blue-500/10', logo: `${SVG}/google-chrome/default.svg`, comingSoon: false },
  { id: 'sitemap', label: 'Sitemap', desc: 'XML sitemap crawl', icon: Link2, color: 'text-cyan-500 bg-cyan-500/10', logo: null, comingSoon: true },
  { id: 'notion', label: 'Notion', desc: 'Sync Notion pages', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/notion/default.svg`, comingSoon: true },
  { id: 'google-drive', label: 'Google Drive', desc: 'Import GDrive files', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/google-drive/default.svg`, comingSoon: true },
  { id: 'github', label: 'GitHub', desc: 'Repo documentation', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/github/default.svg`, comingSoon: true },
  { id: 'api', label: 'API Endpoint', desc: 'REST/GraphQL API', icon: Zap, color: 'text-purple-500 bg-purple-500/10', logo: null, comingSoon: false },
  { id: 'postgresql', label: 'PostgreSQL', desc: 'Database tables', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/postgresql/default.svg`, comingSoon: true },
  { id: 'mysql', label: 'MySQL', desc: 'Database tables', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/mysql/default.svg`, comingSoon: true },
  { id: 'mongodb', label: 'MongoDB', desc: 'Collections', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/mongodb/default.svg`, comingSoon: true },
  { id: 'supabase', label: 'Supabase', desc: 'Supabase tables', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/supabase/default.svg`, comingSoon: true },
  { id: 'airtable', label: 'Airtable', desc: 'Sync Airtable bases', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/airtable/default.svg`, comingSoon: true },
  { id: 'confluence', label: 'Confluence', desc: 'Wiki pages', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/confluence/default.svg`, comingSoon: true },
  { id: 'sharepoint', label: 'SharePoint', desc: 'MS SharePoint docs', icon: null, color: 'text-foreground bg-white/10', logo: `${SVG}/microsoft-sharepoint/default.svg`, comingSoon: true },
  { id: 'custom-text', label: 'Custom Text', desc: 'Plain text content', icon: Type, color: 'text-teal-500 bg-teal-500/10', logo: null, comingSoon: false },
  { id: 'faq', label: 'FAQ', desc: 'Q&A pairs', icon: HelpCircle, color: 'text-pink-500 bg-pink-500/10', logo: null, comingSoon: false },
  { id: 'csv', label: 'CSV', desc: 'Tabular data', icon: Table2, color: 'text-emerald-500 bg-emerald-500/10', logo: null, comingSoon: false },
  { id: 'json', label: 'JSON', desc: 'Structured data', icon: FileJson, color: 'text-amber-500 bg-amber-500/10', logo: null, comingSoon: false },
  { id: 'markdown', label: 'Markdown', desc: 'MD documentation', icon: FileCode, color: 'text-blue-500 bg-blue-500/10', logo: null, comingSoon: false },
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

export default function KnowledgeListPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { orgId, isLoading: orgLoading } = useOrg()
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: knowledgeBases = [], isLoading } = useQuery({
    queryKey: ['knowledge-bases', orgId],
    queryFn: async () => {
      const res = await knowledgeApi.list(orgId!)
      return (res.data.data || []) as KnowledgeBase[]
    },
    enabled: !!orgId,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => knowledgeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] })
      setDeleteId(null)
    },
  })

  const filtered = useMemo(() =>
    knowledgeBases.filter((kb) =>
      !search || kb.name.toLowerCase().includes(search.toLowerCase()) || kb.description?.toLowerCase().includes(search.toLowerCase())
    ), [knowledgeBases, search]
  )

  const stats = useMemo(() => ({
    totalKBs: knowledgeBases.length,
    totalDocs: knowledgeBases.reduce((a, kb) => a + (kb.documentCount ?? 0), 0),
    readyDocs: knowledgeBases.reduce((a, kb) => a + (kb.readyCount ?? 0), 0),
  }), [knowledgeBases])

  const loading = orgLoading || isLoading

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage knowledge bases used by your AI agents for context-aware responses.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 shrink-0" onClick={() => navigate('/knowledge/new')}>
          <Plus className="size-3.5" />
          Create Knowledge Base
        </Button>
      </div>

      {/* Toolbar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          placeholder="Search knowledge bases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 pl-8 bg-muted/30 border-0"
        />
      </div>

      {/* Quick Add Sources */}
      <div className="rounded-xl bg-muted/30 p-5">
        <h3 className="text-sm font-semibold mb-3">Quick Add Source</h3>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {sourceTypes.map((source) =>
            source.comingSoon ? (
              <div
                key={source.id}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-background/40 border border-border/40 opacity-50 cursor-not-allowed text-center"
                title="Coming soon"
              >
                <SourceIcon source={source} />
                <div>
                  <p className="text-[11px] font-medium leading-tight">{source.label}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">{source.desc}</p>
                </div>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 leading-none text-muted-foreground">Soon</Badge>
              </div>
            ) : (
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
            )
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Zap, label: 'Total Knowledge Bases', value: stats.totalKBs, color: 'text-primary bg-primary/10' },
          { icon: FileText, label: 'Total Documents', value: stats.totalDocs, color: 'text-info bg-info/10' },
          { icon: CheckCircle2, label: 'Ready for RAG', value: stats.readyDocs, color: 'text-success bg-success/10' },
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

      {/* Knowledge Base Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/50 mb-4">
            <BookOpen className="size-7 text-muted-foreground/40" />
          </div>
          <h3 className="text-base font-semibold mb-1">No knowledge bases yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs mb-4">
            Create a knowledge base to add documents and give your AI agents context.
          </p>
          <Button size="sm" className="gap-1.5" onClick={() => navigate('/knowledge/new')}>
            <Plus className="size-3.5" />
            Create Knowledge Base
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((kb) => (
            <button
              key={kb.id}
              onClick={() => navigate(`/knowledge/${kb.id}`)}
              className="text-left p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group border border-transparent hover:border-border/60"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="size-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{kb.name}</p>
                    {kb.description && (
                      <p className="text-[11px] text-muted-foreground truncate">{kb.description}</p>
                    )}
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
                    <DropdownMenuItem onClick={() => navigate(`/knowledge/${kb.id}`)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(kb.id)
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                <span className="flex items-center gap-1">
                  <FileText className="size-3" />
                  {kb.documentCount ?? 0} documents
                </span>
                {typeof kb.readyCount === 'number' && (
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="size-3" />
                    {kb.readyCount} ready
                  </span>
                )}
                {(kb.processingCount ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-info">
                    <Loader2 className="size-3 animate-spin" />
                    {kb.processingCount} indexing
                  </span>
                )}
                <span className="ml-auto">
                  Updated {new Date(kb.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Knowledge Base</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this knowledge base and all its documents. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
