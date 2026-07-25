import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface DocCalloutProps {
  icon?: LucideIcon
  title: string
  children: ReactNode
  className?: string
}

export function DocCallout({ icon: Icon, title, children, className }: DocCalloutProps) {
  return (
    <div className={cn(
      'rounded-lg border border-primary/20 bg-primary/5 p-4 my-8',
      className
    )}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Icon className="size-4 text-primary" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-heading font-semibold text-foreground text-[13px] leading-tight mb-1">{title}</h3>
          <div className="text-muted-foreground text-[12px] leading-[1.5]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
