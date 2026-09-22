import { useEffect, useState, type ReactNode } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap'
import { LenisContext } from './lenis-context'

/**
 * Smooth-scroll layer for the landing page. Scoped to its subtree — it is
 * created on mount and torn down on unmount so the dashboard and other routes
 * keep their native scrolling.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    const reduced = prefersReducedMotion()

    if (!reduced) {
      const instance = new Lenis({
        duration: 1.1,
        smoothWheel: true,
        autoRaf: false,
      })

      instance.on('scroll', ScrollTrigger.update)

      const tick = (time: number) => instance.raf(time * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      setLenis(instance)

      // Media (lazy images) can land after triggers are measured.
      const refresh = () => ScrollTrigger.refresh()
      window.addEventListener('load', refresh)
      const rafId = requestAnimationFrame(refresh)

      return () => {
        cancelAnimationFrame(rafId)
        window.removeEventListener('load', refresh)
        gsap.ticker.remove(tick)
        gsap.ticker.lagSmoothing(500, 33)
        instance.destroy()
        setLenis(null)
      }
    }

    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    const rafId = requestAnimationFrame(refresh)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('load', refresh)
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
