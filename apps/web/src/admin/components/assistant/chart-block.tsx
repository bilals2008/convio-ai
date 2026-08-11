import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import type { AdminChartSpec } from '@/admin/services/admin-api'

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

function toKey(name: string): string {
  return name.replace(/[^a-z0-9]/gi, '_') || 'series'
}

export function ChartBlock({ spec }: { spec: AdminChartSpec }) {
  if (spec.type === 'pie') {
    const items = spec.items ?? []
    return (
      <div className="w-full rounded-lg border border-border/60 bg-card p-2.5">
        <p className="mb-1 text-xs font-medium text-foreground">{spec.title}</p>
        <ChartContainer config={{}} className="h-[170px] w-full">
          <PieChart>
            <Pie
              data={items}
              dataKey="value"
              nameKey="name"
              innerRadius={42}
              outerRadius={70}
              paddingAngle={2}
              strokeWidth={0}
            >
              {items.map((item, i) => (
                <Cell key={item.name} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip />
          </PieChart>
        </ChartContainer>
      </div>
    )
  }

  const series = spec.series ?? []
  const rows = (spec.labels ?? []).map((label, i) => {
    const row: Record<string, string | number> = { label }
    for (const s of series) row[toKey(s.name)] = s.values[i] ?? 0
    return row
  })
  const config: ChartConfig = Object.fromEntries(
    series.map((s, i) => [toKey(s.name), { label: s.name, color: COLORS[i % COLORS.length] }]),
  )

  return (
    <div className="w-full rounded-lg border border-border/60 bg-card p-2.5">
      <p className="mb-1 text-xs font-medium text-foreground">{spec.title}</p>
      <ChartContainer config={config} className="h-[170px] w-full">
        <BarChart data={rows}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={6} fontSize={10} />
          <YAxis tickLine={false} axisLine={false} tickMargin={6} fontSize={10} width={32} />
          <ChartTooltip />
          {series.map((s, i) => (
            <Bar
              key={s.name}
              dataKey={toKey(s.name)}
              fill={COLORS[i % COLORS.length]}
              radius={[3, 3, 0, 0]}
            />
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  )
}