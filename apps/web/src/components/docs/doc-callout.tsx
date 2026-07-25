import { type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

const calloutVariants = cva(
  'rounded-lg border p-4 my-8',
  {
    variants: {
      variant: {
        info: 'border-info/20 bg-info/5',
        success: 'border-success/20 bg-success/5',
        warning: 'border-warning/20 bg-warning/5',
        destructive: 'border-destructive/20 bg-destructive/5',
        tip: 'border-primary/20 bg-primary/5',
      },
    },
    defaultVariants: {
      variant: 'tip',
    },
  }
)

const calloutIconVariants = cva(
  'flex size-8 shrink-0 items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        info: 'bg-info/10 text-info',
        success: 'bg-success/10 text-success',
        warning: 'bg-warning/10 text-warning',
        destructive: 'bg-destructive/10 text-destructive',
        tip: 'bg-primary/10 text-primary',
      },
    },
    defaultVariants: {
      variant: 'tip',
    },
  }
)

interface DocCalloutProps extends VariantProps<typeof calloutVariants> {
  icon?: LucideIcon | React.ComponentType<{ className?: string }>
  title: string
  children: ReactNode
  className?: string
}

export function DocCallout({ variant = 'tip', icon: Icon, title, children, className }: DocCalloutProps) {
  return (
    <div className={cn(calloutVariants({ variant }), className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <div className={calloutIconVariants({ variant })}>
            <Icon className="size-4" />
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
