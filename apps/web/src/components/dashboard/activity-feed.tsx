import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Bot, BookOpen, Rocket, Upload, Settings, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityEvent {
  id: string
  type: 'agent_created' | 'kb_updated' | 'deployed' | 'document_uploaded' | 'settings_changed'
  title: string
  description: string
  timestamp: string
}

const mockEvents: ActivityEvent[] = [
  { id: '1', type: 'agent_created', title: 'New agent created', description: 'Support Bot was added to your workspace.', timestamp: '5 min ago' },
  { id: '2', type: 'document_uploaded', title: 'Document uploaded', description: 'pricing-faq.pdf added to Knowledge Base.', timestamp: '32 min ago' },
  { id: '3', type: 'deployed', title: 'Widget deployed', description: 'Live chat widget published to production.', timestamp: '1 hour ago' },
  { id: '4', type: 'kb_updated', title: 'Knowledge base updated', description: '3 documents were re-indexed.', timestamp: '2 hours ago' },
  { id: '5', type: 'settings_changed', title: 'Settings updated', description: 'Provider key for OpenAI was rotated.', timestamp: '3 hours ago' },
  { id: '6', type: 'agent_created', title: 'Agent duplicated', description: 'Sales Agent cloned from Support Bot.', timestamp: '5 hours ago' },
]

function getEventIcon(type: ActivityEvent['type']) {
  switch (type) {
    case 'agent_created': return { icon: Bot, color: 'bg-primary/10 text-primary' }
    case 'kb_updated': return { icon: BookOpen, color: 'bg-emerald-500/10 text-emerald-500' }
    case 'deployed': return { icon: Rocket, color: 'bg-violet-500/10 text-violet-500' }
    case 'document_uploaded': return { icon: Upload, color: 'bg-blue-500/10 text-blue-500' }
    case 'settings_changed': return { icon: Settings, color: 'bg-amber-500/10 text-amber-500' }
    default: return { icon: Bot, color: 'bg-muted text-muted-foreground' }
  }
}

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between border-b py-4">
        <CardTitle className="text-base">Activity Feed</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative">
          <div className="absolute left-[29px] top-0 bottom-0 w-px bg-border" />
          <div className="divide-y divide-border">
            {mockEvents.map((event) => {
              const { icon: Icon, color } = getEventIcon(event.type)
              return (
                <div key={event.id} className="flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors relative">
                  <div className={cn('flex size-8 items-center justify-center rounded-full shrink-0 z-10', color)}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{event.description}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{event.timestamp}</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
