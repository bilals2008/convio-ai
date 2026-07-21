export function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function isLightColor(hex: string): boolean {
  const c = hex.replace('#', '')
  const r = parseInt(c.substring(0, 2), 16)
  const g = parseInt(c.substring(2, 4), 16)
  const b = parseInt(c.substring(4, 6), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 128
}

export function getContrastText(hex: string): string {
  return isLightColor(hex) ? '#1f2937' : '#ffffff'
}

export function sanitizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
}
