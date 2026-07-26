import type { WidgetDetail } from './types'

export const primaryPresets = [
  { label: 'Orange', color: '#fb923c' },
  { label: 'Blue', color: '#3b82f6' },
  { label: 'Emerald', color: '#10b981' },
  { label: 'Violet', color: '#8b5cf6' },
  { label: 'Rose', color: '#f43f5e' },
  { label: 'Slate', color: '#475569' },
  { label: 'Cyan', color: '#06b6d4' },
  { label: 'Amber', color: '#f59e0b' },
] as const

export const bgPresets = [
  { label: 'Dark', color: '#1c1c1c' },
  { label: 'Charcoal', color: '#2d2d2d' },
  { label: 'White', color: '#ffffff' },
  { label: 'Light Gray', color: '#f5f5f5' },
] as const

export const textPresets = [
  { label: 'Light', color: '#f3f4f6' },
  { label: 'White', color: '#ffffff' },
  { label: 'Dark', color: '#1f2937' },
  { label: 'Charcoal', color: '#111827' },
  { label: 'Muted', color: '#9ca3af' },
] as const

export const STATUS_BADGE: Record<
  WidgetDetail['status'],
  { label: string; variant: 'active' | 'draft' | 'archived' }
> = {
  active: { label: 'Live', variant: 'active' },
  paused: { label: 'Paused', variant: 'draft' },
  draft: { label: 'Draft', variant: 'draft' },
}

export const STATUS_INDICATOR: Record<
  WidgetDetail['status'],
  { label: string; dot: string; pulse: boolean }
> = {
  active: { label: 'Live', dot: 'bg-success', pulse: true },
  paused: { label: 'Paused', dot: 'bg-warning', pulse: false },
  draft: { label: 'Draft', dot: 'bg-muted-foreground', pulse: false },
}

export const MAX_PROMPTS = 4
export const MAX_GREETING_LENGTH = 500
