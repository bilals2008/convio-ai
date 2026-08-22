import { describe, expect, it } from 'vitest'
import { guardrailInputRefusal, guardrailPrompt } from './guardrails.js'

describe('guardrailInputRefusal', () => {
  const g = {
    enabled: true,
    blockedWords: ['acme', 'bad word'],
    restrictedTopics: [],
  }

  it('blocks exact word', () => {
    expect(guardrailInputRefusal('tell me about ACME corp', g)).not.toBeNull()
  })

  it('does not block substring inside another word', () => {
    expect(guardrailInputRefusal('what is an academia?', g)).toBeNull()
  })

  it('blocks multiword phrase case-insensitively', () => {
    expect(guardrailInputRefusal('that is a Bad Word right there', g)).not.toBeNull()
  })

  it('passes when disabled or empty', () => {
    expect(guardrailInputRefusal('acme', { ...g, enabled: false })).toBeNull()
    expect(guardrailInputRefusal('hello', null)).toBeNull()
  })
})

describe('guardrailPrompt', () => {
  it('returns empty string when disabled', () => {
    expect(guardrailPrompt({ enabled: true, restrictedTopics: [], blockedWords: [] })).toBe('')
    expect(guardrailPrompt(null)).toBe('')
  })

  it('lists restricted topics in the prompt rules', () => {
    const p = guardrailPrompt({ enabled: true, blockedWords: [], restrictedTopics: ['politics'] })
    expect(p).toContain('## Guardrails')
    expect(p).toContain('politics')
  })
})
