import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  icon?: ReactNode
  title: string
  description: string
  children: ReactNode
  className?: string
}

export function SectionCard({ icon, title, description, children, className }: SectionCardProps) {
  return (
    <Card className="rounded-xl p-0">
      <CardContent className={cn('p-0', className)}>
        <div className="flex items-start gap-3 border-b border-border/60 px-6 py-5">
          {icon && (
            <div
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-muted/50 text-muted-foreground"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="px-6 py-6">{children}</div>
      </CardContent>
    </Card>
  )
}
