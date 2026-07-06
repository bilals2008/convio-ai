import { useNavigate } from 'react-router-dom'
import { BookOpen, FileText, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface KnowledgeBase {
  id: string
  name: string
  description?: string
  documentCount: number
  createdAt: string
  updatedAt: string
}

interface KnowledgeCardProps {
  kb: KnowledgeBase
  onDelete: (id: string) => void
}

export function KnowledgeCard({ kb, onDelete }: KnowledgeCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-muted/30"
      onClick={() => navigate(`/knowledge/${kb.id}`)}
    >
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="size-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{kb.name}</h3>
              {kb.description && (
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {kb.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                navigate(`/knowledge/${kb.id}`)
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onDelete(kb.id)
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        <Badge variant="secondary" className="w-fit text-xs">
          <FileText className="size-3" />
          {kb.documentCount} document{kb.documentCount !== 1 ? 's' : ''}
        </Badge>

        <Separator />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created: {new Date(kb.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(kb.updatedAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
