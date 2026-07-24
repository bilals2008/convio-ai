import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, CheckCircle2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { knowledge as knowledgeApi } from '@/lib/api'
import { useOrg } from '@/lib/org-context'

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  documentCount: number
  readyCount?: number
  processingCount?: number
  errorCount?: number
}

interface AgentKnowledgeSourcesProps {
  value?: string
  onChange?: (kbId: string) => void
  disabled?: boolean
}

export function AgentKnowledgeSources({ value, onChange, disabled }: AgentKnowledgeSourcesProps) {
  const { orgId } = useOrg()

  const { data: knowledgeBases = [], isLoading } = useQuery({
    queryKey: ['knowledge-bases', orgId],
    queryFn: async () => {
      const res = await knowledgeApi.list(orgId!)
      return (res.data.data || []) as KnowledgeBase[]
    },
    enabled: !!orgId,
  })

  const selectedKb = knowledgeBases.find((kb) => kb.id === value)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium">Link a knowledge base</Label>
        <p className="text-xs text-muted-foreground">
          Connect an existing knowledge base so this agent can retrieve relevant documents at chat
          time.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={value || ''}
            onValueChange={(v) => onChange?.(v || '')}
            disabled={disabled || isLoading}
          >
            <SelectTrigger className="w-full sm:flex-1">
              <SelectValue placeholder={isLoading ? 'Loading…' : 'Choose a knowledge base'} />
            </SelectTrigger>
            <SelectContent>
              {knowledgeBases.length === 0 ? (
                <SelectItem value="__empty" disabled>
                  No knowledge bases yet
                </SelectItem>
              ) : (
                knowledgeBases.map((kb) => (
                  <SelectItem key={kb.id} value={kb.id}>
                    {kb.name}
                    {typeof kb.documentCount === 'number' ? ` (${kb.documentCount} docs)` : ''}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedKb && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{selectedKb.name}</p>
            <p className="text-xs text-muted-foreground">
              {selectedKb.documentCount} documents
              {typeof selectedKb.readyCount === 'number' ? ` · ${selectedKb.readyCount} ready` : ''}
            </p>
          </div>
          <Link
            to={`/knowledge/${selectedKb.id}`}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline shrink-0"
          >
            View
            <ExternalLink className="size-3" />
          </Link>
        </div>
      )}

      {!isLoading && knowledgeBases.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No knowledge bases in this organization.{' '}
          <Link
            to="/knowledge/new"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Create one
          </Link>
          .
        </p>
      )}

      {!isLoading && knowledgeBases.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Need a new one?{' '}
          <Link
            to="/knowledge/new"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Create knowledge base
          </Link>
        </p>
      )}
    </div>
  )
}