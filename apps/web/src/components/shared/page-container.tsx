import { cn } from '@/lib/utils'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn('space-y-6 overflow-hidden', className)}>
      {children}
    </div>
  )
}

interface SectionProps {
  title?: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Section({ title, description, action, children, className }: SectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description || action) && (
        <div className="flex items-start justify-between">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
