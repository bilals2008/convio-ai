import { AlertTriangle, RotateCcw, ScrollText, Download, LifeBuoy } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KbErrorCardProps {
  failedCount: number
  errorMessage?: string
  onRetry: () => void
  onViewLogs: () => void
  onDownloadLogs: () => void
  onContactSupport: () => void
}

export function KbErrorCard({
  failedCount,
  errorMessage,
  onRetry,
  onViewLogs,
  onDownloadLogs,
  onContactSupport,
}: KbErrorCardProps) {
  if (failedCount === 0) return null

  return (
    <section className="overflow-hidden rounded-xl border border-destructive/30 bg-destructive/5">
      <div className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
          <AlertTriangle className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-destructive">
              Indexing failed for {failedCount} document{failedCount > 1 ? 's' : ''}
            </h3>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {errorMessage ||
              'One or more documents could not be parsed, chunked, or embedded. This usually happens with unsupported file types, corrupted uploads, or rate limits on the embedding provider.'}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={onRetry}>
              <RotateCcw className="size-3.5" />
              Retry
            </Button>
            <Button size="sm" variant="ghost" className="gap-1.5" onClick={onViewLogs}>
              <ScrollText className="size-3.5" />
              View Logs
            </Button>
            <Button size="sm" variant="ghost" className="gap-1.5" onClick={onDownloadLogs}>
              <Download className="size-3.5" />
              Download Logs
            </Button>
            <Button size="sm" variant="ghost" className="gap-1.5" onClick={onContactSupport}>
              <LifeBuoy className="size-3.5" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
