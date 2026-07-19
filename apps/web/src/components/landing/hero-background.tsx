import { useEffect, useRef, useState } from 'react'

type OrbitRing = {
  size: number
  duration: number
  count: number
  reverse: boolean
  opacity: number
  nodeSize: string
}

const ORBIT_RINGS: OrbitRing[] = [
  { size: 300, duration: 42, count: 3, reverse: false, opacity: 0.55, nodeSize: 'size-1.5' },
  { size: 460, duration: 56, count: 4, reverse: true, opacity: 0.4, nodeSize: 'size-1.5' },
  { size: 640, duration: 72, count: 5, reverse: false, opacity: 0.26, nodeSize: 'size-1' },
]

const METEORS = Array.from({ length: 7 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 55}%`,
  left: `${20 + Math.random() * 70}%`,
  delay: `${Math.random() * 5}s`,
  duration: `${4 + Math.random() * 4}s`,
}))

function OrbitNode({ size }: { size: string }) {
  return (
    <span className={'relative flex ' + size}>
      <span className="absolute inset-0 rounded-full bg-primary blur-[5px]" />
      <span className={'relative ' + size + ' rounded-full bg-primary'} />
    </span>
  )
}

function OrbitRing({ ring }: { ring: OrbitRing }) {
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/40"
      style={{ width: ring.size, height: ring.size, opacity: ring.opacity }}
    >
      {Array.from({ length: ring.count }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            animation: `${ring.reverse ? 'orbit-counter' : 'orbit'} ${ring.duration}s linear infinite`,
            animationDelay: `${-(i * ring.duration) / ring.count}s`,
          }}
        >
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
            <OrbitNode size={ring.nodeSize} />
          </div>
        </div>
      ))}
    </div>
  )
}

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

      {/* Animated grid with radial mask + slow drift */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_70%)] animate-grid-drift" />

      {/* Orbit system centered behind the headline */}
      <div className="absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2 scale-[0.65] sm:scale-75 md:scale-100">
        {ORBIT_RINGS.map((ring) => (
          <OrbitRing key={ring.size} ring={ring} />
        ))}

        {/* Central pulsing core */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="animate-core-pulse">
            <span className="relative flex size-3">
              <span className="absolute inset-0 rounded-full bg-primary blur-[10px]" />
              <span className="relative size-3 rounded-full bg-primary" />
            </span>
          </div>
        </div>
      </div>

      {/* Meteors */}
      {METEORS.map((m) => (
        <span
          key={m.id}
          className="absolute animate-meteor"
          style={{
            top: m.top,
            left: m.left,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        >
          <span className="block h-px w-[90px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </span>
      ))}

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
