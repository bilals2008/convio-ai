import { Pie, PieChart, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart"
import { ChartTooltipContent, ChartLegendContent } from "@/components/application/charts/charts-base"
import { Skeleton } from "@/components/ui/skeleton"
import { mockChannelData } from "@/lib/mock-chart-data"

type Channel = "web" | "whatsapp" | "slack" | "discord" | "telegram" | "api"

const channelNames: Record<Channel, string> = {
  web: "Web Widget",
  whatsapp: "WhatsApp",
  slack: "Slack",
  discord: "Discord",
  telegram: "Telegram",
  api: "API",
}

const channelHslColors: Record<Channel, string> = {
  web: "hsl(136, 76%, 45%)",
  whatsapp: "hsl(142, 71%, 45%)",
  slack: "hsl(217, 91%, 60%)",
  discord: "hsl(270, 65%, 60%)",
  telegram: "hsl(38, 92%, 50%)",
  api: "hsl(36, 20%, 55%)",
}

const chartConfig = {
  web: { label: "Web Widget", color: "var(--chart-1)" },
  whatsapp: { label: "WhatsApp", color: "var(--chart-2)" },
  slack: { label: "Slack", color: "var(--chart-3)" },
  discord: { label: "Discord", color: "var(--chart-4)" },
  telegram: { label: "Telegram", color: "var(--chart-5)" },
  api: { label: "API", color: "hsl(36, 20%, 55%)" },
} satisfies ChartConfig

interface ChannelData {
  channel: Channel
  count: number
}

interface ChannelDistributionProps {
  data: ChannelData[]
  loading?: boolean
}

export function ChannelDistribution({ data, loading }: ChannelDistributionProps) {
  const chartData = data.length >= 3 && data.some((d) => d.count > 0) ? data : mockChannelData
  const total = chartData.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-base">Conversations by Channel</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <Skeleton className="h-[280px] w-full" />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <ChartContainer config={chartConfig} className="h-[220px] w-full max-w-[280px]">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="channel"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={channelHslColors[entry.channel] || "hsl(36, 20%, 55%)"}
                      stroke="hsl(36, 15%, 4%)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      className="fill-card"
                      indicator="dot"
                      formatter={(value, name) => [
                        `${Number(value).toLocaleString()} conversations`,
                        channelNames[name as Channel] || name,
                      ]}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 w-full">
              {chartData.map((d) => (
                <div key={d.channel} className="flex items-center gap-2 text-xs">
                  <div
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: channelHslColors[d.channel] }}
                  />
                  <span className="text-muted-foreground truncate">
                    {channelNames[d.channel] || d.channel}
                  </span>
                  <span className="ml-auto font-medium text-foreground">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
