import { DollarSign, TrendingUp, Scale, Users, UserPlus, UserX, ShoppingBag, Percent } from 'lucide-react'
import { StatsCard } from '@/components/dashboard/stats-card'
import { type AdminRevenue } from '@/admin/services/admin-api'
import { formatCurrencyCompact, formatCount } from './format'

interface RevenueKpisProps {
  data: AdminRevenue | undefined
  loading?: boolean
}

function changeClass(value: number, invert = false): string {
  const good = invert ? value <= 0 : value >= 0
  return good ? 'text-emerald-500' : 'text-red-500'
}

export function RevenueKpis({ data, loading }: RevenueKpisProps) {
  const s = data?.summary

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          icon={DollarSign}
          label="Total Revenue"
          value={loading ? '—' : formatCurrencyCompact(s?.totalRevenue ?? 0)}
          description={loading ? undefined : `${s?.revenueChange ?? 0}% vs prev period`}
          descriptionClassName={changeClass(s?.revenueChange ?? 0)}
          iconClassName="bg-emerald-500/10 text-emerald-500"
        />
        <StatsCard
          icon={TrendingUp}
          label="Monthly Recurring Revenue"
          value={loading ? '—' : formatCurrencyCompact(s?.mrr ?? 0)}
          description={loading ? undefined : `${s?.mrrChange ?? 0}% vs period start`}
          descriptionClassName={changeClass(s?.mrrChange ?? 0)}
          iconClassName="bg-blue-500/10 text-blue-500"
        />
        <StatsCard
          icon={Scale}
          label="Net Profit"
          value={loading ? '—' : formatCurrencyCompact(s?.netProfit ?? 0)}
          description={loading ? undefined : `Loss: ${formatCurrencyCompact(s?.totalLoss ?? 0)}`}
          descriptionClassName="text-muted-foreground"
          iconClassName="bg-violet-500/10 text-violet-500"
        />
        <StatsCard
          icon={Percent}
          label="Churn Rate"
          value={loading ? '—' : `${s?.churnRate ?? 0}%`}
          description={loading ? undefined : `${s?.churnedSubscriptions ?? 0} churned this period`}
          descriptionClassName={changeClass((s?.churnRate ?? 0) * -1)}
          iconClassName="bg-rose-500/10 text-rose-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard
          icon={Users}
          label="Active Subscriptions"
          value={loading ? '—' : formatCount(s?.activeSubscriptions ?? 0)}
          iconClassName="bg-emerald-500/10 text-emerald-500"
        />
        <StatsCard
          icon={UserPlus}
          label="New Subscriptions"
          value={loading ? '—' : formatCount(s?.newSubscriptions ?? 0)}
          description={loading ? undefined : 'this period'}
          iconClassName="bg-blue-500/10 text-blue-500"
        />
        <StatsCard
          icon={UserX}
          label="Churned Subscriptions"
          value={loading ? '—' : formatCount(s?.churnedSubscriptions ?? 0)}
          description={loading ? undefined : 'this period'}
          iconClassName="bg-rose-500/10 text-rose-500"
        />
        <StatsCard
          icon={ShoppingBag}
          label="Avg Order Value"
          value={loading ? '—' : formatCurrencyCompact(s?.avgOrderValue ?? 0)}
          iconClassName="bg-amber-500/10 text-amber-500"
        />
      </div>
    </>
  )
}
