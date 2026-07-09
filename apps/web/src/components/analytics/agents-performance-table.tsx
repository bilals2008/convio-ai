import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Activity } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

interface AgentPerformance {
  id: string
  name: string
  conversations: number
  messages: number
  avgResponseTime: number
  satisfactionScore?: number
}

interface AgentsPerformanceTableProps {
  agents: AgentPerformance[]
  loading?: boolean
}

export function AgentsPerformanceTable({ agents, loading }: AgentsPerformanceTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="size-4" />
          Agent Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : agents.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No agent data available</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-right">Conversations</TableHead>
                <TableHead className="text-right">Messages</TableHead>
                <TableHead className="text-right">Avg Response</TableHead>
                <TableHead className="text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell className="text-right">{agent.conversations.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{agent.messages.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{agent.avgResponseTime.toFixed(1)}s</TableCell>
                  <TableCell className="text-right">
                    {agent.satisfactionScore != null ? (
                      <Badge variant="secondary" className="text-xs">
                        {agent.satisfactionScore.toFixed(1)}
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
