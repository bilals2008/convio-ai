import { Link } from 'react-router-dom'
import { ArrowRight, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ActivityItem } from './activity-item'
import { Skeleton } from '@/components/ui/skeleton'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'

interface ActivityEntry {
  id: string
  userName?: string
  botName: string
  channel: Channel
  action: string
  timestamp: string
}

interface RecentActivityProps {
  activities: ActivityEntry[]
  loading?: boolean
}

export function RecentActivity({ activities, loading }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="size-4" />
          Recent Activity
        </CardTitle>
        <Link to="/conversations" className="flex items-center gap-1 text-xs text-primary hover:underline">
          View all
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <div>
            {activities.slice(0, 10).map((activity) => (
              <ActivityItem key={activity.id} {...activity} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
