import type { WidgetDetail } from './types'

export const primaryPresets = [
  { label: 'Blue', color: '#3b82f6' },
  { label: 'Orange', color: '#fb923c' },
] as const

export const bgPresets = [
  { label: 'Dark', color: '#1c1c1c' },
  { label: 'Light', color: '#f5f5f5' },
] as const

export const textPresets = [
  { label: 'Light', color: '#f3f4f6' },
  { label: 'Dark', color: '#1f2937' },
] as const

export const promptBgPresets = [
  { label: 'Muted', color: '#2a2a2a' },
  { label: 'Light', color: '#f5f5f5' },
] as const

export const headerStartPresets = [
  { label: 'Blue', color: '#3b82f6' },
  { label: 'Orange', color: '#fb923c' },
] as const

export const headerEndPresets = [
  { label: 'Indigo', color: '#4338ca' },
  { label: 'Deep Orange', color: '#c2410c' },
] as const

export const borderColorPresets = [
  { label: 'Auto', color: '' },
  { label: 'White', color: '#ffffff' },
] as const

export const inputBgPresets = [
  { label: 'Auto', color: '' },
  { label: 'Dark', color: '#111111' },
] as const

export const sendBtnPresets = [
  { label: 'Auto', color: '' },
  { label: 'White', color: '#ffffff' },
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

export const MAX_GREETING_LENGTH = 30

export const THEME_MODES = [
  { value: 'auto', label: 'Auto', description: 'Follow system setting' },
  { value: 'light', label: 'Light', description: 'Always light' },
  { value: 'dark', label: 'Dark', description: 'Always dark' },
] as const

export type ThemeMode = 'auto' | 'light' | 'dark'

export interface LauncherTemplate {
  id: string
  name: string
  description: string
  config: {
    primaryColor?: string
    backgroundColor?: string
    textColor?: string
    promptBgColor?: string
    headerGradientStart?: string
    headerGradientEnd?: string
    borderColor?: string
    inputBgColor?: string
    sendBtnColor?: string
    position?: 'bottom-right' | 'bottom-left'
    widgetHeight?: number
  }
}

export const LAUNCHER_TEMPLATES: LauncherTemplate[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Clean dark with blue accent',
    config: {
      primaryColor: '#3b82f6',
      backgroundColor: '#111827',
      textColor: '#f9fafb',
      promptBgColor: '#1f2937',
      headerGradientStart: '#111827',
      headerGradientEnd: '#1e3a5f',
      borderColor: '',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'light',
    name: 'Light',
    description: 'Clean white with soft borders',
    config: {
      primaryColor: '#2563eb',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      promptBgColor: '#f3f4f6',
      headerGradientStart: '#2563eb',
      headerGradientEnd: '#1d4ed8',
      borderColor: '#e5e7eb',
      inputBgColor: '#f9fafb',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Subtle, no gradients, flat colors',
    config: {
      primaryColor: '#6b7280',
      backgroundColor: '#18181b',
      textColor: '#fafafa',
      promptBgColor: '#27272a',
      headerGradientStart: '#18181b',
      headerGradientEnd: '#18181b',
      borderColor: '#27272a',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Professional teal, calm and focused',
    config: {
      primaryColor: '#0d9488',
      backgroundColor: '#0f172a',
      textColor: '#f1f5f9',
      promptBgColor: '#1e293b',
      headerGradientStart: '#0f172a',
      headerGradientEnd: '#134e4a',
      borderColor: '',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Warm neutral tones, approachable',
    config: {
      primaryColor: '#d97706',
      backgroundColor: '#1c1917',
      textColor: '#fafaf9',
      promptBgColor: '#292524',
      headerGradientStart: '#1c1917',
      headerGradientEnd: '#44403c',
      borderColor: '',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
]
