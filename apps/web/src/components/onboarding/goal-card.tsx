import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface GoalCardProps {
  icon: LucideIcon
  title: string
  description: string
  selected: boolean
  onSelect: () => void
}

export function GoalCard({ icon: Icon, title, description, selected, onSelect }: GoalCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200',
        selected
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border/60 bg-card hover:border-border hover:shadow-sm',
      )}
    >
      <div className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-lg',
        selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
      )}>
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
      </div>
    </button>
  )
}
