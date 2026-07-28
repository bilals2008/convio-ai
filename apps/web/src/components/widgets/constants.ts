import type { WidgetDetail } from './types'

export const primaryPresets = [
  { label: 'Orange', color: '#fb923c' },
  { label: 'Blue', color: '#3b82f6' },
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
  { label: 'Orange', color: '#fb923c' },
  { label: 'Blue', color: '#3b82f6' },
] as const

export const headerEndPresets = [
  { label: 'Deep Orange', color: '#c2410c' },
  { label: 'Indigo', color: '#4338ca' },
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
    id: 'classic',
    name: 'Classic',
    description: 'Rounded button with warm orange accent',
    config: {
      primaryColor: '#fb923c',
      backgroundColor: '#1c1c1c',
      textColor: '#f3f4f6',
      promptBgColor: '#2a2a2a',
      headerGradientStart: '#fb923c',
      headerGradientEnd: '#c2410c',
      borderColor: '',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm amber to rose gradient',
    config: {
      primaryColor: '#f59e0b',
      backgroundColor: '#1c1917',
      textColor: '#f5f5f4',
      promptBgColor: '#292524',
      headerGradientStart: '#f59e0b',
      headerGradientEnd: '#e11d48',
      borderColor: '',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'pill',
    name: 'Pill',
    description: 'Fully rounded pill-shaped launcher',
    config: {
      primaryColor: '#8b5cf6',
      backgroundColor: '#1e1b2e',
      textColor: '#e0e7ff',
      promptBgColor: '#2e2a42',
      headerGradientStart: '#8b5cf6',
      headerGradientEnd: '#6d28d9',
      borderColor: '',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'dark',
    name: 'Midnight',
    description: 'Deep dark theme with cool blue accents',
    config: {
      primaryColor: '#60a5fa',
      backgroundColor: '#0f172a',
      textColor: '#e2e8f0',
      promptBgColor: '#1e293b',
      headerGradientStart: '#0f172a',
      headerGradientEnd: '#1e3a5f',
      borderColor: '#1e3a5f',
      inputBgColor: '#1e293b',
      sendBtnColor: '#60a5fa',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Vibrant multi-color gradient background',
    config: {
      primaryColor: '#f43f5e',
      backgroundColor: '#1a1a2e',
      textColor: '#f3f4f6',
      promptBgColor: '#16213e',
      headerGradientStart: '#f43f5e',
      headerGradientEnd: '#8b5cf6',
      borderColor: '',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'glow',
    name: 'Glow',
    description: 'Neon green accent with subtle glow',
    config: {
      primaryColor: '#22c55e',
      backgroundColor: '#0a0f0a',
      textColor: '#e5e7eb',
      promptBgColor: '#141f14',
      headerGradientStart: '#22c55e',
      headerGradientEnd: '#15803d',
      borderColor: '#22c55e',
      inputBgColor: '#141f14',
      sendBtnColor: '#22c55e',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Smaller widget, fits tight layouts',
    config: {
      primaryColor: '#fb923c',
      backgroundColor: '#1c1c1c',
      textColor: '#f3f4f6',
      promptBgColor: '#2a2a2a',
      headerGradientStart: '#fb923c',
      headerGradientEnd: '#c2410c',
      borderColor: '',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 380,
    },
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Soft pink tones, elegant and warm',
    config: {
      primaryColor: '#f43f5e',
      backgroundColor: '#1c1118',
      textColor: '#fff1f2',
      promptBgColor: '#2a1c24',
      headerGradientStart: '#f43f5e',
      headerGradientEnd: '#be123c',
      borderColor: '',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Deep crimson, bold and intense',
    config: {
      primaryColor: '#dc2626',
      backgroundColor: '#1a0a0a',
      textColor: '#fef2f2',
      promptBgColor: '#2d1111',
      headerGradientStart: '#dc2626',
      headerGradientEnd: '#991b1b',
      borderColor: '#7f1d1d',
      inputBgColor: '#2d1111',
      sendBtnColor: '#dc2626',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Soft lilac, gentle and calming',
    config: {
      primaryColor: '#a78bfa',
      backgroundColor: '#1e1630',
      textColor: '#ede9fe',
      promptBgColor: '#2a2040',
      headerGradientStart: '#a78bfa',
      headerGradientEnd: '#7c3aed',
      borderColor: '',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'matrix',
    name: 'Matrix',
    description: 'Green on black, cyberpunk terminal',
    config: {
      primaryColor: '#4ade80',
      backgroundColor: '#000000',
      textColor: '#dcfce7',
      promptBgColor: '#0a1a0a',
      headerGradientStart: '#166534',
      headerGradientEnd: '#052e16',
      borderColor: '#166534',
      inputBgColor: '#0a1a0a',
      sendBtnColor: '#4ade80',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
]
