import { cn } from '@/lib/utils'

interface ProductCardProps extends React.ComponentProps<'div'> {
  hover?: boolean
}

export function ProductCard({ className, hover = true, ...props }: ProductCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground',
        hover && 'transition-all duration-200 hover:border-primary/30 hover:shadow-md',
        className,
      )}
      {...props}
    />
  )
}
