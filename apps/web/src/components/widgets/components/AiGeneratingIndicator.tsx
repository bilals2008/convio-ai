import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// Four-point sparkle, centred in a 24x24 box.
const SPARKLE_PATH =
  'M12 1.5 L13.6 10.4 L22.5 12 L13.6 13.6 L12 22.5 L10.4 13.6 L1.5 12 L10.4 10.4 Z'

interface AiGeneratingIndicatorProps {
  /** Rotating status copy. Crossfaded as it changes. */
  label: string
  className?: string
}

/**
 * Status row shown while an AI draft is being generated: a rotating dashed
 * halo, two counter-orbiting nodes and a pulsing sparkle core, next to a stable
 * title with the rotating phase copy beneath it.
 *
 * Laid out horizontally so it reads as a status line inside whatever panel it
 * is placed in, rather than as a stranded mark in empty space.
 *
 * Deliberately flat — token colours only, no gradients, glows or drop shadows.
 * Collapses to a static mark when the user prefers reduced motion, and exposes
 * a single stable announcement to assistive tech rather than one per phase.
 */
export function AiGeneratingIndicator({ label, className }: AiGeneratingIndicatorProps) {
  const reduceMotion = useReducedMotion()

  return (
    <div className={cn('flex items-center gap-3', className)} role="status">
      <span className="sr-only">Generating your widget design</span>

      <div className="relative size-10 shrink-0" aria-hidden="true">
        {/* Dashed halo */}
        <svg
          viewBox="0 0 44 44"
          className={cn('absolute inset-0 size-full text-primary', !reduceMotion && 'animate-spin')}
          style={reduceMotion ? undefined : { animationDuration: '6s' }}
        >
          <circle
            cx="22"
            cy="22"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.16"
            strokeWidth="1.4"
            strokeDasharray="4 10"
          />
        </svg>

        {/* Orbiting nodes — opposite directions read as "working" without a
            progress bar pretending to know how far along it is. */}
        <div
          className={cn('absolute inset-0', !reduceMotion && 'animate-spin')}
          style={reduceMotion ? undefined : { animationDuration: '2.6s' }}
        >
          <span className="absolute left-1/2 top-0 size-1 -translate-x-1/2 rounded-full bg-primary" />
        </div>
        <div
          className={cn('absolute inset-0', !reduceMotion && 'animate-spin')}
          style={
            reduceMotion ? undefined : { animationDuration: '4s', animationDirection: 'reverse' }
          }
        >
          <span className="absolute left-0 top-1/2 size-[3px] -translate-y-1/2 rounded-full bg-primary/40" />
        </div>

        {/* Sparkle core */}
        <motion.div
          className="absolute inset-0 m-auto size-5 text-primary"
          animate={reduceMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 24 24" className="size-full">
            <path d={SPARKLE_PATH} fill="currentColor" />
          </svg>
        </motion.div>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">Generating your design</p>
        <div className="h-4" aria-hidden="true">
          <AnimatePresence mode="wait">
            <motion.p
              key={label}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="truncate text-xs text-muted-foreground"
            >
              {label}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
