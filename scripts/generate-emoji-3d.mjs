#!/usr/bin/env node
/**
 * Generates the 3D emoji dataset used by the widget emoji picker.
 *
 * Run: pnpm emoji:generate
 *
 * Sources (all pinned so the output is reproducible):
 *   - unicode.org/emoji/frequency.html   → which emoji are actually used, and how often
 *   - emoji-datasource@15.1.2            → names, aliases, categories
 *   - @lobehub/fluent-emoji-3d@1.1.0     → Microsoft Fluent Emoji 3D assets (MIT),
 *     each file named "<lowercase-dash-joined-codepoints>.webp"
 *
 * Emoji are ranked by Unicode into exponential frequency buckets: bucket N emoji
 * are used less than 1/2^N as often as 😂, and buckets 11+ sit below median
 * frequency. We keep buckets 0..MAX_FREQUENCY_BUCKET, i.e. the emoji at or above
 * median frequency, which is where almost all real-world usage lives. That keeps
 * the picker useful while cutting the payload to roughly a third.
 *
 * Emoji without a 3D asset are dropped, so the picker can never reference a
 * missing file. The assets stay on the jsDelivr npm CDN at runtime, which keeps
 * ~600 binary files out of the repo.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const FREQUENCY_URL = 'https://www.unicode.org/emoji/frequency.html'
const EMOJI_DATASOURCE_VERSION = '15.1.2'
const FLUENT_3D_VERSION = '1.1.0'

const DATASOURCE_URL = `https://cdn.jsdelivr.net/npm/emoji-datasource@${EMOJI_DATASOURCE_VERSION}/emoji.json`
const LISTING_URL = `https://data.jsdelivr.com/v1/packages/npm/@lobehub/fluent-emoji-3d@${FLUENT_3D_VERSION}`

/** Buckets 0-10 are at or above median frequency (see unicode.org/emoji/frequency.html). */
const MAX_FREQUENCY_BUCKET = 10

// Category keys are emitted as short slugs to keep the generated file small.
const CATEGORY_SLUGS = {
  'Smileys & Emotion': 'smileys',
  'People & Body': 'people',
  'Animals & Nature': 'nature',
  'Food & Drink': 'food',
  'Travel & Places': 'travel',
  Activities: 'activities',
  Objects: 'objects',
  Symbols: 'symbols',
  Flags: 'flags',
}

// The frequency table mixes numeric entities with a few named ones. Only the
// card suits are real emoji; everything else decodes to nothing and is dropped by
// the asset lookup.
const NAMED_ENTITIES = {
  hearts: 0x2665,
  spades: 0x2660,
  clubs: 0x2663,
  diams: 0x2666,
}

const OUTPUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../apps/web/src/components/widget/emoji/data.ts',
)

async function fetchText(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`GET ${url} → ${response.status}`)
  return response.text()
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url))
}

function decodeEntities(html) {
  return html
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&(\w+);/g, (match, name) =>
      name in NAMED_ENTITIES ? String.fromCodePoint(NAMED_ENTITIES[name]) : match,
    )
}

/** Unicode codepoints as dash-joined lowercase hex — the asset filename. */
function toCodepoints(char) {
  return [...char].map((c) => c.codePointAt(0).toString(16)).join('-')
}

/**
 * Reads the "Ranked Order by Median Frequency" table into a flat, rank-ordered
 * list of emoji. Document order is the ranking: bucket first, then position.
 */
function parseRankedEmoji(html) {
  const start = html.indexOf('Ranked Order by Median Frequency')
  if (start === -1) throw new Error('Ranked table not found on the frequency page')

  const ranked = []
  const rows = html.slice(start).match(/<tr>[\s\S]*?<\/tr>/g) ?? []

  for (const row of rows) {
    const cells = row.match(/<td[^>]*>([\s\S]*?)<\/td>/g)
    if (!cells || cells.length < 2) continue

    const bucket = Number.parseInt(cells[0].replace(/<[^>]+>/g, '').trim(), 10)
    if (Number.isNaN(bucket) || bucket > MAX_FREQUENCY_BUCKET) continue

    const cell = cells[1].replace(/<[^>]+>/g, '').replace(/\\/g, '')
    for (const token of decodeEntities(cell).trim().split(/\s+/)) {
      if (!token) continue
      ranked.push(toCodepoints(token))
    }
  }

  return ranked
}

