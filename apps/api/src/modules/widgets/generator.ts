// AI widget design draft: schema, prompt, and response parsing for the
// "Design with AI" endpoint. Separated from routes so it can be unit-tested.

import { z } from 'zod'
import { AppError } from '../../plugins/error.js'
import { extractJsonObject } from '../agents/agent-generator.js'

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/

export const widgetDraftSchema = z.object({
  name: z.string().trim().max(100).optional(),
  primaryColor: z.string().max(20).optional(),
  backgroundColor: z.string().max(20).optional(),
  textColor: z.string().max(20).optional(),
  promptBgColor: z.string().max(20).optional(),
  headerGradientStart: z.string().max(20).optional(),
  headerGradientEnd: z.string().max(20).optional(),
  headerGradientDirection: z.number().min(0).max(360).optional(),
  borderColor: z.string().max(20).optional(),
  inputBgColor: z.string().max(20).optional(),
  sendBtnColor: z.string().max(20).optional(),
  footerBgColor: z.string().max(20).optional(),
  headerTitle: z.string().max(100).optional(),
  headerSubtitle: z.string().max(100).optional(),
  agentName: z.string().max(50).optional(),
  placeholderText: z.string().max(120).optional(),
  quickReplies: z.array(z.string().max(60)).max(4).optional(),
  themeMode: z.enum(['auto', 'light', 'dark']).optional(),
  position: z.enum(['bottom-right', 'bottom-left']).optional(),
  widgetWidth: z.enum(['narrow', 'default', 'wide']).optional(),
  launcherSize: z.enum(['small', 'default', 'large']).optional(),
  borderRadius: z.enum(['none', 'default', 'full']).optional(),
})

export type WidgetDraft = z.infer<typeof widgetDraftSchema>

const COLOR_KEYS = [
  'primaryColor',
  'backgroundColor',
  'textColor',
  'promptBgColor',
  'headerGradientStart',
  'headerGradientEnd',
  'borderColor',
  'inputBgColor',
  'sendBtnColor',
  'footerBgColor',
] as const

export const WIDGET_GENERATION_PROMPT = `You design the look and feel of an embedded website chat widget called a Convio widget. The user describes their brand or website, and you respond with ONLY a single valid JSON object (no markdown fences, no commentary) matching this schema:

{
  "name": string,                    // short widget name, e.g. "Acme Support"
  "primaryColor": string,            // main accent color as #rrggbb
  "backgroundColor": string,         // chat window background as #rrggbb
  "textColor": string,               // message text color as #rrggbb
  "promptBgColor": string,           // user prompt bubble background as #rrggbb
  "headerGradientStart": string,     // header gradient start as #rrggbb
  "headerGradientEnd": string,       // header gradient end as #rrggbb
  "headerGradientDirection": number, // gradient angle 0-360
  "borderColor": string,             // optional widget border as #rrggbb
  "inputBgColor": string,            // optional input background as #rrggbb
  "sendBtnColor": string,            // optional send button color as #rrggbb
  "footerBgColor": string,           // optional footer/input area background as #rrggbb
  "headerTitle": string,             // text shown in the widget header
  "headerSubtitle": string,          // small subtitle under the header title
  "agentName": string,               // assistant display name
  "placeholderText": string,         // input placeholder, e.g. "Type your message..."
  "quickReplies": string[],          // 0-4 short suggestion chips (<=60 chars each)
  "themeMode": string,               // one of: auto, light, dark
  "position": string,                // one of: bottom-right, bottom-left
  "widgetWidth": string,             // one of: narrow, default, wide
  "launcherSize": string,            // one of: small, default, large
  "borderRadius": string             // one of: none, default, full
}

Rules:
- Pick colors that match the user's described brand. For dark themes use a dark background with light text; for light themes the opposite. Ensure text/background contrast.
- headerTitle, headerSubtitle, agentName, and quickReplies should match the brand voice.
- Return valid JSON only. All colors as #rrggbb.`

function sanitizeColors(draft: Record<string, unknown>): Record<string, unknown> {
  const out = { ...draft }
  for (const key of COLOR_KEYS) {
    const value = out[key]
    if (typeof value !== 'string' || !HEX_COLOR.test(value)) delete out[key]
  }
  return out
}

/** Extract and validate a widget design draft from an LLM response. */
export function parseWidgetDraft(content: string): WidgetDraft {
  try {
    const raw = extractJsonObject(content) as Record<string, unknown>
    return widgetDraftSchema.parse(sanitizeColors(raw))
  } catch (error) {
    const detail = error instanceof z.ZodError
      ? `invalid fields: ${error.issues.map((i) => i.path.join('.')).join(', ')}`
      : 'invalid JSON'
    throw new AppError(502, `The AI returned an unusable design (${detail}). Please try again.`)
  }
}
