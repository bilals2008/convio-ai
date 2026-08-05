import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Layers, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAdminKnowledgeDocument } from '@/admin/hooks/use-admin'

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: 'Pending', cls: 'bg-amber-500/10 text-amber-500' },
  processing: { label: 'Processing', cls: 'bg-blue-500/10 text-blue-500' },
  ready: { label: 'Ready', cls: 'bg-emerald-500/10 text-emerald-500' },
  error: { label: 'Error', cls: 'bg-red-500/10 text-red-500' },
  archived: { label: 'Archived', cls: 'bg-muted text-muted-foreground' },
}

function statusBadge(status: string) {
  const meta = STATUS_META[status] ?? { label: status, cls: 'bg-muted text-muted-foreground' }
  return <Badge variant="secondary" className={meta.cls}>{meta.label}</Badge>
}

export default function AdminKnowledgeDocumentDetailPage() {
  const { kbId, documentId } = useParams<{ kbId: string; documentId: string }>()
  const navigate = useNavigate()
  const { data: doc, isLoading } = useAdminKnowledgeDocument(kbId, documentId)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        <div className="h-20 bg-muted animate-pulse rounded-xl" />
        <div className="h-40 bg-muted animate-pulse rounded-xl" />
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-sm text-muted-foreground">Document not found.</p>
        <Button variant="link" onClick={() => navigate(`/admin/knowledge-bases/${kbId}`)}>Back to knowledge base</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/knowledge-bases/${kbId}`)}>
        <ArrowLeft className="size-4 mr-1" /> Back
      </Button>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold break-words">{doc.name}</h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {doc.type} &middot; Added {new Date(doc.createdAt).toLocaleDateString()} &middot; {doc.chunkCount} chunks
              </p>
              {doc.url && (
                <p className="mt-1 text-xs text-muted-foreground break-all">{doc.url}</p>
              )}
            </div>
            {statusBadge(doc.status)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="size-4 text-muted-foreground" />
            Chunks ({doc.chunks.length}{doc.chunkCount > doc.chunks.length ? `+` : ''})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {doc.chunks.length === 0 ? (
            <p className="p-5 text-xs text-muted-foreground">No chunks indexed yet.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {doc.chunks.map((chunk, i) => (
                <div key={chunk.id} className="px-5 py-3">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Chunk {i + 1}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{chunk.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="size-4 text-muted-foreground" />
            Query history ({doc.queries.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {doc.queries.length === 0 ? (
            <p className="p-5 text-xs text-muted-foreground">No queries recorded.</p>
          ) : (
            <div className="divide-y divide-border/60">
              {doc.queries.map((q) => (
                <div key={q.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleString()}</span>
                  {q.success
                    ? <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">Success</Badge>
                    : <Badge variant="secondary" className="bg-red-500/10 text-red-500">Failed</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
