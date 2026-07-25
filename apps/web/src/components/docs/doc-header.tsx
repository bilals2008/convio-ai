import { Link } from 'react-router-dom'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocBreadcrumbProps {
  items: { label: string; href?: string }[]
  className?: string
}

export function DocBreadcrumb({ items, className }: DocBreadcrumbProps) {
  return (
    <nav className={cn('flex items-center gap-1.5 text-[12px] text-muted-foreground/60 mb-6 sm:mb-8', className)}>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-muted-foreground/30">/</span>}
          {item.href ? (
            <Link to={item.href} className="hover:text-foreground/80 transition-colors">{item.label}</Link>
          ) : (
            <span className="text-foreground/70 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

interface DocFeedbackProps {
  className?: string
}

export function DocFeedback({ className }: DocFeedbackProps) {
  return (
    <div className={cn('flex items-center gap-1.5 text-[11px] text-muted-foreground/50', className)}>
      <span>Was this helpful?</span>
      <button className="p-1 rounded-md hover:bg-accent hover:text-foreground/70 transition-colors" aria-label="Yes">
        <ThumbsUp className="size-3" />
      </button>
      <button className="p-1 rounded-md hover:bg-accent hover:text-foreground/70 transition-colors" aria-label="No">
        <ThumbsDown className="size-3" />
      </button>
    </div>
  )
}

interface DocPageHeaderProps {
  breadcrumb: { label: string; href?: string }[]
  title: string
  description?: string
  className?: string
}

export function DocPageHeader({ breadcrumb, title, description, className }: DocPageHeaderProps) {
  return (
    <div className={className}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
        <DocBreadcrumb items={breadcrumb} className="mb-0" />
        <DocFeedback />
      </div>
      <h1 className="font-heading text-2xl sm:text-[28px] font-semibold tracking-[-0.02em] leading-tight mb-2">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground text-[13px] leading-[1.6] max-w-[560px]">
          {description}
        </p>
      )}
    </div>
  )
}
