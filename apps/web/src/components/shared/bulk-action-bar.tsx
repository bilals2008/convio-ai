import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BulkActionBarProps {
  onExitSelectionMode: () => void
  action: React.ReactNode
  className?: string
}

export function BulkActionBar({
  onExitSelectionMode,
  action,
  className,
}: BulkActionBarProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button variant="outline" size="sm" onClick={onExitSelectionMode}>
        <X className="size-4" />
        Cancel
      </Button>
      {action}
    </div>
  )
}
