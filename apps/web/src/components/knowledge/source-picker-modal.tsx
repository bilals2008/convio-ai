import { Upload, Type, HelpCircle } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type SourceType = 'file-upload' | 'website' | 'custom-text' | 'faq'

interface SourceOption {
  id: SourceType
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const sources: SourceOption[] = [
  { id: 'file-upload', label: 'File Upload', description: 'PDF, DOCX, TXT files', icon: Upload },
  { id: 'website', label: 'Website', description: 'Crawl web pages', icon: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-[18px]"><path d="M12 2a10 10 0 1 0 10 10h-10V2Z"/><path d="M12 2v10l8.66 5"/></svg>
  ) },
  { id: 'custom-text', label: 'Custom Text', description: 'Plain text content', icon: Type },
  { id: 'faq', label: 'FAQ', description: 'Q&A pairs', icon: HelpCircle },
]

interface SourcePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (sourceId: SourceType) => void
}

export function SourcePickerModal({ open, onOpenChange, onSelect }: SourcePickerModalProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <span />
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-56 p-1">
        {sources.map((source) => {
          const Icon = source.icon
          return (
            <button
              key={source.id}
              onClick={() => { onSelect(source.id); onOpenChange(false) }}
              className="flex w-full items-center gap-3 rounded-md p-2.5 text-left transition-colors hover:bg-muted/50 cursor-pointer"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">{source.label}</p>
                <p className="text-xs text-muted-foreground leading-tight">{source.description}</p>
              </div>
            </button>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
