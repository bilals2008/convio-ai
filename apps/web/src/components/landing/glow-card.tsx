import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

interface GlowCardProps {
  children: ReactNode
  className?: string
  /** Show decorative corner icons */
  decorations?: boolean
}

export function GlowCard({ children, className, decorations = true }: GlowCardProps) {
  return (
    <div className={cn('relative bg-card rounded-[14px] overflow-hidden border border-border', className)}>
      {decorations && (
        <>
          <div className="absolute -top-10 -left-10 md:-top-14 md:-left-14 pointer-events-none select-none opacity-[0.03] rotate-[195deg]">
            <Sparkles className="size-[180px] md:size-[300px]" />
          </div>
          <div className="absolute -bottom-10 -right-10 md:-bottom-14 md:-right-14 pointer-events-none select-none opacity-[0.03] rotate-[15deg]">
            <Sparkles className="size-[180px] md:size-[300px]" />
          </div>
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
