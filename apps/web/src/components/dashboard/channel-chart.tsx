import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent } from '@/components/application/charts/charts-base'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare } from 'lucide-react'

interface ChartDataPoint {
  date: string
  conversations: number
  messages: number
}

interface ChannelChartProps {
  data: ChartDataPoint[]
  loading?: boolean
}

const chartConfig = {
  conversations: {
    label: 'Conversations',
    color: 'hsl(142, 71%, 45%)',
  },
} satisfies ChartConfig

export function ChannelChart({ data, loading }: ChannelChartProps) {
  const chartData = data

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Daily Conversations</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[200px] w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 mb-3">
              <MessageSquare className="size-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground mt-1">Data will appear here once your agents start receiving conversations.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    }}
                    className="fill-card"
                  />
                }
              />
              <Bar dataKey="conversations" fill="var(--color-conversations)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
