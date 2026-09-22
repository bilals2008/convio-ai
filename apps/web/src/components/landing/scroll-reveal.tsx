import { type ReactNode } from 'react'
import { motion, useReducedMotion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

const variants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 32, scale: 0.985 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -16 },
    visible: { opacity: 1, y: 0 },
  },
}

interface ScrollRevealProps {
  children: ReactNode
  variant?: keyof typeof variants
  delay?: number
  duration?: number
  className?: string
  /** Once true = only animate once on first reveal */
  once?: boolean
  /** Viewport threshold 0-1 */
  amount?: number
}

export function ScrollReveal({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.7,
  className,
  once = true,
  amount = 0.2,
}: ScrollRevealProps) {
  const reduce = useReducedMotion()

  if (reduce) return <div className={cn(className)}>{children}</div>

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants[variant]}
      transition={{
        duration,
        delay,
        ease: EASE,
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
