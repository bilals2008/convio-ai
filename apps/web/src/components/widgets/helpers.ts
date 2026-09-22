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

export function sanitizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
}

// Mirrors the API's domainSchema so bad input is caught inline instead of only
// failing on save with a 400.
const DOMAIN_PATTERN =
  /^(localhost(?::\d+)?|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,})$/i

export function isValidDomain(domain: string): boolean {
  return DOMAIN_PATTERN.test(domain)
}

export const MAX_DOMAIN_LENGTH = 253

// Kept in step with the API's `allowedDomains` cap.
export const MAX_DOMAINS = 20
