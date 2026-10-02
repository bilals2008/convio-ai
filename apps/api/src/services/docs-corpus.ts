import { createHash } from 'crypto'
import { prisma } from '@convio/database'
import { embedText } from './processor.js'
import { rerank } from './reranker.js'

/**
 * The docs AI assistant's retrieval store. One global index of the public
 * documentation markdown (not org-scoped), one row per heading-level section so
 * a citation can point at an exact anchor.
 *
 * Vectors are 384-d to match the bundled local embedder, which is also what
 * `embedText` uses when no organization is given. The table, HNSW index and
 * full-text index are created by a Prisma migration, but `ensureDocsChunkTable`
 * re-creates them idempotently so a database set up via `db push` self-heals.
 */

/** Cosine distance ceiling. Calibrated for all-MiniLM-L6-v2; see processor.ts. */
const MAX_DISTANCE = 0.85
const VECTOR_CANDIDATES = 20
const KEYWORD_CANDIDATES = 20
const RERANK_CANDIDATES = 12
const DEFAULT_TOP_K = 6
/** Reciprocal Rank Fusion damping. */
const RRF_K = 60
/** Small tiebreak so a hit on the page the reader is already on wins close calls. */
const CURRENT_PAGE_BOOST = 0.02

export interface CorpusChunk {
  id: string
  slug: string
  title: string
  heading: string
  anchor: string
  url: string
  content: string
  hash: string
  position: number
}

export interface DocsSource {
  index: number
  slug: string
  title: string
  heading: string
  url: string
  snippet: string
}

/** Full chunk text, used to ground the model. Never sent to the client verbatim. */
export interface RetrievedSource {
  index: number
  slug: string
  title: string
  heading: string
  url: string
  content: string
}

interface RetrievedRow {
  id: string
  slug: string
  title: string
  heading: string
  url: string
  content: string
}

export function docsSlugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/** Public URL for a doc section, matching the web router (`/docs/*`, hash anchors). */
export function docsUrl(slug: string, anchor: string): string {
  const base = slug ? `/docs/${slug}` : '/docs'
  return anchor ? `${base}#${anchor}` : base
}

const sha1 = (value: string) => createHash('sha1').update(value).digest('hex')
const sha256 = (value: string) => createHash('sha256').update(value).digest('hex')

/**
 * Split one markdown file into section chunks keyed by heading, so a citation
 * can deep-link to `#anchor`. Fence-aware: `##` inside a code block is content,
 * not a heading. The page intro (before the first H2) becomes its own chunk.
 */
