import { Link } from 'react-router-dom'
import { ArrowRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocFeatureCardProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  title: string
  description: string
  href: string
  className?: string
}

export function DocFeatureCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  href,
  className,
}: DocFeatureCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        'group relative flex flex-col rounded-lg border border-border/60 bg-card p-3 sm:p-4 transition-all duration-200',
        'hover:border-border hover:bg-accent/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <div className={cn('flex size-7 sm:size-8 items-center justify-center rounded-md mb-2 sm:mb-3', iconBg)}>
        <Icon className={cn('size-3.5 sm:size-4', iconColor)} />
      </div>
      <h3 className="font-heading font-semibold text-foreground text-[12px] sm:text-[13px] leading-tight mb-0.5 sm:mb-1">{title}</h3>
      <p className="text-muted-foreground text-[11px] sm:text-[12px] leading-[1.4] sm:leading-[1.5] line-clamp-2">{description}</p>
    </Link>
  )
}

interface DocNextStepCardProps {
  icon: LucideIcon | React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  title: string
  href: string
  className?: string
}

export function DocNextStepCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  href,
  className,
}: DocNextStepCardProps) {
  return (
    <Link
      to={href}
      className={cn(
        'group relative flex items-center gap-2.5 sm:gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5 sm:px-4 sm:py-3 transition-all duration-200',
        'hover:border-border hover:bg-accent/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <div className={cn('flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-md', iconBg)}>
        <Icon className={cn('size-3.5 sm:size-4', iconColor)} />
      </div>
      <h3 className="font-heading font-semibold text-foreground text-[12px] sm:text-[13px] leading-tight flex-1 min-w-0">{title}</h3>
      <ArrowRight className="size-3 sm:size-3.5 shrink-0 text-muted-foreground/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground/60" />
    </Link>
  )
}

interface DocCardGridProps {
  children: React.ReactNode
  columns?: 2 | 3
  className?: string
}

export function DocCardGrid({ children, columns = 3, className }: DocCardGridProps) {
  return (
    <div className={cn(
      'grid gap-2',
      columns === 2 && 'grid-cols-2',
      columns === 3 && 'grid-cols-2 lg:grid-cols-3',
      className
    )}>
      {children}
    </div>
  )
}
