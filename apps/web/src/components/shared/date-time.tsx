import { formatDate, formatRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface DateTimeProps {
  date: Date | string
  format?: 'relative' | 'full' | 'date' | 'time'
  className?: string
}

export function DateTime({ date, format = 'relative', className }: DateTimeProps) {
  const d = new Date(date)

  let display: string
  switch (format) {
    case 'relative':
      display = formatRelativeTime(d)
      break
    case 'full':
      display = d.toLocaleString()
      break
    case 'date':
      display = formatDate(d)
      break
    case 'time':
      display = d.toLocaleTimeString()
      break
    default:
      display = formatRelativeTime(d)
  }

  return (
    <time dateTime={d.toISOString()} className={cn('text-muted-foreground', className)}>
      {display}
    </time>
  )
}
