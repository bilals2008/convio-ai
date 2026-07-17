import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Clock, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface KbUpdate {
  id: string
  name: string
  type: 'pdf' | 'txt' | 'md' | 'url'
  action: 'uploaded' | 'updated' | 're-indexed'
  timestamp: string
}

const mockUpdates: KbUpdate[] = [
  { id: '1', name: 'pricing-faq.pdf', type: 'pdf', action: 'uploaded', timestamp: '5 min ago' },
  { id: '2', name: 'product-docs', type: 'md', action: 're-indexed', timestamp: '32 min ago' },
  { id: '3', name: 'help-center', type: 'url', action: 'updated', timestamp: '2 hours ago' },
  { id: '4', name: 'api-reference.txt', type: 'txt', action: 'uploaded', timestamp: '5 hours ago' },
]

function getTypeBadge(type: KbUpdate['type']) {
  const colors: Record<string, string> = {
    pdf: 'bg-red-500/10 text-red-500',
    txt: 'bg-blue-500/10 text-blue-500',
    md: 'bg-violet-500/10 text-violet-500',
    url: 'bg-emerald-500/10 text-emerald-500',
  }
  return colors[type] || 'bg-muted text-muted-foreground'
}

function getActionText(action: KbUpdate['action']) {
  switch (action) {
    case 'uploaded': return 'New upload'
    case 'updated': return 'Updated'
    case 're-indexed': return 'Re-indexed'
    default: return action
  }
}

export function RecentKbUpdates() {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between border-b py-4">
        <CardTitle className="text-base">Recent Knowledge Base Updates</CardTitle>
        <Link to="/knowledge" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          View all <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {mockUpdates.map((update) => (
            <div key={update.id} className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted shrink-0">
                <FileText className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{update.name}</p>
                  <span className={cn('inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase', getTypeBadge(update.type))}>
                    {update.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{getActionText(update.action)}</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                <Clock className="size-3" /> {update.timestamp}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
