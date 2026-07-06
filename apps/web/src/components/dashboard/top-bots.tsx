import { Link } from 'react-router-dom'
import { ArrowRight, Bot } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface TopBot {
  id: string
  name: string
  conversationCount: number
}

interface TopBotsProps {
  bots: TopBot[]
  loading?: boolean
}

export function TopBots({ bots, loading }: TopBotsProps) {
  const maxCount = bots.length > 0 ? Math.max(...bots.map((b) => b.conversationCount)) : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="size-4" />
          Top Performing Bots
        </CardTitle>
        <Link to="/chatbots" className="flex items-center gap-1 text-xs text-primary hover:underline">
          View all
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : bots.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No bots yet</p>
        ) : (
          <div className="space-y-3">
            {bots.slice(0, 5).map((bot) => (
              <div key={bot.id} className="flex items-center gap-3 py-1">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <Bot className="size-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{bot.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {bot.conversationCount.toLocaleString()} convs
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${maxCount > 0 ? (bot.conversationCount / maxCount) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
