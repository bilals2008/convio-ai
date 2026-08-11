import { Skeleton } from '@/components/ui/skeleton'

export function NotificationSkeleton({ compact = false }: { compact?: boolean }) {
  const rows = compact ? 2 : 5
  return (
    <div className="flex flex-col gap-1 p-1" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-3">
          <Skeleton className="size-8 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}