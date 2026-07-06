import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DeleteButtonProps {
  onClick: () => void
  loading?: boolean
  label?: string
  className?: string
}

export function DeleteButton({ onClick, loading, label = 'Delete', className }: DeleteButtonProps) {
  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onClick}
      disabled={loading}
      className={cn('gap-2', className)}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash2 className="size-4" />
      )}
      {label}
    </Button>
  )
}
