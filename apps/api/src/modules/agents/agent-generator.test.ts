import { describe, it, expect } from 'vitest'
import { parseAgentDraft } from './agent-generator.js'

describe('parseAgentDraft', () => {
  it('parses a plain JSON object', () => {
    const draft = parseAgentDraft(JSON.stringify({
      name: 'Bakery Support',
      description: 'Answers order and allergy questions.',
      systemPrompt: 'You are a friendly bakery assistant.',
      suggestedTemperature: 0.4,
      toneOfVoice: 'friendly',
      language: 'english',
      suggestedTools: ['web-search'],
    }))
    expect(draft.name).toBe('Bakery Support')
    expect(draft.suggestedTemperature).toBe(0.4)
    expect(draft.suggestedTools).toEqual(['web-search'])
  })

  it('strips markdown code fences', () => {
    const draft = parseAgentDraft('```json\n{"name":"Bakery","systemPrompt":"Be kind.","description":"d"}\n```')
    expect(draft.name).toBe('Bakery')
    expect(draft.systemPrompt).toBe('Be kind.')
  })

  it('extracts JSON embedded in prose', () => {
    const draft = parseAgentDraft('Here you go: {"name":"SalesBot","description":"d","systemPrompt":"p"} Done!')
    expect(draft.name).toBe('SalesBot')
  })

  it('fills defaults for missing optional fields', () => {
    const draft = parseAgentDraft('{"name":"X"}')
    expect(draft.description).toBe('')
    expect(draft.systemPrompt).toBe('')
    expect(draft.suggestedTools).toBeUndefined()
  })

  it('rejects content with no JSON object', () => {
    expect(() => parseAgentDraft('sorry, I cannot help')).toThrowError(/unusable draft/)
  })

  it('rejects invalid JSON', () => {
    expect(() => parseAgentDraft('{"name": }')).toThrowError(/unusable draft/)
  })

  it('rejects a draft missing required name', () => {
    expect(() => parseAgentDraft('{"description":"d","systemPrompt":"p"}')).toThrowError(/unusable draft/)
  })
})
