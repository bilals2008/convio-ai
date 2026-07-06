import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Bot } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface BotPerformance {
  id: string
  name: string
  conversations: number
  messages: number
  avgResponseTime: number
  satisfactionScore?: number
}

interface BotsPerformanceTableProps {
  bots: BotPerformance[]
  loading?: boolean
}

export function BotsPerformanceTable({ bots, loading }: BotsPerformanceTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="size-4" />
          Bot Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : bots.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No bot data available</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bot</TableHead>
                <TableHead className="text-right">Conversations</TableHead>
                <TableHead className="text-right">Messages</TableHead>
                <TableHead className="text-right">Avg Response</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bots.map((bot) => (
                <TableRow key={bot.id}>
                  <TableCell className="font-medium">{bot.name}</TableCell>
                  <TableCell className="text-right">{bot.conversations.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{bot.messages.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{bot.avgResponseTime.toFixed(1)}s</TableCell>
                  <TableCell className="text-right">
                    {bot.satisfactionScore != null ? (
                      <Badge variant="secondary" className="text-xs">
                        {bot.satisfactionScore.toFixed(1)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
