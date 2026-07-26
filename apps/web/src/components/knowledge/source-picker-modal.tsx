import { Upload, Type, HelpCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const SVG = 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons'

export type SourceType = 'file-upload' | 'website' | 'custom-text' | 'faq'

interface SourceOption {
  id: SourceType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }> | null
  logo: string | null
}

const sources: SourceOption[] = [
  { id: 'file-upload', label: 'File Upload', description: 'PDF, DOCX, TXT files', icon: Upload, logo: null },
  { id: 'website', label: 'Website', description: 'Crawl web pages', icon: null, logo: `${SVG}/google-chrome/default.svg` },
  { id: 'custom-text', label: 'Custom Text', description: 'Plain text content', icon: Type, logo: null },
  { id: 'faq', label: 'FAQ', description: 'Q&A pairs', icon: HelpCircle, logo: null },
]

interface SourcePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (sourceId: SourceType) => void
}

export function SourcePickerModal({ open, onOpenChange, onSelect }: SourcePickerModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Add source</DialogTitle>
        </DialogHeader>
        <div className="space-y-1">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => { onSelect(source.id); onOpenChange(false) }}
              className="flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-muted/50 cursor-pointer"
            >
              {source.logo ? (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background border border-border/40">
                  <img src={source.logo} alt={source.label} className="size-5" />
                </div>
              ) : source.icon ? (
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <source.icon className="size-[18px]" />
                </div>
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{source.label}</p>
                <p className="text-xs text-muted-foreground leading-tight">{source.description}</p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
