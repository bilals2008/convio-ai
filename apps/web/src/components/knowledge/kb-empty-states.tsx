import { BookOpen, FileText, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  className?: string
  action?: React.ReactNode
}

export function NoKnowledgeBases({ className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 text-center', className)}>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 mb-5">
        <BookOpen className="size-7 text-muted-foreground/50" />
      </div>
      <h3 className="text-base font-semibold mb-1.5">No knowledge bases yet</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5 leading-relaxed">
        Create a knowledge base to add documents and give your AI agents
        context-aware responses grounded in your data.
      </p>
    </div>
  )
}

export function NoDocuments({ onAddSource }: { onAddSource: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-muted/60 mb-4">
        <FileText className="size-6 text-muted-foreground/50" />
      </div>
      <h3 className="text-sm font-semibold mb-1">No documents yet</h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-4 leading-relaxed">
        Add your first source to start building context for your AI agents.
        Documents are chunked, embedded, and indexed for retrieval.
      </p>
      <Button size="sm" className="gap-1.5" onClick={onAddSource}>
        <Plus className="size-3.5" />
        Add Source
      </Button>
    </div>
  )
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <Search className="size-5 text-muted-foreground/40 mb-2" />
      <p className="text-sm text-muted-foreground">
        No results for "{query}"
      </p>
      <p className="text-xs text-muted-foreground/70 mt-1">
        Try different keywords or check that documents are indexed.
      </p>
    </div>
  )
}
