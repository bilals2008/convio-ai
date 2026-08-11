export function formatCurrency(value: number): string {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatCurrencyCompact(value: number): string {
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return `${sign}$${abs.toFixed(2)}`
}

export function formatCount(value: number): string {
  return value.toLocaleString('en-US')
}
