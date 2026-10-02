import { config } from 'dotenv'
import { resolve, dirname, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../../../../.env') })

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { embedText } from '../services/processor.js'
import {
  chunkMarkdownDoc,
  deleteDocsChunksExcept,
  ensureDocsChunkTable,
  getDocsIndexStatus,
  getExistingDocsHashes,
  upsertDocsChunk,
  type CorpusChunk,
} from '../services/docs-corpus.js'

/**
 * Index the public documentation markdown into pgvector for the docs assistant.
 *
 *   pnpm --filter @convio/api docs:ingest
 *
 * Idempotent and cheap to re-run: unchanged chunks (same content hash) are not
 * re-embedded, and chunks whose page/section was removed are deleted.
 */

const DEFAULT_DOCS_DIR = resolve(__dirname, '../../../../apps/web/src/content/docs')

async function collectMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort()
}

function slugFromPath(docsDir: string, filePath: string): string {
  return relative(docsDir, filePath)
    .replace(/\\/g, '/')
    .replace(/\.md$/, '')
    .replace(/\/index$/, '')
}

async function main(): Promise<void> {
  const docsDir = process.env.DOCS_CONTENT_DIR
    ? resolve(process.env.DOCS_CONTENT_DIR)
    : DEFAULT_DOCS_DIR

  console.log(`[DocsIngest] Reading markdown from ${docsDir}`)
  await ensureDocsChunkTable()

  const files = await collectMarkdownFiles(docsDir)
  const chunks: CorpusChunk[] = []
  for (const filePath of files) {
    const raw = await readFile(filePath, 'utf-8')
    chunks.push(...chunkMarkdownDoc(slugFromPath(docsDir, filePath), raw))
  }

  const existing = await getExistingDocsHashes()
  let embedded = 0
  let unchanged = 0
  let failed = 0

  for (const chunk of chunks) {
    if (existing.get(chunk.id) === chunk.hash) {
      unchanged++
      continue
    }

    const vector = await embedText(chunk.content)
    if (!vector) {
      failed++
      console.warn(`[DocsIngest] Embedding failed for ${chunk.slug}#${chunk.anchor}`)
    } else {
      embedded++
    }
    await upsertDocsChunk(chunk, vector)
  }

  const removed = await deleteDocsChunksExcept(chunks.map((chunk) => chunk.id))
  const status = await getDocsIndexStatus()

  console.log(
    `[DocsIngest] ${files.length} files → ${chunks.length} chunks ` +
      `(${embedded} embedded, ${unchanged} unchanged, ${failed} failed, ${removed} removed)`,
  )
  console.log(`[DocsIngest] Index status: ${status.chunks} chunks, ready=${status.ready}`)

  if (failed > 0) {
    console.warn(
      '[DocsIngest] Some chunks have no embedding. Retrieval still works via keyword search, ' +
        'but re-run once the local embedding model can be downloaded (or the network is available).',
    )
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[DocsIngest] Failed:', err instanceof Error ? err.message : err)
    process.exit(1)
  })
