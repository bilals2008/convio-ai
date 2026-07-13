import { useState } from 'react'
import { Database, Layers, AlertTriangle, Activity, Gauge, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatRelative } from './kb-format'
import { StatTile } from './kb-stat'
import { KbStatusBadge } from './kb-status-badge'
import type { KnowledgeBaseDetail, KbHealth, KbSettings } from './kb-types'

export interface KbFormValues {
  name: string
  description: string
  tags: string[]
}

interface KbOverviewProps {
  kb: KnowledgeBaseDetail
  form: KbFormValues
  errors: Partial<Record<keyof KbFormValues, string>>
  onFormChange: (next: KbFormValues) => void
  settings: KbSettings
  health: KbHealth
  disabled?: boolean
}

function fmtBytes(n: number): string {
  if (n <= 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB']
  let v = n
  let i = 0
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`
}

function fmtDate(iso?: string): string {
  return formatRelative(iso)
}

const healthConfig: Record<
  KbHealth['indexHealth'],
  { label: string; className: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  healthy: { label: 'Healthy', className: 'bg-success/10 text-success border-success/30', Icon: ShieldCheck },
  degraded: { label: 'Degraded', className: 'bg-warning/10 text-warning border-warning/30', Icon: ShieldAlert },
  critical: { label: 'Critical', className: 'bg-destructive/10 text-destructive border-destructive/30', Icon: ShieldX },
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-xs font-medium tabular-nums">{children}</span>
    </div>
  )
}

function TagEditor({
  tags,
  onChange,
  disabled,
}: {
  tags: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
}) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const t = draft.trim()
    if (t && !tags.includes(t)) onChange([...tags, t])
    setDraft('')
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <Badge key={t} variant="secondary" className="gap-1 pr-1">
          {t}
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange(tags.filter((x) => x !== t))}
              className="ml-0.5 rounded-full px-1 text-muted-foreground hover:text-foreground"
              aria-label={`Remove ${t}`}
            >
              ×
            </button>
          )}
        </Badge>
      ))}
      {!disabled && (
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              add()
            }
          }}
          onBlur={add}
          placeholder="Add tag…"
          className="min-w-[80px] flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
        />
      )}
      {tags.length === 0 && disabled && (
        <span className="text-xs text-muted-foreground">No tags</span>
      )}
    </div>
  )
}

export function KbOverview({
  kb,
  form,
  errors,
  onFormChange,
  settings,
  health,
  disabled,
}: KbOverviewProps) {
  const healthMeta = healthConfig[health.indexHealth]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">Details</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kb-name" className="text-xs font-medium text-muted-foreground">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="kb-name"
                value={form.name}
                disabled={disabled}
                maxLength={200}
                onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="kb-desc" className="text-xs font-medium text-muted-foreground">
                Description
              </Label>
              <Textarea
                id="kb-desc"
                value={form.description}
                disabled={disabled}
                maxLength={1000}
                rows={3}
                onChange={(e) => onFormChange({ ...form, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Tags</Label>
              <TagEditor
                tags={form.tags}
                disabled={disabled}
                onChange={(tags) => onFormChange({ ...form, tags })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Owner</Label>
              <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
                <Avatar className="size-7">
                  <AvatarFallback className="bg-primary/15 text-primary text-[11px]">
                    {kb.owner?.name
                      .split(' ')
                      .map((p) => p[0])
                      .slice(0, 2)
                      .join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{kb.owner?.name || 'Unassigned'}</p>
                  {kb.owner?.email && (
                    <p className="truncate text-xs text-muted-foreground">{kb.owner.email}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Summary</h3>
            <KbStatusBadge status={kb.status} />
          </div>
          <div className="divide-y divide-border/60">
            <SummaryRow label="Total Documents">{kb.documentCount}</SummaryRow>
            <SummaryRow label="Chunks">{health.chunks}</SummaryRow>
            <SummaryRow label="Embedding Model">
              <span className="font-mono">{settings.embeddingModel}</span>
            </SummaryRow>
            <SummaryRow label="Vector Size">{settings.embeddingDimensions}d</SummaryRow>
            <SummaryRow label="Storage Used">{fmtBytes(health.chunks * 1200)}</SummaryRow>
            <SummaryRow label="Created">{fmtDate(kb.createdAt)}</SummaryRow>
            <SummaryRow label="Last Indexed">{fmtDate(kb.lastIndexedAt)}</SummaryRow>
            <SummaryRow label="Last Updated">{fmtDate(kb.updatedAt)}</SummaryRow>
            <SummaryRow label="Index Health">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                  healthMeta.className,
                )}
              >
                <healthMeta.Icon className="size-3" />
                {healthMeta.label}
              </span>
            </SummaryRow>
          </div>
        </section>
      </div>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <Activity className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Knowledge Health</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Documents" value={health.documents} icon={Database} accent="info" hint={`${health.documents} total indexed`} />
          <StatTile label="Chunks" value={health.chunks.toLocaleString()} icon={Layers} accent="info" hint={`${health.chunks} searchable units`} />
          <StatTile
            label="Retrieval Accuracy"
            value={health.retrievalAccuracy == null ? '—' : `${Math.round(health.retrievalAccuracy * 100)}%`}
            icon={Gauge}
            accent={health.retrievalAccuracy == null ? 'default' : health.retrievalAccuracy > 0.7 ? 'success' : 'warning'}
            hint={health.retrievalAccuracy == null ? 'run a test' : 'of queries relevant'}
          />
          <StatTile
            label="Failed Documents"
            value={health.failedDocuments}
            icon={AlertTriangle}
            accent={health.failedDocuments > 0 ? 'destructive' : 'success'}
            hint={health.failedDocuments > 0 ? 'needs attention' : 'all clear'}
          />
        </div>
      </section>
    </div>
  )
}
