import { Search, CheckCircle2, Timer, Hash, FileText, TrendingUp } from 'lucide-react'
import { StatTile } from './kb-stat'
import type { DocumentItem } from './kb-types'

interface KbAnalyticsTabProps {
  documents: DocumentItem[]
  searchCount: number
  successRate: number | null
  avgRetrievalMs: number | null
  topTerms: string[]
}

export function KbAnalyticsTab({
  documents,
  searchCount,
  successRate,
  avgRetrievalMs,
  topTerms,
}: KbAnalyticsTabProps) {
  const totalChunks = documents.reduce((s, d) => s + (d.chunkCount ?? 0), 0)
  const avgTokens = totalChunks > 0 ? Math.round((totalChunks * 1000) / 4) : 0

  const topDocs = documents
    .slice()
    .sort((a, b) => (b.chunkCount ?? 0) - (a.chunkCount ?? 0))
    .slice(0, 5)

  const maxChunks = topDocs[0]?.chunkCount ?? 1

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Searches" value={searchCount} icon={Search} hint="this session" accent="info" />
        <StatTile
          label="Success Rate"
          value={successRate == null ? '—' : `${Math.round(successRate * 100)}%`}
          icon={CheckCircle2}
          accent={successRate == null ? 'default' : successRate > 0.7 ? 'success' : 'warning'}
        />
        <StatTile
          label="Avg Retrieval"
          value={avgRetrievalMs == null ? '—' : `${avgRetrievalMs}ms`}
          icon={Timer}
          accent="info"
        />
        <StatTile label="Avg Tokens" value={avgTokens.toLocaleString()} icon={Hash} hint="per query" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <FileText className="size-4 text-muted-foreground" />
            Most Queried Documents
          </h3>
          {topDocs.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">No documents yet.</p>
          ) : (
            <div className="space-y-3">
              {topDocs.map((d) => {
                const chunks = d.chunkCount ?? 0
                const pct = Math.max(6, Math.round((chunks / maxChunks) * 100))
                return (
                  <div key={d.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="truncate font-medium">{d.name}</span>
                      <span className="tabular-nums text-muted-foreground">{chunks}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border/60 bg-card p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="size-4 text-muted-foreground" />
            Top Search Terms
          </h3>
          {topTerms.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Run test queries to see top terms.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topTerms.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs text-foreground/90"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
