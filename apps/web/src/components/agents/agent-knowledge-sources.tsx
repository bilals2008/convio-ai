import { BookOpen, FileText, Globe, Plug, Database } from 'lucide-react'

const categories = [
  { icon: FileText, label: 'Files', examples: 'PDF, DOCX, CSV, TXT' },
  { icon: Globe, label: 'Web', examples: 'Website, Sitemap, URLs' },
  { icon: Plug, label: 'Integrations', examples: 'Notion, Google Drive, GitHub' },
  { icon: Database, label: 'Structured', examples: 'JSON, FAQ, Tables' },
]

export function AgentKnowledgeSources() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
          <BookOpen className="size-4 text-muted-foreground" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium">No knowledge sources yet</h4>
          <p className="text-xs text-muted-foreground">
            Add documents, websites, or integrations after creation to make your agent smarter.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {categories.map((cat) => (
          <div
            key={cat.label}
            className="flex items-center gap-2 rounded-lg border border-dashed border-border/60 px-3 py-2 opacity-60"
          >
            <cat.icon className="size-3.5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-[11px] font-medium leading-tight">{cat.label}</p>
              <p className="text-[10px] text-muted-foreground truncate">{cat.examples}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
