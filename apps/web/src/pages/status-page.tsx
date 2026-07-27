import { useQuery } from '@tanstack/react-query'
import { Navbar, Footer } from '@/components/landing'
import { ScrollReveal } from '@/components/landing/scroll-reveal'
import { SectionHeading } from '@/components/landing/section-heading'
import { FloatingOrbs } from '@/components/landing/floating-orbs'
import { cn } from '@/lib/utils'
import { publicApi } from '@/lib/api'
import { CheckCircle, AlertCircle, Clock } from 'lucide-react'

type Status = 'operational' | 'degraded' | 'outage'

interface Service {
  name: string
  status: Status
  description: string
}

interface StatusResponse {
  overall: Status
  services: Service[]
  uptime: number
}

const statusConfig = {
  operational: { icon: CheckCircle, label: 'Operational', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  degraded: { icon: AlertCircle, label: 'Degraded', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  outage: { icon: AlertCircle, label: 'Outage', color: 'text-red-500', bg: 'bg-red-500/10' },
}

function StatusDot({ status }: { status: Status }) {
  const colors = { operational: 'bg-emerald-500', degraded: 'bg-amber-500', outage: 'bg-red-500' }
  return (
    <span className={cn('relative flex size-2.5', status === 'operational' && 'animate-none')}>
      <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-75', colors[status])} />
      <span className={cn('relative inline-flex size-2.5 rounded-full', colors[status])} />
    </span>
  )
}

function formatUptime(seconds: number) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${Math.floor((seconds % 3600) / 60)}m`
  return `${Math.floor(seconds / 60)}m`
}

export default function StatusPage() {
  const { data, isLoading, isError } = useQuery<StatusResponse>({
    queryKey: ['public-status'],
    queryFn: async () => (await publicApi.get('/public/status')).data,
    refetchInterval: 60_000,
  })

  const overall = data?.overall ?? 'operational'
  const services = data?.services ?? []
  const operationalCount = services.filter(s => s.status === 'operational').length

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14">
        <section className="relative overflow-hidden">
          <FloatingOrbs />
          <div className="relative mx-auto max-w-[840px] px-5 md:px-10 pt-20 pb-4 md:pt-28 md:pb-8">
            <ScrollReveal variant="fadeUp">
              <SectionHeading
                eyebrow="System Status"
                title={isLoading ? 'Checking...' : isError ? 'Unable to fetch status' : `${overall === 'operational' ? 'All Systems Operational' : overall === 'degraded' ? 'Degraded Performance' : 'Service Outage Detected'}`}
                description={data ? `${operationalCount} of ${services.length} services running normally · uptime ${formatUptime(data.uptime)}` : undefined}
              />
            </ScrollReveal>
          </div>
        </section>

        <section className="relative pb-20 md:pb-28">
          <div className="mx-auto max-w-[640px] px-5 md:px-10">
            {isLoading ? (
              <div className="space-y-3">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="h-[60px] animate-pulse rounded-xl bg-card border border-border" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {services.map((service, i) => {
                  const cfg = statusConfig[service.status]
                  const Icon = cfg.icon
                  return (
                    <ScrollReveal key={service.name} variant="fadeUp" delay={i * 0.03}>
                      <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className={cn('size-4 shrink-0', cfg.color)} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{service.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{service.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-3">
                          <StatusDot status={service.status} />
                          <span className={cn('text-xs font-medium', cfg.color)}>{cfg.label}</span>
                        </div>
                      </div>
                    </ScrollReveal>
                  )
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
