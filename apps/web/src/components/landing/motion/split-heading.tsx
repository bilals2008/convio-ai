import { Fragment, useLayoutEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { gsap } from './gsap'

interface SplitHeadingProps {
  text: string
  /** Substring of `text` rendered with `highlightClassName` (animated in order). */
  highlight?: string
  highlightClassName?: string
  as?: 'h1' | 'h2' | 'h3'
  className?: string
  delay?: number
  stagger?: number
  start?: string
}

interface Token {
  word: string
  highlight: boolean
}

function tokenize(text: string, highlight?: string): Token[] {
  const tokens: Token[] = []
  const add = (part: string, isHighlight: boolean) => {
    part
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word) => tokens.push({ word, highlight: isHighlight }))
  }

  if (highlight && text.includes(highlight)) {
    const index = text.indexOf(highlight)
    add(text.slice(0, index), false)
    add(highlight, true)
    add(text.slice(index + highlight.length), false)
  } else {
    add(text, false)
  }

  return tokens
}

/**
 * Word-by-word heading reveal built on GSAP (no paid SplitText plugin). Words
 * rise into place with a short stagger when the heading enters the viewport.
 */
export function SplitHeading({
  text,
  highlight,
  highlightClassName,
  as = 'h2',
  className,
  delay = 0,
  stagger = 0.05,
  start = 'top 88%',
}: SplitHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null)
  const Tag = as
  const tokens = tokenize(text, highlight)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const words = el.querySelectorAll<HTMLElement>('[data-word]')
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        words,
        { autoAlpha: 0, yPercent: 60 },
        {
          autoAlpha: 1,
          yPercent: 0,
          duration: 0.8,
          delay,
          ease: 'power3.out',
          stagger,
          scrollTrigger: { trigger: el, start, once: true },
        }
      )
    })

    return () => mm.revert()
  }, [delay, stagger, start, text, highlight])

  return (
    <Tag ref={ref} className={cn(className)}>
      {tokens.map((token, i) => (
        <Fragment key={`${token.word}-${i}`}>
          {i > 0 && ' '}
          <span
            data-word
            className={cn('inline-block will-change-transform', token.highlight && highlightClassName)}
          >
            {token.word}
          </span>
        </Fragment>
      ))}
    </Tag>
  )
}
