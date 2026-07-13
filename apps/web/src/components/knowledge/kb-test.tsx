import { useRef, useState } from 'react'
import { Search, ArrowUp, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { knowledge as knowledgeApi } from '@/lib/api'
import type { SearchResult } from './kb-types'
import { DocumentTypeBadge } from './document-type-badge'

function highlight(text: string, query: string) {
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 2)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  if (terms.length === 0) return text
  const re = new RegExp(`(${terms.join('|')})`, 'gi')
  const parts = text.split(re)
  return parts.map((part, i) =>
    re.test(part) ? (
      <mark key={i} className="rounded bg-primary/20 px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  )
}

function tokenEstimate(text: string): number {
  return Math.ceil(text.length / 4)
}

function inferType(name: string): 'pdf' | 'txt' | 'csv' | 'md' | 'json' | 'url' {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (ext === 'csv') return 'csv'
  if (ext === 'md') return 'md'
  if (ext === 'json') return 'json'
  return 'txt'
}

interface KbTestPanelProps {
  knowledgeBaseId: string
  onTested: () => void
  onSearch?: (meta: { latency: number | null; found: number; query: string }) => void
}

export function KbTestPanel({ knowledgeBaseId, onTested, onSearch }: KbTestPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [latency, setLatency] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const run = async (q: string) => {
    const term = q.trim()
    if (!term || searching) return
    setQuery(term)
    setSearching(true)
    const start = performance.now()
    try {
      const res = await knowledgeApi.searchChunks(knowledgeBaseId, term, 10)
      const data = (res.data.data || []) as SearchResult[]
      setResults(data)
      setLatency(Math.round(performance.now() - start))
      setHasSearched(true)
      onTested()
      onSearch?.({ latency: Math.round(performance.now() - start), found: data.length, query: term })
    } catch {
      setResults([])
      setLatency(null)
      setHasSearched(true)
    } finally {
      setSearching(false)
    }
  }

  const promptTokens = results.reduce((s, r) => s + tokenEstimate(r.content), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') run(query)
            }}
            placeholder="Search your knowledge base…"
            className="h-10 w-full rounded-lg border border-border/60 bg-background pl-9 pr-4 text-sm outline-none transition-colors focus:border-primary/50"
          />
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 shrink-0"
          onClick={() => run(query)}
          disabled={searching || !query.trim()}
        >
          {searching ? (
            <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <ArrowUp className="size-3.5" />
          )}
          Test
        </Button>
      </div>

      {!hasSearched && !searching && (
        <p className="text-xs text-muted-foreground">
          Run a query to verify retrieval quality.
        </p>
      )}

      {searching && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg border border-border/60 bg-card" />
          ))}
        </div>
      )}

      {hasSearched && !searching && (
        <>
          {results.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 py-10 text-center">
              <p className="text-sm text-muted-foreground">No results for "{query}"</p>
              <p className="mt-1 text-xs text-muted-foreground/70">Try different keywords.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
                <span className="flex items-center gap-3 tabular-nums">
                  {latency != null && (
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {latency}ms
                    </span>
                  )}
                  <span>~{promptTokens} tokens</span>
                </span>
              </div>
              <div className="space-y-2">
                {results.map((chunk, i) => (
                  <div key={chunk.id} className="rounded-lg border border-border/60 bg-card p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex size-5 items-center justify-center rounded bg-muted/60 text-[10px] font-medium tabular-nums">
                          {i + 1}
                        </span>
                        <span className="truncate text-xs font-medium">{chunk.documentName}</span>
                        <DocumentTypeBadge type={inferType(chunk.documentName)} />
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'shrink-0 tabular-nums',
                          chunk.score > 0.8
                            ? 'border-success/30 bg-success/10 text-success'
                            : chunk.score > 0.6
                              ? 'border-warning/30 bg-warning/10 text-warning'
                              : 'border-border bg-muted text-muted-foreground',
                        )}
                      >
                        {Math.round(chunk.score * 100)}%
                      </Badge>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-relaxed text-foreground/90">
                      {highlight(chunk.content, query)}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
