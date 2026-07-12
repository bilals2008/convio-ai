import { useState } from 'react'
import {
  Upload,
  Type,
  HelpCircle,
  Link2,
  Table2,
  FileJson,
  FileCode,
  Zap,
  Search,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const SVG = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

export type SourceType = 'file-upload' | 'website' | 'custom-text' | 'faq' | 'csv' | 'json' | 'markdown' | 'api'

interface SourceOption {
  id: SourceType | string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }> | null
  logo: string | null
  category: 'primary' | 'documents' | 'integrations' | 'databases'
  available: boolean
}

const allSources: SourceOption[] = [
  { id: 'file-upload', label: 'File Upload', description: 'PDF, DOCX, TXT files', icon: Upload, logo: null, category: 'primary', available: true },
  { id: 'website', label: 'Website', description: 'Crawl web pages', icon: null, logo: `${SVG}/google-chrome/default.svg`, category: 'primary', available: true },
  { id: 'custom-text', label: 'Custom Text', description: 'Plain text content', icon: Type, logo: null, category: 'primary', available: true },
  { id: 'faq', label: 'FAQ', description: 'Q&A pairs', icon: HelpCircle, logo: null, category: 'primary', available: true },
  { id: 'csv', label: 'CSV', description: 'Tabular data', icon: Table2, logo: null, category: 'documents', available: true },
  { id: 'json', label: 'JSON', description: 'Structured data', icon: FileJson, logo: null, category: 'documents', available: true },
  { id: 'markdown', label: 'Markdown', description: 'MD documentation', icon: FileCode, logo: null, category: 'documents', available: true },
  { id: 'api', label: 'API Endpoint', description: 'REST/GraphQL API', icon: Zap, logo: null, category: 'integrations', available: true },
  { id: 'sitemap', label: 'Sitemap', description: 'XML sitemap crawl', icon: Link2, logo: null, category: 'integrations', available: false },
  { id: 'notion', label: 'Notion', description: 'Sync Notion pages', icon: null, logo: `${SVG}/notion/default.svg`, category: 'integrations', available: false },
  { id: 'google-drive', label: 'Google Drive', description: 'Import GDrive files', icon: null, logo: `${SVG}/google-drive/default.svg`, category: 'integrations', available: false },
  { id: 'github', label: 'GitHub', description: 'Repo documentation', icon: null, logo: `${SVG}/github/default.svg`, category: 'integrations', available: false },
  { id: 'confluence', label: 'Confluence', description: 'Wiki pages', icon: null, logo: `${SVG}/confluence/default.svg`, category: 'integrations', available: false },
  { id: 'sharepoint', label: 'SharePoint', description: 'MS SharePoint docs', icon: null, logo: `${SVG}/microsoft-sharepoint/default.svg`, category: 'integrations', available: false },
  { id: 'airtable', label: 'Airtable', description: 'Sync Airtable bases', icon: null, logo: `${SVG}/airtable/default.svg`, category: 'integrations', available: false },
  { id: 'postgresql', label: 'PostgreSQL', description: 'Database tables', icon: null, logo: `${SVG}/postgresql/default.svg`, category: 'databases', available: false },
  { id: 'mysql', label: 'MySQL', description: 'Database tables', icon: null, logo: `${SVG}/mysql/default.svg`, category: 'databases', available: false },
  { id: 'mongodb', label: 'MongoDB', description: 'Collections', icon: null, logo: `${SVG}/mongodb/default.svg`, category: 'databases', available: false },
  { id: 'supabase', label: 'Supabase', description: 'Supabase tables', icon: null, logo: `${SVG}/supabase/default.svg`, category: 'databases', available: false },
]

const categoryLabels: Record<string, string> = {
  primary: 'Quick Add',
  documents: 'Documents',
  integrations: 'Integrations',
  databases: 'Databases',
}

interface SourcePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (sourceId: SourceType) => void
}

export function SourcePickerModal({ open, onOpenChange, onSelect }: SourcePickerModalProps) {
  const [search, setSearch] = useState('')

  const filtered = allSources.filter(
    (s) => !search || s.label.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase()),
  )

  const grouped = filtered.reduce(
    (acc, source) => {
      if (!acc[source.category]) acc[source.category] = []
      acc[source.category].push(source)
      return acc
    },
    {} as Record<string, SourceOption[]>,
  )

  const categoryOrder: SourceOption['category'][] = ['primary', 'documents', 'integrations', 'databases']

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[90vw] sm:max-w-lg p-0 gap-0">
        <SheetHeader className="border-b border-border/60 px-5 py-4">
          <SheetTitle>Add source</SheetTitle>
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sources..."
              autoFocus
              className="w-full rounded-lg border border-border/60 bg-muted/30 py-2 pl-8 pr-3 text-sm outline-none focus:border-primary/50"
            />
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {categoryOrder.map((cat) => {
            const sources = grouped[cat]
            if (!sources || sources.length === 0) return null
            return (
              <div key={cat}>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-0.5">
                  {categoryLabels[cat]}
                </p>
                <div className="space-y-0.5">
                  {sources.map((source) => (
                    <button
                      key={source.id}
                      disabled={!source.available}
                      onClick={() => {
                        if (source.available) {
                          onSelect(source.id as SourceType)
                          onOpenChange(false)
                          setSearch('')
                        }
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors',
                        source.available
                          ? 'hover:bg-muted/50 cursor-pointer'
                          : 'opacity-40 cursor-not-allowed',
                      )}
                    >
                      <SourceIcon source={source} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium leading-tight">{source.label}</p>
                        <p className="text-xs text-muted-foreground leading-tight">{source.description}</p>
                      </div>
                      {!source.available && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 shrink-0 text-muted-foreground">
                          Soon
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">No sources match "{search}"</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function SourceIcon({ source }: { source: SourceOption }) {
  if (source.logo) {
    return (
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background border border-border/40">
        <img src={source.logo} alt={source.label} className="size-5" loading="lazy" />
      </div>
    )
  }

  const Icon = source.icon!
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="size-[18px]" />
    </div>
  )
}
