import { useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface AutoGrowTextareaProps {
  id?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
  className?: string
}

export function AutoGrowTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 2,
  maxLength,
  className,
}: AutoGrowTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = `${ref.current.scrollHeight}px`
    }
  }, [value])

  return (
    <div className="relative">
      <textarea
        id={id}
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        aria-label={placeholder ?? 'Text input'}
        className={cn(
          'w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground',
          'placeholder:text-muted-foreground/70',
          'transition-colors duration-200',
          'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
          className,
        )}
      />
    </div>
  )
}
