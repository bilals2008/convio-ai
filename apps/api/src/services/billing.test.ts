import { describe, expect, it } from 'vitest'
import { bucketByMonth } from './billing.js'

describe('bucketByMonth', () => {
  it('groups dates into year-month buckets', () => {
    const buckets = bucketByMonth([
      new Date(2026, 8, 1),
      new Date(2026, 8, 15),
      new Date(2026, 7, 31),
    ])
    expect(buckets.get('2026-9')).toBe(2)
    expect(buckets.get('2026-8')).toBe(1)
  })

  it('returns an empty map for no dates', () => {
    expect(bucketByMonth([]).size).toBe(0)
  })
})
