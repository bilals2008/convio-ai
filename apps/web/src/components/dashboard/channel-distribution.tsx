import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const channelData = [
  { name: 'Web', value: 145, color: 'hsl(217, 91%, 60%)' },
  { name: 'WhatsApp', value: 98, color: 'hsl(142, 71%, 45%)' },
  { name: 'Discord', value: 67, color: 'hsl(263, 70%, 58%)' },
  { name: 'Slack', value: 45, color: 'hsl(38, 92%, 50%)' },
  { name: 'Telegram', value: 32, color: 'hsl(199, 89%, 48%)' },
]

const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
      {payload?.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="size-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export function ChannelDistribution() {
  return (
    <Card>
      <CardHeader className="border-b py-4">
        <CardTitle className="text-base">Channel Distribution</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
