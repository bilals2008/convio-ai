import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DocHeadingProps {
  as?: 'h1' | 'h2' | 'h3'
  children: ReactNode
  className?: string
}

export function DocHeading({ as: Tag = 'h2', children, className }: DocHeadingProps) {
  const id = children?.toString()?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  return (
    <Tag
      id={id}
      data-doc-heading
      className={cn(
        'scroll-mt-20',
        Tag === 'h1' && 'font-heading text-3xl font-semibold tracking-tight mb-2',
        Tag === 'h2' && 'font-heading text-xl font-semibold tracking-tight mt-10 mb-3',
        Tag === 'h3' && 'font-heading text-base font-semibold tracking-tight mt-6 mb-2',
        className
      )}
    >
      {children}
    </Tag>
  )
}
