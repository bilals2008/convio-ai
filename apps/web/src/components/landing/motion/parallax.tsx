import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { gsap } from './gsap'

interface ParallaxProps {
  children: ReactNode
  className?: string
  /** Total vertical travel in px across the viewport pass. */
  distance?: number
  start?: string
  end?: string
}

/**
 * Subtle scrubbed vertical parallax. Keep `distance` small — this is meant to
 * add depth, not motion. Disabled under reduced-motion.
 */
export function Parallax({
  children,
  className,
  distance = 60,
  start = 'top bottom',
  end = 'bottom top',
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        el,
        { y: -distance / 2 },
        {
          y: distance / 2,
          ease: 'none',
          scrollTrigger: { trigger: el, start, end, scrub: true },
        }
      )
    })

    return () => mm.revert()
  }, [distance, start, end])

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
