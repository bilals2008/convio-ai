import { CheckSquare, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectionCheckboxProps {
  isSelected: boolean
  onToggle: () => void
  className?: string
}

export function SelectionCheckbox({ isSelected, onToggle, className }: SelectionCheckboxProps) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle() }}
      className={cn('mt-0.5 shrink-0', className)}
      aria-label={isSelected ? 'Deselect' : 'Select'}
    >
      {isSelected ? (
        <CheckSquare className="size-5 text-primary" />
      ) : (
        <Square className="size-5 text-muted-foreground/50" />
      )}
    </button>
  )
}
