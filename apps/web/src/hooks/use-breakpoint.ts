import { useEffect, useState } from "react"

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

type Breakpoint = keyof typeof breakpoints

export function useBreakpoint(query: Breakpoint) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const width = breakpoints[query]
    const mql = window.matchMedia(`(min-width: ${width}px)`)
    const handler = (e: MediaQueryListEvent | MediaQueryList) => setMatches(e.matches)
    handler(mql)
    mql.addEventListener("change", handler)
    return () => mql.removeEventListener("change", handler)
  }, [query])

  return matches
}
