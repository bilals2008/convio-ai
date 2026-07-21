import { Globe2, X } from 'lucide-react'

interface DomainTagProps {
  domain: string
  onRemove: () => void
}

export function DomainTag({ domain, onRemove }: DomainTagProps) {
  return (
    <div
      role="listitem"
      className="group inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-card py-1 pl-2 pr-1 font-mono text-xs transition-colors duration-200 hover:border-border"
    >
      <Globe2 className="size-3 text-muted-foreground" aria-hidden="true" />
      <span className="text-foreground">{domain}</span>
      <button
        onClick={onRemove}
        aria-label={`Remove domain: ${domain}`}
        className="rounded p-0.5 text-muted-foreground transition-colors duration-150 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </div>
  )
}
