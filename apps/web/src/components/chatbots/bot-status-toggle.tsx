import { cn } from '@/lib/utils'

type BotStatus = 'draft' | 'active' | 'paused' | 'archived'

const statuses: { value: BotStatus; label: string; className: string }[] = [
  { value: 'draft', label: 'Draft', className: 'bg-muted text-muted-foreground' },
  { value: 'active', label: 'Active', className: 'bg-emerald-500/10 text-emerald-600' },
  { value: 'paused', label: 'Paused', className: 'bg-amber-500/10 text-amber-600' },
  { value: 'archived', label: 'Archived', className: 'bg-muted text-muted-foreground opacity-60' },
]

interface BotStatusToggleProps {
  value: BotStatus
  onChange: (status: BotStatus) => void
  disabled?: boolean
}

export function BotStatusToggle({ value, onChange, disabled }: BotStatusToggleProps) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {statuses.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange(s.value)}
          disabled={disabled}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === s.value
              ? s.className
              : 'text-muted-foreground hover:text-foreground',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

export type { BotStatus }
