import {
  Globe,
  BookOpen,
  Type,
  Library,
  Upload,
  Link2,
  Database,
  GitBranch,
  Cloud,
  FileJson,
  FileCode,
  HelpCircle,
  Table2,
  Clock,
} from 'lucide-react'

interface KnowledgeSource {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  category: 'upload' | 'web' | 'integration' | 'custom'
}

const defaultSources: KnowledgeSource[] = [
  { id: 'upload-documents', label: 'Upload Documents', description: 'PDF, DOCX, TXT, CSV', icon: <Upload className="size-4" />, category: 'upload' },
  { id: 'paste-text', label: 'Paste Text', description: 'Raw text or Q&A pairs', icon: <Type className="size-4" />, category: 'upload' },
  { id: 'website-crawl', label: 'Website Crawl', description: 'Crawl entire site', icon: <Globe className="size-4" />, category: 'web' },
  { id: 'single-page', label: 'Single Page', description: 'One URL to index', icon: <Link2 className="size-4" />, category: 'web' },
  { id: 'sitemap', label: 'Sitemap XML', description: 'Bulk URL import', icon: <FileCode className="size-4" />, category: 'web' },
  { id: 'notion', label: 'Notion', description: 'Sync Notion pages', icon: <BookOpen className="size-4" />, category: 'integration' },
  { id: 'google-drive', label: 'Google Drive', description: 'Docs, Sheets, Slides', icon: <Cloud className="size-4" />, category: 'integration' },
  { id: 'confluence', label: 'Confluence', description: 'Wiki pages & spaces', icon: <Database className="size-4" />, category: 'integration' },
  { id: 'github', label: 'GitHub', description: 'Repos, issues, docs', icon: <GitBranch className="size-4" />, category: 'integration' },
  { id: 'json-data', label: 'JSON Data', description: 'Structured data import', icon: <FileJson className="size-4" />, category: 'custom' },
  { id: 'csv-table', label: 'CSV / Table', description: 'Tabular data', icon: <Table2 className="size-4" />, category: 'custom' },
  { id: 'faq-pairs', label: 'FAQ Pairs', description: 'Question & answer sets', icon: <HelpCircle className="size-4" />, category: 'custom' },
]

const categoryLabels: Record<string, string> = {
  upload: 'Upload',
  web: 'Web',
  integration: 'Integrations',
  custom: 'Custom Data',
}

export function AgentKnowledgeSources() {
  const grouped = defaultSources.reduce(
    (acc, s) => {
      ;(acc[s.category] ??= []).push(s)
      return acc
    },
    {} as Record<string, KnowledgeSource[]>
  )

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Library className="size-4" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Knowledge Sources</h3>
          <p className="text-xs text-muted-foreground">Connect data to make your agent smarter</p>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat}>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {categoryLabels[cat] ?? cat}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {items.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/40 bg-muted/10 cursor-not-allowed opacity-60 relative"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background/40 text-muted-foreground">
                    {source.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{source.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{source.description}</p>
                  </div>
                  <div className="absolute top-1.5 right-1.5 flex items-center gap-1 rounded bg-muted/80 px-1.5 py-0.5">
                    <Clock className="size-2.5 text-muted-foreground" />
                    <span className="text-[9px] font-medium text-muted-foreground">Soon</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t">
        <p className="text-[11px] text-muted-foreground text-center">
          These integrations are coming soon. Stay tuned!
        </p>
      </div>
    </div>
  )
}
