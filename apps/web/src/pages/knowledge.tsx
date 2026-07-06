import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, BookOpen, FileText, MoreVertical } from 'lucide-react'

const knowledgeBases = [
  { id: '1', name: 'Product Documentation', documents: 25, status: 'ready' },
  { id: '2', name: 'FAQ', documents: 50, status: 'ready' },
  { id: '3', name: 'Policies', documents: 12, status: 'processing' },
]

export default function Knowledge() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Manage documents for RAG</p>
        </div>
        <Button>
          <Plus className="mr-2 size-4" />
          New Knowledge Base
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {knowledgeBases.map((kb) => (
          <Card key={kb.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="size-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{kb.name}</CardTitle>
                  <CardDescription>{kb.documents} documents</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="size-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge variant={kb.status === 'ready' ? 'default' : 'secondary'}>
                  {kb.status}
                </Badge>
                <Button variant="outline" size="sm">
                  <FileText className="mr-2 size-4" />
                  View Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