export function chunkMarkdownDoc(slug: string, raw: string): CorpusChunk[] {
  const title = /^#\s+(.+)$/m.exec(raw)?.[1]?.trim() ?? slug ?? 'Untitled'

  type Section = { heading: string; anchor: string; lines: string[] }
  const sections: Section[] = []
  let current: Section = { heading: title, anchor: '', lines: [] }
  let inFence = false

  for (const line of raw.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) inFence = !inFence

    if (!inFence) {
      const match = /^(#{2,3})\s+(.+)$/.exec(line)
      if (match) {
        sections.push(current)
        const heading = match[2].trim()
        current = { heading, anchor: docsSlugify(heading), lines: [line] }
        continue
      }
      // Drop the leading `# Title` — the page title is carried separately.
      if (/^#\s+/.test(line) && sections.length === 0 && current.lines.length === 0) continue
    }

    current.lines.push(line)
  }
  sections.push(current)

  const chunks: CorpusChunk[] = []
  let position = 0

  for (const section of sections) {
    const content = section.lines.join('\n').trim()
    if (content.replace(/^#+\s+.*$/gm, '').trim().length === 0) continue

    chunks.push({
      id: sha1(`${slug}::${section.anchor}`),
      slug,
      title,
      heading: section.heading,
      anchor: section.anchor,
      url: docsUrl(slug, section.anchor),
      content,
      hash: sha256(content),
      position: position++,
    })
  }

  return chunks
}

/** Idempotent DDL so the index works on a database that predates the migration. */
export async function ensureDocsChunkTable(): Promise<void> {
  const statements = [
    `CREATE EXTENSION IF NOT EXISTS vector`,
    `CREATE TABLE IF NOT EXISTS "DocsChunk" (
       "id" TEXT NOT NULL,
       "slug" TEXT NOT NULL,
       "title" TEXT NOT NULL,
       "heading" TEXT NOT NULL,
       "anchor" TEXT NOT NULL,
       "url" TEXT NOT NULL,
       "content" TEXT NOT NULL,
       "hash" TEXT NOT NULL,
       "position" INTEGER NOT NULL DEFAULT 0,
       "embedding" vector(384),
       "updatedAt" TIMESTAMP(3) NOT NULL,
       CONSTRAINT "DocsChunk_pkey" PRIMARY KEY ("id")
     )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "DocsChunk_slug_anchor_key" ON "DocsChunk"("slug", "anchor")`,
    `CREATE INDEX IF NOT EXISTS "DocsChunk_slug_idx" ON "DocsChunk"("slug")`,
    `CREATE INDEX IF NOT EXISTS "DocsChunk_slug_position_idx" ON "DocsChunk"("slug", "position")`,
    `CREATE INDEX IF NOT EXISTS "DocsChunk_embedding_hnsw" ON "DocsChunk" USING hnsw ("embedding" vector_cosine_ops)`,
    `CREATE INDEX IF NOT EXISTS "DocsChunk_content_fts_idx" ON "DocsChunk" USING gin (to_tsvector('english', "title" || ' ' || "heading" || ' ' || "content"))`,
  ]

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql)
    } catch (err) {
      console.warn('[DocsCorpus] DDL statement failed:', err instanceof Error ? err.message : err)
    }
  }
}

export async function getExistingDocsHashes(): Promise<Map<string, string>> {
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string; hash: string }>>(
    `SELECT "id", "hash" FROM "DocsChunk"`,
  )
  return new Map(rows.map((row) => [row.id, row.hash]))
}

/** Insert or update one chunk. `embedding` null leaves the existing vector intact. */
export async function upsertDocsChunk(chunk: CorpusChunk, embedding: number[] | null): Promise<void> {
  const vectorStr = embedding ? `[${embedding.join(',')}]` : null
  await prisma.$executeRawUnsafe(
    `INSERT INTO "DocsChunk"
       ("id", "slug", "title", "heading", "anchor", "url", "content", "hash", "position", "embedding", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::vector, now())
     ON CONFLICT ("id") DO UPDATE SET
       "slug" = EXCLUDED."slug",
       "title" = EXCLUDED."title",
       "heading" = EXCLUDED."heading",
       "anchor" = EXCLUDED."anchor",
       "url" = EXCLUDED."url",
       "content" = EXCLUDED."content",
       "hash" = EXCLUDED."hash",
       "position" = EXCLUDED."position",
       "embedding" = COALESCE(EXCLUDED."embedding", "DocsChunk"."embedding"),
       "updatedAt" = now()`,
    chunk.id,
    chunk.slug,
    chunk.title,
    chunk.heading,
    chunk.anchor,
    chunk.url,
    chunk.content,
    chunk.hash,
    chunk.position,
    vectorStr,
  )
}

/** Remove chunks no longer present in the source docs (deleted pages/sections). */
export async function deleteDocsChunksExcept(ids: string[]): Promise<number> {
  if (ids.length === 0) {
    const result = await prisma.$executeRawUnsafe(`DELETE FROM "DocsChunk"`)
    return Number(result)
  }
  const result = await prisma.$executeRawUnsafe(
    `DELETE FROM "DocsChunk" WHERE "id" <> ALL($1::text[])`,
    ids,
  )
  return Number(result)
}

export interface DocsIndexStatus {
  ready: boolean
  chunks: number
}

export async function getDocsIndexStatus(): Promise<DocsIndexStatus> {
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{ total: number; embedded: number }>>(
      `SELECT COUNT(*)::int AS total, COUNT("embedding")::int AS embedded FROM "DocsChunk"`,
    )
    const total = rows[0]?.total ?? 0
    const embedded = rows[0]?.embedded ?? 0
    return { ready: total > 0 && embedded > 0, chunks: total }
  } catch {
    return { ready: false, chunks: 0 }
  }
}

