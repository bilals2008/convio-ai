import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent } from '@/components/application/charts/charts-base'
import {
  Line,
  LineChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

const axisDate = (v: string | number) =>
  new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const GREEN = 'hsl(142, 71%, 45%)'
export const BLUE = 'hsl(217, 91%, 60%)'
export const CYAN = 'hsl(199, 98%, 55%)'

export function ChartLegendItems({ items }: { items: Array<{ label: string; color: string }> }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  )
}

const activityConfig = {
  messages: { label: 'Messages', color: GREEN },
  conversations: { label: 'Conversations', color: BLUE },
  users: { label: 'Active Users', color: CYAN },
} satisfies ChartConfig

export interface ActivityPoint {
  date: string
  conversations: number
  messages: number
  users: number
}

export function ActivityChart({ data, loading, title = 'Activity' }: { data: ActivityPoint[]; loading?: boolean; title?: string }) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-3 border-b py-4">
        <CardTitle className="text-base">{title}</CardTitle>
        <ChartLegendItems
          items={[
            { label: 'Messages', color: GREEN },
            { label: 'Conversations', color: BLUE },
            { label: 'Active Users', color: CYAN },
          ]}
        />
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">No activity data yet.</p>
        ) : (
          <ChartContainer config={activityConfig} className="h-[300px] w-full">
            <LineChart data={data} margin={{ top: 6, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} minTickGap={40} tickFormatter={axisDate} />
              <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
              <ChartTooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<ChartTooltipContent labelFormatter={axisDate} indicator="dot" className="fill-card" />}
              />
              <Line dataKey="messages" type="monotone" stroke="var(--color-messages)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line dataKey="conversations" type="monotone" stroke="var(--color-conversations)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line dataKey="users" type="monotone" stroke="var(--color-users)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

const radarConfig = {
  count: { label: 'Conversations', color: GREEN },
} satisfies ChartConfig

export function ChannelRadarChart({ data, loading }: { data: Array<{ channel: string; count: number }>; loading?: boolean }) {
  const radarData = data.map((c) => ({
    channel: c.channel.charAt(0).toUpperCase() + c.channel.slice(1),
    count: c.count,
  }))

  return (
    <Card>
      <CardHeader className="border-b py-4">
        <CardTitle className="text-base">Channel Distribution</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[260px] w-full" />
        ) : radarData.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No channel data yet.</p>
        ) : (
          <ChartContainer config={radarConfig} className="mx-auto h-[260px] w-full max-w-[300px]">
            <RadarChart data={radarData} outerRadius="70%">
              <PolarGrid />
              <PolarAngleAxis dataKey="channel" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent indicator="dot" className="fill-card" />} />
              <Radar dataKey="count" stroke="var(--color-count)" fill="var(--color-count)" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
