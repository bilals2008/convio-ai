export function calculate(expression: string): { result?: number; error?: string } {
  if (!expression || typeof expression !== 'string') {
    return { error: 'No expression provided' }
  }

  let sanitized = expression
    .replace(/\s/g, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\^/g, '**')

  if (!/^[\d+\-*/().,%*]+$/.test(sanitized)) {
    return { error: 'Invalid characters in expression' }
  }

  try {
    const result = Function(`"use strict"; return (${sanitized})`)()
    if (typeof result !== 'number' || !Number.isFinite(result)) {
      return { error: 'Expression did not produce a finite number' }
    }
    return { result: Math.round(result * 1e10) / 1e10 }
  } catch {
    return { error: 'Failed to evaluate expression' }
  }
}
