import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { knowledge as knowledgeApi } from '@/lib/api'
import { toast } from 'sonner'
import type { SearchResult } from './kb-types'

interface KbTestPanelProps {
  knowledgeBaseId: string
  onTested: () => void
  onSearch: (meta: { latency: number | null; found: number; query: string }) => void
}

export function KbTestPanel({ knowledgeBaseId, onTested, onSearch }: KbTestPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)

  const searchMutation = useMutation({
    mutationFn: async (q: string) => {
      const start = performance.now()
      const res = await knowledgeApi.searchChunks(knowledgeBaseId, q)
      const latency = performance.now() - start
      return { results: (res.data.data || []) as SearchResult[], latency }
    },
    onSuccess: ({ results: hits, latency }) => {
      setResults(hits)
      onSearch({ latency, found: hits.length, query })
      onTested()
    },
    onError: () => toast.error('Search failed'),
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a test query..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) searchMutation.mutate(query.trim())
          }}
        />
        <Button
          onClick={() => query.trim() && searchMutation.mutate(query.trim())}
          disabled={!query.trim() || searchMutation.isPending}
        >
          {searchMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
        </Button>
      </div>

      {results && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">{results.length} result{results.length !== 1 ? 's' : ''}</p>
          {results.map((r) => (
            <div key={r.id} className="rounded-lg border border-border/40 bg-card p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-medium truncate">{r.documentName}</span>
                <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                  {(r.score * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">{r.content}</p>
            </div>
          ))}
          {results.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">No results found. Try a different query.</p>
          )}
        </div>
      )}
    </div>
  )
}
