import { useState, useMemo } from 'react'
import { Zap, ArrowDownRight, ArrowUpRight, Clock, DollarSign } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/admin/page-header'
import { KpiCard } from '@/components/admin/kpi-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, type ChartConfig } from '@/components/ui/chart'
import { ChartTooltipContent } from '@/components/application/charts/charts-base'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { ProviderLogo } from '@/components/agents/provider-logos'
import { useAdminAnalytics, useAdminAgents } from '@/admin/hooks/use-admin'

const RANGES = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
] as const

// ponytail: cost rates are rough estimates. Replace when backend exposes real per-model pricing.
const COST_RATES = { inputPerM: 2.5, outputPerM: 10 }

const GREEN = 'hsl(142, 71%, 45%)'
const BLUE = 'hsl(217, 91%, 60%)'

const tokenConfig = {
  input: { label: 'Input Tokens', color: BLUE },
  output: { label: 'Output Tokens', color: GREEN },
} satisfies ChartConfig

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`
}

function axisDate(v: string | number) {
  return new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getModelGroup(model: string): { name: string; provider: string } {
  const m = model.toLowerCase()

  // OpenRouter / nested format: provider/model-name
  const slashParts = m.split('/')
  const baseName = slashParts[slashParts.length - 1] ?? m

  if (baseName.includes('gpt-4o-mini') || baseName.includes('gpt-4o-mini')) return { name: 'GPT-4o Mini', provider: 'openai' }
  if (baseName.includes('gpt-4o') || baseName.includes('gpt-4 turbo')) return { name: 'GPT-4o', provider: 'openai' }
  if (baseName.includes('claude') && baseName.includes('haiku')) return { name: 'Claude Haiku', provider: 'anthropic' }
  if (baseName.includes('claude')) return { name: 'Claude', provider: 'anthropic' }
  if (baseName.includes('gemini') && baseName.includes('flash')) return { name: 'Gemini Flash', provider: 'google' }
  if (baseName.includes('gemini')) return { name: 'Gemini', provider: 'google' }
  if (baseName.includes('llama') || baseName.includes('mistral') || baseName.includes('mixtral')) return { name: 'Llama / Mistral', provider: 'other' }
  if (baseName.includes('deepseek')) return { name: 'DeepSeek', provider: 'other' }
  if (m.includes('/')) return { name: baseName.slice(0, 30), provider: 'openrouter' }
  return { name: m, provider: 'other' }
}

export default function AdminApiUsagePage() {
  const [range, setRange] = useState(30)
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics(range)
  const { data: agents, isLoading: agentsLoading } = useAdminAgents({ limit: 100 })

  const tokenData = useMemo(
    () =>
      (analytics?.dailyBreakdown ?? []).map((d) => ({
        date: d.date,
        input: d.inputTokens ?? 0,
        output: d.outputTokens ?? 0,
        responseTime: d.avgResponseTime ?? 0,
      })),
    [analytics],
  )

  const modelMap = useMemo(() => {
    const map = new Map<string, { tokens: number; agents: number; provider: string }>()
    for (const a of agents?.data ?? []) {
      const g = getModelGroup(a.model)
      const key = g.name
      const prev = map.get(key) ?? { tokens: 0, agents: 0, provider: g.provider }
      map.set(key, { tokens: prev.tokens + (a.conversationCount ?? 0), agents: prev.agents + 1, provider: g.provider })
    }
    return [...map.entries()].sort((a, b) => b[1].tokens - a[1].tokens)
  }, [agents])

  const totalInput = tokenData.reduce((s, d) => s + d.input, 0)
  const totalOutput = tokenData.reduce((s, d) => s + d.output, 0)
  const totalTokens = totalInput + totalOutput
  const avgResponseTime = tokenData.length
    ? Math.round(tokenData.reduce((s, d) => s + d.responseTime, 0) / tokenData.length)
    : 0
  const estimatedCost = ((totalInput / 1_000_000) * COST_RATES.inputPerM) + ((totalOutput / 1_000_000) * COST_RATES.outputPerM)

  if (analyticsLoading || agentsLoading) {
    return (
      <PageContainer>
        <PageHeader title="API Usage" description="Token consumption, model distribution & cost estimates." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 mb-6">
          <Skeleton className="h-[360px] rounded-xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[200px] rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <PageHeader title="API Usage" description="Token consumption, model distribution & cost estimates." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-6">
        <KpiCard icon={Zap} label="Total Tokens" value={fmt(totalTokens)} trend="flat" loading={analyticsLoading} />
        <KpiCard icon={ArrowDownRight} label="Input Tokens" value={fmt(totalInput)} change={`${totalTokens ? Math.round((totalInput / totalTokens) * 100) : 0}%`} trend="flat" loading={analyticsLoading} color="bg-blue-500/10 text-blue-500" />
        <KpiCard icon={ArrowUpRight} label="Output Tokens" value={fmt(totalOutput)} change={`${totalTokens ? Math.round((totalOutput / totalTokens) * 100) : 0}%`} trend="flat" loading={analyticsLoading} color="bg-emerald-500/10 text-emerald-500" />
        <KpiCard icon={Clock} label="Avg Response" value={avgResponseTime ? `${avgResponseTime}ms` : '—'} trend="flat" loading={analyticsLoading} color="bg-amber-500/10 text-amber-500" />
        <KpiCard icon={DollarSign} label="Est. Cost" value={fmtMoney(estimatedCost)} period="this period" trend="flat" loading={analyticsLoading} color="bg-violet-500/10 text-violet-500" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <Card className="lg:col-span-3">
          <CardHeader className="flex items-center justify-between gap-3 border-b py-4">
            <CardTitle className="text-base">Token Usage Over Time</CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: BLUE }} />
                  Input
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ backgroundColor: GREEN }} />
                  Output
                </span>
              </div>
              <div className="flex rounded-lg bg-muted p-0.5">
                {RANGES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRange(r.value)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      range === r.value
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            {tokenData.length === 0 ? (
              <p className="py-16 text-center text-sm text-muted-foreground">No token data for this period.</p>
            ) : (
              <ChartContainer config={tokenConfig} className="h-[300px] w-full">
                <LineChart data={tokenData} margin={{ top: 6, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    minTickGap={40}
                    tickFormatter={axisDate}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => fmt(v)}
                    width={48}
                  />
                  <ChartTooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={
                      <ChartTooltipContent
                        labelFormatter={axisDate}
                        indicator="dot"
                        className="fill-card"
                      />
                    }
                  />
                  <Line dataKey="input" type="monotone" stroke="var(--color-input)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line dataKey="output" type="monotone" stroke="var(--color-output)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">Top Models</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {modelMap.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No agent data yet.</p>
            ) : (
              <div className="space-y-4">
                {modelMap.slice(0, 6).map(([name, data]) => {
                  const maxTokens = modelMap[0]?.[1].tokens ?? 1
                  const pct = Math.max((data.tokens / maxTokens) * 100, 4)
                  return (
                    <div key={name} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-card border border-border">
                            <ProviderLogo provider={data.provider} className="size-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{name}</p>
                            <p className="text-[11px] text-muted-foreground">{data.agents} agent{data.agents !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-foreground">{fmt(data.tokens)}</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">Token Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Input', value: fmt(totalInput), cost: (totalInput / 1_000_000) * COST_RATES.inputPerM },
                { label: 'Output', value: fmt(totalOutput), cost: (totalOutput / 1_000_000) * COST_RATES.outputPerM },
              ].map(({ label, value, cost }) => (
                <div key={label} className="rounded-lg border border-border/60 bg-card px-3 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="mt-0.5 text-xl font-semibold text-foreground">{value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Est. {fmtMoney(cost)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-border/60 bg-card px-3 py-2.5">
              <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">Estimated Total</p>
              <p className="mt-0.5 text-xl font-semibold text-foreground">{fmtMoney(estimatedCost)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Costs estimated at {fmtMoney(COST_RATES.inputPerM)}/M input, {fmtMoney(COST_RATES.outputPerM)}/M output.
      </p>
    </PageContainer>
  )
}
