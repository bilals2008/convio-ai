import { describe, it, expect } from 'vitest'
import { parseWidgetDraft } from './generator.js'

describe('parseWidgetDraft', () => {
  it('parses a full widget design', () => {
    const draft = parseWidgetDraft(JSON.stringify({
      name: 'Acme Support',
      primaryColor: '#1cca4a',
      backgroundColor: '#040a0c',
      textColor: '#eef0f1',
      promptBgColor: '#101618',
      headerGradientStart: '#1cca4a',
      headerGradientEnd: '#1cca4a',
      headerGradientDirection: 135,
      headerTitle: 'Acme Support',
      agentName: 'Acme Assistant',
      placeholderText: 'How can we help?',
      quickReplies: ['Pricing', 'Status', 'Contact'],
      themeMode: 'dark',
      position: 'bottom-right',
      widgetWidth: 'default',
      launcherSize: 'default',
      borderRadius: 'full',
    }))
    expect(draft.name).toBe('Acme Support')
    expect(draft.primaryColor).toBe('#1cca4a')
    expect(draft.quickReplies).toHaveLength(3)
    expect(draft.themeMode).toBe('dark')
  })

  it('strips invalid hex colors instead of rejecting the draft', () => {
    const draft = parseWidgetDraft(JSON.stringify({
      name: 'X',
      primaryColor: 'not-a-color',
      backgroundColor: '#ffffff',
    }))
    expect(draft.primaryColor).toBeUndefined()
    expect(draft.backgroundColor).toBe('#ffffff')
  })

  it('returns an empty object for a bare JSON object', () => {
    const draft = parseWidgetDraft('{}')
    expect(draft).toEqual({})
  })

  it('extracts JSON from markdown fences', () => {
    const draft = parseWidgetDraft('```json\n{"name":"Bakery","primaryColor":"#fb923c"}\n```')
    expect(draft.name).toBe('Bakery')
    expect(draft.primaryColor).toBe('#fb923c')
  })

  it('rejects content with no JSON object', () => {
    expect(() => parseWidgetDraft('sorry, I cannot help')).toThrowError(/unusable design/)
  })

  it('rejects invalid JSON', () => {
    expect(() => parseWidgetDraft('{"name": }')).toThrowError(/unusable design/)
  })
})
