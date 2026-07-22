import { useEffect, useRef, useState } from 'react'

function useMouseSpotlight() {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 50, y: 28 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        setPos({ x, y })
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return { ref, pos }
}

export function HeroBackground() {
  const { ref, pos } = useMouseSpotlight()

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Soft primary gradient orbs */}
      <div className="absolute -top-[30%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.07] blur-[120px]" />
      <div className="absolute -bottom-[20%] left-[15%] h-[400px] w-[500px] rounded-full bg-primary/[0.04] blur-[100px]" />
      <div className="absolute top-[20%] right-[5%] h-[300px] w-[400px] rounded-full bg-primary/[0.03] blur-[80px]" />



      {/* Mouse-follow spotlight */}
      <div
        className="absolute inset-0 transition-[background] duration-300"
        style={{
          background: `radial-gradient(420px circle at ${pos.x}% ${pos.y}%, hsl(var(--primary) / 0.06), transparent 65%)`,
        }}
      />

      {/* Top edge glow line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  )
}
