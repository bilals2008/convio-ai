// AI knowledge base generation: schema, prompt, and response parsing for the
// "Generate with AI" endpoint. Reuses the agent generator's provider resolution.

import { z } from 'zod'
import { AppError } from '../../plugins/error.js'

export const kbDraftSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().max(500).default(''),
  documents: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(200),
        content: z.string().trim().min(30).max(50000),
      })
    )
    .min(2)
    .max(8),
})

export type KbDraft = z.infer<typeof kbDraftSchema>

export const KB_GENERATION_PROMPT = `You create starter knowledge bases for business AI chatbots. The user describes their business. Respond with ONLY a valid JSON object (no markdown fences, no commentary):

{"name":"string","description":"string","documents":[{"name":"string","content":"string"}]}

Rules:
- name: short KB name (<=60 chars).
- description: one sentence on what this KB covers (<=200 chars).
- documents: exactly 3 documents. Each name is lowercase-kebab.md (e.g. "services.md", "faqs.md", "policies.md").
- Content is real, plausible draft (150-300 words) — NOT placeholders. Mark anything the business must verify with "<!-- TODO: verify -->".
- Always include an "faqs.md" with 6-8 Q&A pairs the business's customers would ask.
- Content language: match the user's description language.
- Return valid JSON only. No markdown fences.`

/** Extract the first JSON object from LLM output (handles fences and prose). */
function extractJson(content: string): unknown {
  let raw = content.trim()
  // strip markdown code fences
  raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')
  // find first { to last }
  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) {
    throw new AppError(502, 'The AI returned no usable JSON. Please try again.')
  }
  const slice = raw.slice(start, end + 1)
  try {
    return JSON.parse(slice)
  } catch {
    // Last resort: remove trailing commas before ] or } (common LLM mistake)
    const fixed = slice.replace(/,\s*([\]}])/g, '$1')
    return JSON.parse(fixed)
  }
}

/** Parse and validate a generated KB draft. */
export function parseKbDraft(content: string): KbDraft {
  try {
    return kbDraftSchema.parse(extractJson(content))
  } catch (error) {
    const detail = error instanceof z.ZodError
      ? error.issues.map((i) => i.path.join('.')).join(', ')
      : 'invalid JSON'
    throw new AppError(502, `The AI returned an unusable draft (${detail}). Please try again.`)
  }
}
