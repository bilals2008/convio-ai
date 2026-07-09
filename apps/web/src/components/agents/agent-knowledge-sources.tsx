import { FileText, Globe, BookOpen, Type, Library } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface KnowledgeSource {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  color: string
}

interface AgentKnowledgeSourcesProps {
  sources?: KnowledgeSource[]
  onSelect?: (id: string) => void
  selected?: string[]
  disabled?: boolean
}

const defaultSources: KnowledgeSource[] = [
  {
    id: 'upload-documents',
    label: 'Upload Documents',
    description: 'PDF, DOCX, TXT',
    icon: <FileText className="size-5" />,
    color: 'text-orange-500 bg-orange-500/10',
  },
  {
    id: 'website-url',
    label: 'Website URL',
    description: 'Crawl and index content',
    icon: <Globe className="size-5" />,
    color: 'text-blue-500 bg-blue-500/10',
  },
  {
    id: 'notion',
    label: 'Notion',
    description: 'Sync from Notion',
    icon: <BookOpen className="size-5" />,
    color: 'text-gray-600 bg-gray-500/10',
  },
  {
    id: 'custom-text',
    label: 'Custom Text',
    description: 'Add text or Q & A',
    icon: <Type className="size-5" />,
    color: 'text-green-500 bg-green-500/10',
  },
]

export function AgentKnowledgeSources({
  sources = defaultSources,
  onSelect,
  selected = [],
  disabled,
}: AgentKnowledgeSourcesProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Library className="size-4" />
          </div>
          <h3 className="font-semibold text-sm">Knowledge Sources</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => onSelect?.(source.id)}
            disabled={disabled}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all hover:shadow-sm ${
              selected.includes(source.id)
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/30 bg-muted/30'
            }`}
          >
            <div className={`flex size-12 items-center justify-center rounded-xl ${source.color} mb-3`}>
              {source.icon}
            </div>
            <p className="text-sm font-medium text-center">{source.label}</p>
            <p className="text-[10px] text-muted-foreground text-center mt-1">{source.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
