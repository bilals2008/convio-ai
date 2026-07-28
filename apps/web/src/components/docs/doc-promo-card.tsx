import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocPromoCardProps {
  className?: string
}

const features = [
  '10 AI agents',
  '10 knowledge bases',
  '25,000 messages/mo',
  'Priority support',
]

export function DocPromoCard({ className }: DocPromoCardProps) {
  return (
    <div className={cn(
      'rounded-lg border border-border/60 bg-card overflow-hidden',
      className
    )}>
      <div className="p-3.5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-semibold text-foreground text-[13px] leading-tight">
            Try Pro Free
          </h3>
          <span className="inline-flex items-center rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-px text-[9px] font-medium text-emerald-500 leading-tight">
            14 days
          </span>
        </div>

        <p className="text-muted-foreground text-[11px] leading-[1.4] mb-3">
          Try all Pro features free for 14 days. No credit card needed.
        </p>

        <ul className="space-y-1.5 mb-3.5">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Check className="size-3 text-primary shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        <Link
          to="/signup?trial=pro"
          className="group flex items-center justify-center gap-1.5 w-full rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Start Free Trial
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
