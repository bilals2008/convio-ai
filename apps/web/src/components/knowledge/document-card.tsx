import { Eye, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DocumentTypeBadge } from './document-type-badge'
import { DocumentStatusBadge } from './document-status-badge'

type DocType = 'txt' | 'pdf' | 'csv' | 'md' | 'json' | 'url'
type DocStatus = 'pending' | 'processing' | 'ready' | 'error' | 'archived'

interface DocumentItem {
  id: string
  name: string
  type: DocType
  status: DocStatus
  content?: string
  url?: string
  createdAt: string
}

interface DocumentCardProps {
  doc: DocumentItem
  onView: (id: string) => void
  onDelete: (id: string) => void
}

export function DocumentCard({ doc, onView, onDelete }: DocumentCardProps) {
  return (
    <Card className="transition-colors hover:bg-muted/30">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <DocumentTypeBadge type={doc.type} />
          <div>
            <h4 className="text-sm font-medium">{doc.name}</h4>
            <p className="text-xs text-muted-foreground">
              {new Date(doc.createdAt).toLocaleDateString()}
            </p>
          </div>
          <DocumentStatusBadge status={doc.status} />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => onView(doc.id)}>
            <Eye className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(doc.id)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
