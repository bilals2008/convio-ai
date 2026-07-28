import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { analyticsApi as analytics, type TopDocumentEntry } from '@/lib/api/analytics'
import { FileIcon } from '@/components/shared/file-icon'
import { BookOpen } from 'lucide-react'

interface TopDocumentsTableProps {
  orgId: string
}

export function TopDocumentsTable({ orgId }: TopDocumentsTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['top-documents', orgId],
    queryFn: async () => {
      const res = await analytics.topDocuments(orgId, { limit: 10 })
      return res.data.data
    },
    enabled: !!orgId,
  })

  const hasData = data && data.length > 0

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Top Knowledge Base Documents</CardTitle>
        </div>
        <div className="text-sm text-muted-foreground">Most queried documents</div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : !hasData ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10 mb-3">
              <BookOpen className="size-5 text-amber-500" />
            </div>
            <p className="text-sm font-medium text-foreground">No document queries yet</p>
            <p className="text-xs text-muted-foreground mt-1">Document usage will appear once your agents start retrieving knowledge.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Document</th>
                  <th className="pb-2 font-medium text-right">Queries</th>
                  <th className="pb-2 font-medium text-right">Success Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.map((doc: TopDocumentEntry) => {
                  const ext = doc.name.includes('.') ? doc.name.split('.').pop()! : 'document'
                  return (
                    <tr key={doc.id} className="border-b last:border-0">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <FileIcon type={ext} size={16} className="shrink-0" />
                          <span className="font-medium text-foreground truncate max-w-[180px]">{doc.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 text-right tabular-nums">{doc.queries}</td>
                      <td className="py-2.5 text-right">
                        <span className={`tabular-nums font-medium ${doc.successRate >= 80 ? 'text-emerald-500' : doc.successRate >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                          {doc.successRate}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
