import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'

interface TypewriterProps {
  texts: string[]
  /** Static text rendered before the typed segment. */
  prefix?: string
  /** Color of the static prefix text. */
  color?: string
  /** Color of the rotating typed segment. */
  typedColor?: string
  cursorColor?: string
  cursorChar?: string
  /** Milliseconds per character while typing. */
  typeSpeed?: number
  /** Milliseconds per character while deleting. */
  deleteSpeed?: number
  /** Milliseconds to hold a fully typed word before deleting. */
  holdTime?: number
  showCursor?: boolean
  className?: string
}

/**
 * Rotating typewriter (adapted from the Originkit "Type Writer" component).
 * Strips the Framer-canvas-only statics so it runs as a normal React component.
 */
export function Typewriter({
  texts,
  prefix = '',
  color = 'var(--muted-foreground)',
  typedColor = 'var(--primary)',
  cursorColor,
  cursorChar = '_',
  typeSpeed = 70,
  deleteSpeed = 40,
  holdTime = 1500,
  showCursor = true,
  className,
}: TypewriterProps) {
  const list = texts.filter((t): t is string => typeof t === 'string')
  const hasTexts = list.length > 0

  const [displayText, setDisplayText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  useEffect(() => {
    if (!hasTexts) return

    let timeout: ReturnType<typeof setTimeout> | undefined
    const currentText = list[currentTextIndex] ?? ''

    const tick = () => {
      if (isDeleting) {
        if (displayText === '') {
          setIsDeleting(false)
          setCurrentTextIndex((prev) => (prev + 1) % list.length)
          setCurrentIndex(0)
        } else {
          timeout = setTimeout(
            () => setDisplayText((prev) => prev.slice(0, -1)),
            deleteSpeed,
          )
        }
      } else if (currentIndex < currentText.length) {
        timeout = setTimeout(() => {
          setDisplayText((prev) => prev + currentText[currentIndex])
          setCurrentIndex((prev) => prev + 1)
        }, typeSpeed)
      } else if (list.length > 1) {
        timeout = setTimeout(() => setIsDeleting(true), holdTime)
      }
    }

    tick()
    return () => {
      if (timeout) clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, displayText, isDeleting, currentTextIndex, hasTexts])

  const cursorResolvedColor = cursorColor && cursorColor !== '' ? cursorColor : typedColor

  const cursorVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.01,
        repeat: Infinity,
        repeatDelay: 0.4,
        repeatType: 'reverse',
      },
    },
  }

  return (
    <span className={className} style={{ letterSpacing: '-0.02em' }}>
      {prefix ? <span style={{ color }}>{prefix}</span> : null}
      <span style={{ color: typedColor }}>{displayText}</span>
      {showCursor && (
        <motion.span
          variants={cursorVariants}
          initial="initial"
          animate="animate"
          style={{ color: cursorResolvedColor, marginLeft: '0.15rem' }}
        >
          {cursorChar}
        </motion.span>
      )}
    </span>
  )
}
