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
}: InstallTabProps) {
  return (
    <div className="space-y-5">
      {/* Step 1 — Install */}
      <SectionCard
        icon={
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            1
          </span>
        }
        title="Install Widget"
        description="Paste this before the closing &lt;/body&gt; tag."
      >
        <div className="space-y-3">
          <div className="relative rounded-xl bg-muted/70 ring-1 ring-border/60 overflow-hidden">
            <button
              type="button"
              onClick={onCopyEmbed}
              className="absolute top-2.5 right-2.5 z-10 flex size-7 items-center justify-center rounded-md bg-muted/80 text-muted-foreground backdrop-blur-sm hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Copy code"
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            </button>
            <pre className="overflow-x-auto px-4 py-4">
              <code className="block font-mono text-[13px] leading-relaxed">
                <span className="hljs-comment">{'<!-- Convio widget -->'}</span>{'\n'}
                <span className="hljs-tag">{'<script'}</span>{' '}
                <span className="hljs-attr">src</span>
                <span className="hljs-string">={`"${window.location.origin}/widget.js"`}</span>{'\n'}
                {'  '}
                <span className="hljs-attr">data-widget-key</span>
                <span className="hljs-string">={`"${publicKey}"`}</span>
                <span className="hljs-tag">{'></script>'}</span>
              </code>
            </pre>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() =>
              window.open(
                `/widget/demo?embed=true&widgetKey=${publicKey}&position=${position}&preview=true`,
                '_blank',
              )
            }
          >
            <ExternalLink className="size-3.5" />
            Preview Widget
          </Button>
        </div>
      </SectionCard>

      {/* Step 2 — Domains */}
      <SectionCard
        icon={
          <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            2
          </span>
        }
        title="Domain Security"
        description="Only these origins may load your widget."
      >
        <div className="space-y-3">
          {domains.length > 0 ? (
            <div className="rounded-lg border border-border/60 divide-y divide-border/60">
              {domains.map((d) => (
                <div key={d} className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <Globe2 className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate font-mono text-xs">{d}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveDomain(d)}
                    className="ml-2 shrink-0 text-muted-foreground/60 hover:text-destructive transition-colors"
                    aria-label={`Remove ${d}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No domains configured. Add at least one before publishing.
            </p>
          )}

          <div className="flex gap-2">
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
            <Button size="sm" variant="outline" onClick={onAddDomain} className="h-8 px-3 gap-1.5">
              <Plus className="size-3" />
              Add
            </Button>
          </div>

          {domains.length > 0 && (
            <p className="text-[11px] text-muted-foreground" aria-live="polite">
              {domains.length} domain{domains.length !== 1 ? 's' : ''} configured
            </p>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
