import { Code2, Copy, Check, ExternalLink, Globe2, Plus, Terminal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { SectionCard } from './SectionCard'
import { DomainTag } from './DomainTag'

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
  const snippet = `<script src="${window.location.origin}/widget.js" data-widget-key="${publicKey}"></script>`

  return (
    <>
      <SectionCard
        icon={<Globe2 className="size-3.5" aria-hidden="true" />}
        title="Allowed domains"
        description="Only these origins may load your widget."
      >
        <div className="space-y-4">
          {domains.length > 0 ? (
            <div className="flex flex-wrap gap-1.5" role="list" aria-label="Allowed domains">
              {domains.map((d) => (
                <DomainTag key={d} domain={d} onRemove={() => onRemoveDomain(d)} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-center">
              <Globe2
                className="mx-auto mb-2 size-5 text-muted-foreground/50"
                aria-hidden="true"
              />
              <p className="text-xs text-muted-foreground">No domains configured yet.</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                Add at least one domain before publishing.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={domainInput}
              onChange={(e) => onDomainInputChange(e.target.value)}
              placeholder="example.com"
              className="h-9 font-mono text-sm"
              aria-label="Domain to add"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  onAddDomain()
                }
              }}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={onAddDomain}
              aria-label="Add domain"
              className="h-9"
            >
              <Plus className="size-3.5" aria-hidden="true" />
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

      <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10">
        <div className="flex items-start justify-between gap-3 border-b border-border/60 bg-card px-6 py-5">
          <div className="flex items-start gap-3">
            <div
              className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/50 text-muted-foreground"
              aria-hidden="true"
            >
              <Code2 className="size-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Embed snippet</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Paste this before the closing <code className="font-mono">&lt;/body&gt;</code> tag.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="overflow-hidden rounded-lg ring-1 ring-foreground/10">
            <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Terminal className="size-3.5" aria-hidden="true" />
                <span className="font-mono text-[11px]">index.html</span>
              </div>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={onCopyEmbed}
                aria-label="Copy embed code to clipboard"
                className="text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="size-3.5 text-success" aria-hidden="true" />
                ) : (
                  <Copy className="size-3.5" aria-hidden="true" />
                )}
              </Button>
            </div>
            <pre className="overflow-x-auto bg-card p-3">
              <code className="block break-all font-mono text-xs leading-relaxed text-muted-foreground">
                <span className="text-foreground/60">{'<!-- Convio widget -->'}</span>
                {'\n'}
                {snippet}
              </code>
            </pre>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={onCopyEmbed} aria-label="Copy embed code to clipboard">
              {copied ? (
                <Check className="size-3.5" aria-hidden="true" />
              ) : (
                <Copy className="size-3.5" aria-hidden="true" />
              )}
              {copied ? 'Copied' : 'Copy embed code'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  `/widget/demo?embed=true&widgetKey=${publicKey}&position=${position}&preview=true`,
                  '_blank',
                )
              }
              aria-label="Open live preview in new tab"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Live preview
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open('https://docs.convio.ai/embedding', '_blank')}
              aria-label="Open embedding documentation"
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Docs
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
