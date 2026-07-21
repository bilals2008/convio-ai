import { Download, DollarSign, Clock, Receipt, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { KPICard } from '@/components/dashboard/stats-card'

export default function BillingPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Billing & Invoices"
        description="Manage your payments, invoices and subscription."
        action={
          <Button
            variant="outline"
            onClick={() => toast.info('Statement download coming soon')}
          >
            <Download className="size-3.5" />
            Download Statement
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          icon={DollarSign}
          label="Total Revenue"
          value="$12,450"
          iconClassName="bg-emerald-500/10 text-emerald-500"
          trend="up"
          change="+12%"
          period="vs last month"
        />
        <KPICard
          icon={Clock}
          label="Outstanding"
          value="$1,240"
          iconClassName="bg-amber-500/10 text-amber-500"
          trend="up"
          change="+8%"
          period="vs last month"
        />
        <KPICard
          icon={Receipt}
          label="Paid Invoices"
          value={62}
          iconClassName="bg-blue-500/10 text-blue-500"
        />
        <KPICard
          icon={Calendar}
          label="Next Billing"
          value="Aug 12"
          iconClassName="bg-violet-500/10 text-violet-500"
        />
      </div>
    </div>
  )
}
