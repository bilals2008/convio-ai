import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'

export default function Documents() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">Manage uploaded documents for your knowledge bases</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <FileText className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Document Management</h2>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            Upload and manage documents for your knowledge bases. Supported formats: PDF, TXT, CSV, MD, JSON, and URLs.
          </p>
          <Badge variant="secondary">Coming Soon</Badge>
        </CardContent>
      </Card>
    </div>
  )
}
