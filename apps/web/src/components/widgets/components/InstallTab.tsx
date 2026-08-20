import { ExternalLink, Plus, Globe2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/shared/code-block'
import { SectionCard } from './SectionCard'

const Html5Icon = () => (
  <svg viewBox="0 0 452 520" className="size-4 shrink-0" aria-hidden="true">
    <path fill="#e34f26" d="M41 460L0 0h451l-41 460-185 52" />
    <path fill="#ef652a" d="M226 472l149-41 35-394H226" />
    <path fill="#ecedee" d="M226 208h-75l-5-58h80V94H84l15 171h127zm0 147l-64-17-4-45h-56l7 89 117 32z" />
    <path fill="#fff" d="M226 265h69l-7 73-62 17v59l115-32 16-174H226zm0-171v56h136l5-56z" />
  </svg>
)

interface InstallTabProps {
  domains: string[]
  domainInput: string
  onDomainInputChange: (value: string) => void
  onAddDomain: () => void
  onRemoveDomain: (domain: string) => void
  publicKey: string
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
          {snippet ? (
            <CodeBlock code={snippet} language="html" icon={<Html5Icon />} />
          ) : (
            <div className="rounded-lg bg-muted p-4">
              <p className="font-mono text-xs text-muted-foreground/50">Loading embed code...</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs"
            onClick={() =>
              window.open(
                `/widget-entry.html?embed=true&widgetKey=${publicKey}&position=${position}&preview=true`,
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