/** Collects "<codepoints>.webp" asset names from the jsDelivr package listing. */
function collectAssetKeys(node, into) {
  for (const entry of node.files ?? []) {
    if (entry.type === 'file' && entry.name.endsWith('.webp')) {
      into.add(entry.name.slice(0, -'.webp'.length))
    }
    if (entry.files) collectAssetKeys(entry, into)
  }
  return into
}

/** Every alias/name is folded into one lowercase search string. */
function searchTerms(emoji) {
  const seen = new Set()
  for (const term of [emoji.name, ...(emoji.short_names ?? [])]) {
    if (!term || term.length > 28) continue
    seen.add(term.toLowerCase())
  }
  return [...seen].join(',')
}

const [frequencyHtml, datasource, listing] = await Promise.all([
  fetchText(FREQUENCY_URL),
  fetchJson(DATASOURCE_URL),
  fetchJson(LISTING_URL),
])

const assetKeys = collectAssetKeys(listing, new Set())

const metadata = new Map()
for (const emoji of datasource) {
  const category = CATEGORY_SLUGS[emoji.category]
  if (category) metadata.set(String(emoji.unified).toLowerCase(), { ...emoji, category })
}

const entries = []
const seen = new Set()
for (const codepoints of parseRankedEmoji(frequencyHtml)) {
  if (seen.has(codepoints) || !assetKeys.has(codepoints)) continue
  const emoji = metadata.get(codepoints)
  if (!emoji) continue

  seen.add(codepoints)
  entries.push([codepoints, searchTerms(emoji), emoji.category])
}

// Tabs follow this order; only categories that survived the cutoff are emitted.
const categoryOrder = Object.values(CATEGORY_SLUGS).filter((slug) =>
  entries.some((entry) => entry[2] === slug),
)

const usage = '//   [codepoints, searchTerms, category]'
const body = entries
  .map(([key, terms, category]) => `  ['${key}','${terms.replace(/'/g, "\\'")}','${category}'],`)
  .join('\n')

const file = `// AUTO-GENERATED by scripts/generate-emoji-3d.mjs — do not edit by hand.
//
// The most frequently used emoji (Unicode median frequency and above), drawn as
// Microsoft Fluent Emoji 3D (MIT) from the jsDelivr npm CDN:
//   https://cdn.jsdelivr.net/npm/@lobehub/fluent-emoji-3d@${FLUENT_3D_VERSION}/assets/<codepoints>.webp
//
// ${entries.length} emoji, ordered by frequency, each verified to have a 3D asset.
${usage}
export type EmojiCategory =
${Object.values(CATEGORY_SLUGS)
  .map((slug) => `  | '${slug}'`)
  .join('\n')}

/** Base URL for the 3D assets. Append \`<codepoints>.webp\`. */
export const FLUENT_3D_CDN =
  'https://cdn.jsdelivr.net/npm/@lobehub/fluent-emoji-3d@${FLUENT_3D_VERSION}/assets'

export const EMOJI_CATEGORY_LABELS: Record<EmojiCategory, string> = {
${Object.entries(CATEGORY_SLUGS)
  .map(([label, slug]) => `  ${slug}: '${label}',`)
  .join('\n')}
}

/** Categories that have emoji in the dataset, in tab order. */
export const EMOJI_CATEGORY_ORDER: EmojiCategory[] = [
${categoryOrder.map((slug) => `  '${slug}',`).join('\n')}
]

/** ${entries.length} entries as [codepoints, searchTerms, category] tuples, most used first. */
export const EMOJI_DATA: ReadonlyArray<readonly [string, string, EmojiCategory]> = [
${body}
]
`

await mkdir(dirname(OUTPUT), { recursive: true })
await writeFile(OUTPUT, file, 'utf8')

const perCategory = categoryOrder.map(
  (slug) => `${slug}=${entries.filter((entry) => entry[2] === slug).length}`,
)
console.log(`Wrote ${entries.length} emoji to ${OUTPUT}`)
console.log(perCategory.join('  '))
