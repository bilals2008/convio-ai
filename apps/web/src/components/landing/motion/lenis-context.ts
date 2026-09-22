import { createContext, useContext } from 'react'
import type Lenis from 'lenis'

export const LenisContext = createContext<Lenis | null>(null)

/** Access the active Lenis instance (null under reduced-motion or before mount). */
export function useLenis() {
  return useContext(LenisContext)
}
