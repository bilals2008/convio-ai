import { useRef, useEffect, useCallback, useState } from 'react'

const ORB_CONFIGS = [
  'top-[10%] left-[8%] size-1.5 bg-primary/30 [animation-delay:0s]',
  'top-[25%] right-[12%] size-1 bg-primary/20 [animation-delay:1.5s]',
  'bottom-[20%] left-[15%] size-1 bg-primary/25 [animation-delay:3s]',
  'top-[60%] right-[8%] size-1.5 bg-primary/15 [animation-delay:4.5s]',
  'bottom-[35%] left-[45%] size-1 bg-primary/20 [animation-delay:2s]',
  'top-[15%] left-[65%] size-1 bg-primary/15 [animation-delay:5s]',
  'bottom-[10%] right-[25%] size-1.5 bg-primary/20 [animation-delay:3.5s]',
  'top-[70%] left-[25%] size-1 bg-primary/15 [animation-delay:1s]',
]

export function FloatingOrbs() {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const handleMove = useCallback((e: MouseEvent) => {
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / rect.width
      const dy = (e.clientY - cy) / rect.height
      setOffset({ x: dx * 10, y: dy * 10 })
    })
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [handleMove])

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      >
        {ORB_CONFIGS.map((config, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-float ${config}`}
          />
        ))}
      </div>
    </div>
  )
}