export function snippetOf(content: string): string {
  const text = content
    .replace(/^#+\s+.*$/gm, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 240 ? `${text.slice(0, 237)}…` : text
}

/** Client-safe citations: index, link target and a short preview — no full text. */
export function toCitations(sources: RetrievedSource[]): DocsSource[] {
  return sources.map((source) => ({
    index: source.index,
    slug: source.slug,
    title: source.title,
    heading: source.heading,
    url: source.url,
    snippet: snippetOf(source.content),
  }))
}

/**
 * Hybrid retrieval: pgvector cosine search fused with Postgres full-text search
 * via Reciprocal Rank Fusion, a small boost for the reader's current page, then
 * an optional cross-encoder rerank. Falls back to keyword-only if the local
 * embedding model is unavailable.
 */
export async function retrieveDocs(
  query: string,
  options: { currentSlug?: string; topK?: number } = {},
): Promise<RetrievedSource[]> {
  const topK = options.topK ?? DEFAULT_TOP_K
  const trimmed = query.trim()
  if (!trimmed) return []

  const [embedding, keywordRows] = await Promise.all([
    embedText(trimmed).catch(() => null),
    searchKeyword(trimmed).catch(() => [] as RetrievedRow[]),
  ])

  const vectorRows = embedding ? await searchVector(embedding).catch(() => [] as RetrievedRow[]) : []

  const fused = new Map<string, { row: RetrievedRow; score: number }>()
  const add = (row: RetrievedRow, rank: number) => {
    const entry = fused.get(row.id) ?? { row, score: 0 }
    entry.score += 1 / (RRF_K + rank)
    fused.set(row.id, entry)
  }

  vectorRows.forEach((row, index) => add(row, index + 1))
  keywordRows.forEach((row, index) => add(row, index + 1))

  const candidates = [...fused.values()]
  if (candidates.length === 0) return []

  const currentSlug = options.currentSlug
  if (currentSlug) {
    for (const entry of candidates) {
      if (entry.row.slug === currentSlug) entry.score += CURRENT_PAGE_BOOST
    }
  }

  candidates.sort((a, b) => b.score - a.score)
  const shortlist = candidates.slice(0, RERANK_CANDIDATES).map((entry) => entry.row)

  const ranked =
    shortlist.length > topK
      ? await rerank(trimmed, shortlist, topK)
      : shortlist

  return ranked.map((row, index) => ({
    index: index + 1,
    slug: row.slug,
    title: row.title,
    heading: row.heading,
    url: row.url,
    content: row.content,
  }))
}

async function searchVector(embedding: number[]): Promise<RetrievedRow[]> {
  const vectorStr = `[${embedding.join(',')}]`
  return prisma.$queryRawUnsafe<RetrievedRow[]>(
    `SELECT "id", "slug", "title", "heading", "url", "content"
     FROM "DocsChunk"
     WHERE "embedding" IS NOT NULL
       AND ("embedding" <=> $1::vector) <= $3
     ORDER BY "embedding" <=> $1::vector
     LIMIT $2`,
    vectorStr,
    VECTOR_CANDIDATES,
    MAX_DISTANCE,
  )
}

async function searchKeyword(query: string): Promise<RetrievedRow[]> {
  return prisma.$queryRawUnsafe<RetrievedRow[]>(
    `SELECT "id", "slug", "title", "heading", "url", "content",
            ts_rank(to_tsvector('english', "title" || ' ' || "heading" || ' ' || "content"),
                    websearch_to_tsquery('english', $1))::float8 AS rank
     FROM "DocsChunk"
     WHERE to_tsvector('english', "title" || ' ' || "heading" || ' ' || "content")
           @@ websearch_to_tsquery('english', $1)
     ORDER BY rank DESC
     LIMIT $2`,
    query,
    KEYWORD_CANDIDATES,
  )
}
