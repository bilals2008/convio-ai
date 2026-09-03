import { Globe, ExternalLink } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function SourcesDrawer({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null

  const unique = [...new Set(urls)]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-auto p-0 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <Globe className="size-3" />
          Searched {unique.length} website{unique.length !== 1 ? 's' : ''}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-[340px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Sources</SheetTitle>
        </SheetHeader>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 -mx-1">
          {unique.map((url) => {
            let hostname = ''
            let path = ''
            try {
              const u = new URL(url)
              hostname = u.hostname
              path = u.pathname.replace(/\/$/, '')
              if (path.length > 40) path = path.slice(0, 40) + '…'
            } catch { /* not a valid URL */ }
            return (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-0.5 rounded-lg px-2 py-2.5 text-sm transition-colors hover:bg-muted group"
              >
                <span className="flex items-center gap-1.5 text-foreground font-medium">
                  <ExternalLink className="size-3 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                  <span className="truncate">{hostname}</span>
                </span>
                {path && (
                  <span className="truncate text-[11px] text-muted-foreground group-hover:text-muted-foreground/70">
                    {path}
                  </span>
                )}
              </a>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
