import { useUsage } from '@/lib/hooks/use-billing'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Bot, Radio } from 'lucide-react'
import { CollapsibleSection } from '@/components/agents/collapsible-section'

const PALETTE = ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#14b8a6', '#64748b']

function MiniDonut({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <div className="relative size-[110px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={34} outerRadius={52} paddingAngle={2} strokeWidth={0}>
            {data.map((d, i) => (
              <Cell key={d.name} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString()} msgs`, '']}
            contentStyle={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontSize: '12px',
              padding: '6px 10px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold tabular-nums text-foreground">{total.toLocaleString()}</span>
      </div>
    </div>
  )
}

function BreakdownList({ items, total }: { items: { name: string; value: number }[]; total: number }) {
  return (
    <ul className="min-w-0 flex-1 space-y-2">
      {items.map((item, i) => (
        <li key={item.name} className="flex items-center gap-2 text-sm">
          <span className="size-2 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
          <span className="truncate text-foreground/80">{item.name}</span>
          <span className="ml-auto tabular-nums text-muted-foreground">
            {item.value.toLocaleString()}
            <span className="ml-1 text-xs text-muted-foreground/70">
              {total > 0 ? `${Math.round((item.value / total) * 100)}%` : ''}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export function UsageBreakdownCard() {
  const { data: usage } = useUsage()

  if (!usage) return null

  const agentData = usage.byAgent.map((a) => ({ name: a.name, value: a.messages }))
  const channelData = usage.byChannel.map((c) => ({ name: c.channel, value: c.messages }))
  const agentTotal = agentData.reduce((s, d) => s + d.value, 0)
  const channelTotal = channelData.reduce((s, d) => s + d.value, 0)

  return (
    <div className="space-y-4">
      <CollapsibleSection
        title="By Agent"
        icon={<Bot className="size-3 text-primary" />}
        badge={
          agentTotal > 0 ? (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {agentTotal.toLocaleString()}
            </span>
          ) : undefined
        }
      >
        {agentData.length === 0 ? (
          <p className="text-xs text-muted-foreground">No messages yet.</p>
        ) : (
          <div className="flex items-center gap-4">
            <MiniDonut data={agentData.slice(0, 5)} />
            <BreakdownList items={agentData.slice(0, 5)} total={agentTotal} />
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title="By Channel"
        icon={<Radio className="size-3 text-primary" />}
        badge={
          channelTotal > 0 ? (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              {channelTotal.toLocaleString()}
            </span>
          ) : undefined
        }
      >
        {channelData.length === 0 ? (
          <p className="text-xs text-muted-foreground">No messages yet.</p>
        ) : (
          <div className="flex items-center gap-4">
            <MiniDonut data={channelData.slice(0, 5)} />
            <BreakdownList items={channelData.slice(0, 5)} total={channelTotal} />
          </div>
        )}
      </CollapsibleSection>
    </div>
  )
}
