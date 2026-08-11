import type { ReactNode } from 'react'

interface SectionCardProps {
  icon?: ReactNode
  title: string
  description?: string
  children: ReactNode
}

export function SectionCard({ icon, title, description, children }: SectionCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {icon && (
          <span className="flex size-6 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground/80">{description}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}
