import { type ReactNode } from 'react'
import { motion, type Variants } from 'framer-motion'
import { cn } from '@/lib/utils'

const variants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
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
  duration = 0.5,
  className,
  once = true,
  amount = 0.3,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants[variant]}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
