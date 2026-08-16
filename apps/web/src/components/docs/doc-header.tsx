import { Link } from 'react-router-dom'
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

interface DocPageHeaderProps {
  breadcrumb: { label: string; href?: string }[]
  title: string
  description?: string
  className?: string
}

export function DocPageHeader({ breadcrumb, title, description, className }: DocPageHeaderProps) {
  return (
    <div className={className}>
      <DocBreadcrumb items={breadcrumb} className="mb-0" />
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
