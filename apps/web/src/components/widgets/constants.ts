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

export const WIDTH_OPTIONS = [
  { value: 'narrow', label: 'Narrow', width: 320 },
  { value: 'default', label: 'Default', width: 380 },
  { value: 'wide', label: 'Wide', width: 440 },
] as const

export const LAUNCHER_SIZE_OPTIONS = [
  { value: 'small', label: 'Small', size: 48 },
  { value: 'default', label: 'Default', size: 56 },
  { value: 'large', label: 'Large', size: 64 },
] as const

export const BORDER_RADIUS_OPTIONS = [
  { value: 'none', label: 'Sharp', radius: 0 },
  { value: 'default', label: 'Rounded', radius: 16 },
  { value: 'full', label: 'Full', radius: 24 },
] as const

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
    widgetWidth?: 'narrow' | 'default' | 'wide'
    launcherSize?: 'small' | 'default' | 'large'
    borderRadius?: 'none' | 'default' | 'full'
  }
}

export const LAUNCHER_TEMPLATES: LauncherTemplate[] = [
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Calm teal & sky blue',
    config: {
      primaryColor: '#0ea5e9',
      backgroundColor: '#0c1a2a',
      textColor: '#e0f2fe',
      promptBgColor: '#162a3e',
      headerGradientStart: '#0c1a2a',
      headerGradientEnd: '#0e7490',
      borderColor: '',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    description: 'Warm coral & orange',
    config: {
      primaryColor: '#f97316',
      backgroundColor: '#1a0f0a',
      textColor: '#fff7ed',
      promptBgColor: '#2a1a10',
      headerGradientStart: '#1a0f0a',
      headerGradientEnd: '#c2410c',
      borderColor: '',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'forest-sage',
    name: 'Forest Sage',
    description: 'Natural green earthy',
    config: {
      primaryColor: '#22c55e',
      backgroundColor: '#0a1a10',
      textColor: '#dcfce7',
      promptBgColor: '#142a1e',
      headerGradientStart: '#0a1a10',
      headerGradientEnd: '#166534',
      borderColor: '',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },
  {
    id: 'rose-petal',
    name: 'Rose Petal',
    description: 'Soft pink & magenta',
    config: {
      primaryColor: '#ec4899',
      backgroundColor: '#1a0a14',
      textColor: '#fdf2f8',
      promptBgColor: '#2a1420',
      headerGradientStart: '#1a0a14',
      headerGradientEnd: '#9d174d',
      borderColor: '',
      inputBgColor: '',
      sendBtnColor: '',
      position: 'bottom-right',
      widgetHeight: 540,
    },
  },

]
