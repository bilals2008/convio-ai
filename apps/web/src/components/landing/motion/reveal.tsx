import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { gsap } from './gsap'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Offset in px the element rises from as it fades in. */
  y?: number
  delay?: number
  duration?: number
  /** ScrollTrigger start position. */
  start?: string
  once?: boolean
}

/**
 * GSAP scroll reveal — fades and lifts content into place when it enters the
 * viewport. Under reduced-motion the content renders statically.
 */
export function Reveal({
  children,
  className,
  y = 26,
  delay = 0,
  duration = 0.75,
  start = 'top 88%',
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y },
        {
          autoAlpha: 1,
          y: 0,
          duration,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start, once },
        }
      )
    })

    return () => mm.revert()
  }, [y, delay, duration, start, once])

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  )
}
