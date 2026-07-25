import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocPromoCardProps {
  className?: string
}

const features = [
  'Unlimited agents',
  'Custom knowledge bases',
  'Priority support',
  'Advanced analytics',
]

export function DocPromoCard({ className }: DocPromoCardProps) {
  return (
    <div className={cn(
      'rounded-lg border border-border/60 bg-card overflow-hidden',
      className
    )}>
      <div className="p-3.5">
        {/* Header with badge on right */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-heading font-semibold text-foreground text-[13px] leading-tight">
            Convio Pro
          </h3>
          <span className="inline-flex items-center rounded border border-primary/30 bg-primary/10 px-1.5 py-px text-[9px] font-medium text-primary leading-tight">
            New
          </span>
        </div>

        <p className="text-muted-foreground text-[11px] leading-[1.4] mb-3">
          Unlock the full power of AI agents for your team.
        </p>

        {/* Feature checklist */}
        <ul className="space-y-1.5 mb-3.5">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Check className="size-3 text-primary shrink-0" />
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          to="/settings/billing"
          className="group flex items-center justify-center gap-1.5 w-full rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Upgrade to Pro
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
