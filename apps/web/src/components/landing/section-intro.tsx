import { cn } from '@/lib/utils'
import { Reveal, SplitHeading } from './motion'

interface SectionIntroProps {
  eyebrow?: string
  title: string
  highlight?: string
  description?: string
  align?: 'center' | 'left'
  className?: string
}

export function SectionIntro({
  eyebrow,
  title,
  highlight,
  description,
  align = 'center',
  className,
}: SectionIntroProps) {
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'flex flex-col',
        centered ? 'items-center text-center' : 'items-start text-left',
        className
      )}
    >
      {eyebrow && (
        <Reveal y={10} duration={0.5} className={cn('flex items-center gap-2', centered && 'justify-center')}>
          <span className="h-px w-6 bg-primary/40" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </span>
          {centered && <span className="h-px w-6 bg-primary/40" aria-hidden="true" />}
        </Reveal>
      )}

      <SplitHeading
        as="h2"
        text={title}
        highlight={highlight}
        highlightClassName="text-primary"
        className={cn(
          'mt-4 font-heading text-[clamp(28px,4vw,48px)] font-semibold leading-[1.08] tracking-[-0.025em] text-foreground',
          centered ? 'max-w-[22ch]' : 'max-w-[24ch]'
        )}
      />

      {description && (
        <Reveal y={16} delay={0.12}>
          <p
            className={cn(
              'mt-4 text-[15px] leading-[1.7] text-muted-foreground',
              centered ? 'max-w-[560px]' : 'max-w-[580px]'
            )}
          >
            {description}
          </p>
        </Reveal>
      )}
    </div>
  )
}
