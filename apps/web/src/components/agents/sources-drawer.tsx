import { Globe, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
      <SheetTrigger
        render={
          <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground" />
        }
      >
        <Globe className="size-3" />
        Searched {unique.length} website{unique.length !== 1 ? 's' : ''}
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>Sources</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1 overflow-y-auto px-4 pb-4">
          {unique.map((url) => {
            let hostname = url
            try {
              hostname = new URL(url).hostname
            } catch { /* not a valid URL */ }
            return (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{hostname}</span>
                <span className="ml-auto shrink-0 truncate text-xs text-muted-foreground">
                  {url}
                </span>
              </a>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
