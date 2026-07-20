export function formatResponseTime(seconds: number): string {
  if (seconds < 0.01) return '0s'
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  return `${mins}m ${secs}s`
}

export function calculateSuccessRate(withReplies: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((withReplies / total) * 100)
}

export function getResponseTimeLabel(seconds: number): { label: string; className: string } {
  if (seconds < 1) return { label: 'Excellent', className: 'text-emerald-500' }
  if (seconds < 2) return { label: 'Good', className: 'text-amber-500' }
  return { label: 'Needs improvement', className: 'text-red-500' }
}
