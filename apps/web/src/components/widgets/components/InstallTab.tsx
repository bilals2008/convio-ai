import { Copy, Check, ExternalLink, Plus, Globe2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SectionCard } from './SectionCard'

interface InstallTabProps {
  domains: string[]
  domainInput: string
  onDomainInputChange: (value: string) => void
  onAddDomain: () => void
  onRemoveDomain: (domain: string) => void
  publicKey: string
  onCopyEmbed: () => void
  copied: boolean
  position: string
  snippet: string
}

export function InstallTab({
  domains,
  domainInput,
  onDomainInputChange,
  onAddDomain,
  onRemoveDomain,
  publicKey,
  onCopyEmbed,
  copied,
  position,
  snippet,
}: InstallTabProps) {
  return (
    <div className="space-y-6 [&>*+*]:border-t [&>*+*]:border-border/40 [&>*+*]:pt-6">
      <SectionCard
        icon={
          <span className="flex size-6 items-center justify-center rounded-lg bg-primary/8 text-[10px] font-semibold text-primary">
            1
          </span>
        }
        title="Install"
        description="Paste this before the closing </body> tag"
      >
        <div className="space-y-3">
          <div className="relative rounded-xl bg-muted/40 ring-1 ring-border/30 overflow-hidden">
            <button
              type="button"
              onClick={onCopyEmbed}
              className="absolute top-2.5 right-2.5 z-10 flex size-7 items-center justify-center rounded-lg bg-card/80 text-muted-foreground/60 backdrop-blur-sm hover:bg-card hover:text-foreground transition-colors ring-1 ring-border/20"
              aria-label="Copy code"
            >
              {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
            </button>
            <pre className="overflow-x-auto px-4 py-3.5">
              <code className="block font-mono text-[12px] leading-relaxed text-foreground/80">
                {snippet || <span className="text-muted-foreground/50">{'Loading embed code...'}</span>}
              </code>
            </pre>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs"
            onClick={() =>
              window.open(
                `/widget/demo?embed=true&widgetKey=${publicKey}&position=${position}&preview=true`,
                '_blank',
              )
            }
          >
            <ExternalLink className="size-3.5" />
            Preview widget
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        icon={
          <span className="flex size-6 items-center justify-center rounded-lg bg-primary/8 text-[10px] font-semibold text-primary">
            2
          </span>
        }
        title="Domains"
        description="Only these origins may load your widget"
      >
        <div className="space-y-3">
          {domains.length > 0 ? (
            <div className="rounded-lg border border-border/30 divide-y divide-border/30">
              {domains.map((d) => (
                <div key={d} className="flex items-center justify-between px-3.5 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe2 className="size-3.5 shrink-0 text-muted-foreground/40" />
                    <span className="truncate font-mono text-xs text-foreground">{d}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveDomain(d)}
                    className="ml-2 shrink-0 text-muted-foreground/30 hover:text-destructive transition-colors text-sm"
                    aria-label={`Remove ${d}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/60">
              No domains configured. Add at least one before publishing.
            </p>
          )}

          <div className="flex gap-1.5">
            <Input
              value={domainInput}
              onChange={(e) => onDomainInputChange(e.target.value)}
              placeholder="example.com"
              className="h-8 flex-1 font-mono text-xs"
              aria-label="Domain to add"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onAddDomain()
                }
              }}
            />
            <Button size="sm" variant="outline" onClick={onAddDomain} className="h-8 px-3 gap-1.5 text-xs">
              <Plus className="size-3" />
              Add
            </Button>
          </div>

          {domains.length > 0 && (
            <p className="text-[11px] text-muted-foreground/50" aria-live="polite">
              {domains.length} domain{domains.length !== 1 ? 's' : ''} configured
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
