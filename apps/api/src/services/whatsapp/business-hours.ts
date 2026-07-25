import type { BusinessHoursConfig } from './types.js'

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

export function getBusinessHoursConfig(orgConfig: Record<string, unknown>): BusinessHoursConfig | null {
  const bh = orgConfig.businessHours as Record<string, unknown> | undefined
  if (!bh || !bh.timezone || !bh.days) return null
  return bh as unknown as BusinessHoursConfig
}

export function isWithinBusinessHours(config: BusinessHoursConfig): boolean {
  const now = new Date()
  const dayName = DAY_NAMES[now.getDay()]
  const dayConfig = config.days[dayName]
  if (!dayConfig) return false

  const timeStr = now.toLocaleTimeString('en-US', {
    hour12: false,
    timeZone: config.timezone,
    hour: '2-digit',
    minute: '2-digit',
  })

  return timeStr >= dayConfig.open && timeStr <= dayConfig.close
}

export function getOfflineMessage(config: BusinessHoursConfig): string {
  return config.offlineMessage || "We're currently offline. We'll get back to you during business hours."
}
