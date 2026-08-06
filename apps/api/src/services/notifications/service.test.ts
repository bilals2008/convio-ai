import { describe, it, expect } from 'vitest'
import { isInQuietHours, shouldSendEmail } from './service.js'
import { NotificationCategory, NotificationPriority } from '@convio/database'
import { getTemplate, NOTIFICATION_TEMPLATES } from './templates.js'
import { NOTIFICATION_EVENTS } from './events.js'

function pref(overrides: Partial<Parameters<typeof shouldSendEmail>[0] & object> = {}) {
  return {
    emailEnabled: true,
    muteAll: false,
    quietHours: null,
    categorySettings: {},
    ...overrides,
  } as unknown as Parameters<typeof shouldSendEmail>[0]
}

describe('isInQuietHours', () => {
  const at = (h: number, m = 0) => new Date(2026, 0, 1, h, m)

  it('returns false when quiet hours are not set', () => {
    expect(isInQuietHours(null, at(12))).toBe(false)
    expect(isInQuietHours(undefined, at(12))).toBe(false)
    expect(isInQuietHours({}, at(12))).toBe(false)
  })

  it('handles same-day ranges', () => {
    const qh = { start: '22:00', end: '07:00' }
    expect(isInQuietHours(qh, at(23))).toBe(true)
    expect(isInQuietHours(qh, at(6, 59))).toBe(true)
    expect(isInQuietHours(qh, at(7))).toBe(false)
    expect(isInQuietHours(qh, at(12))).toBe(false)
    expect(isInQuietHours(qh, at(22))).toBe(true)
  })

  it('handles non-overnight ranges', () => {
    const qh = { start: '09:00', end: '17:00' }
    expect(isInQuietHours(qh, at(10))).toBe(true)
    expect(isInQuietHours(qh, at(8, 59))).toBe(false)
    expect(isInQuietHours(qh, at(17))).toBe(false)
  })

  it('rejects malformed input', () => {
    expect(isInQuietHours({ start: 'abc', end: '07:00' }, at(23))).toBe(false)
  })
})

describe('shouldSendEmail', () => {
  const now = new Date(2026, 0, 1, 12, 0)

  it('only emails high/critical by default', () => {
    expect(shouldSendEmail(pref(), NotificationCategory.billing, NotificationPriority.info, now)).toBe(false)
    expect(shouldSendEmail(pref(), NotificationCategory.billing, NotificationPriority.medium, now)).toBe(false)
    expect(shouldSendEmail(pref(), NotificationCategory.billing, NotificationPriority.high, now)).toBe(true)
    expect(shouldSendEmail(pref(), NotificationCategory.billing, NotificationPriority.critical, now)).toBe(true)
  })

  it('respects emailEnabled and muteAll', () => {
    expect(shouldSendEmail(pref({ emailEnabled: false }), NotificationCategory.billing, NotificationPriority.critical, now)).toBe(false)
    expect(shouldSendEmail(pref({ muteAll: true }), NotificationCategory.billing, NotificationPriority.critical, now)).toBe(false)
  })

  it('respects per-category email opt-out', () => {
    expect(shouldSendEmail(pref({ categorySettings: { billing: { email: false } } }), NotificationCategory.billing, NotificationPriority.critical, now)).toBe(false)
    expect(shouldSendEmail(pref({ categorySettings: { billing: { email: false } } }), NotificationCategory.security, NotificationPriority.critical, now)).toBe(true)
  })

  it('defers non-critical email during quiet hours, never critical', () => {
    const quiet = { start: '22:00', end: '07:00' }
    const qhNow = new Date(2026, 0, 1, 23, 0)
    expect(shouldSendEmail(pref({ quietHours: quiet }), NotificationCategory.billing, NotificationPriority.high, qhNow)).toBe(false)
    expect(shouldSendEmail(pref({ quietHours: quiet }), NotificationCategory.billing, NotificationPriority.critical, qhNow)).toBe(true)
  })

  it('honors explicit sendEmail override', () => {
    expect(shouldSendEmail(pref(), NotificationCategory.billing, NotificationPriority.low, now, true)).toBe(true)
  })
})

describe('templates', () => {
  it('covers every declared event with a template', () => {
    for (const event of Object.values(NOTIFICATION_EVENTS)) {
      expect(NOTIFICATION_TEMPLATES[event], `missing template for ${event}`).toBeDefined()
    }
  })

  it('renders titles from payloads', () => {
    const tpl = getTemplate(NOTIFICATION_EVENTS.PAYMENT_FAILED)
    expect(tpl).toBeDefined()
    expect(tpl!.title({})).toContain('Payment')
    expect(tpl!.priority).toBe('critical')
    expect(tpl!.recipients).toContain('org_admins')
  })
})
