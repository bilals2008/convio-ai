import { convert } from '@opendataloader/pdf'
import { prisma } from '@convio/database'
import { getProviderById } from '@convio/ai/providers'
import { downloadFile } from '../lib/storage.js'
import { mkdtemp, rm, writeFile, readFile, readdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const CHUNK_SIZE = 1000
const CHUNK_OVERLAP_WORDS = 40
/** Cosine distance upper bound (similarity ≈ 1 - distance). 0.75 ≈ 0.25 similarity. */
const MAX_DISTANCE = 0.75
const DEFAULT_TOP_K = 5

function chunkText(text: string): string[] {
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean)
  const chunks: string[] = []
  let current = ''

  for (const p of paragraphs) {
    const trimmed = p.trim()
    if (!trimmed) continue

    if (current.length + trimmed.length > CHUNK_SIZE && current.length > 0) {
      chunks.push(current.trim())
      const overlapWords = current.split(/\s+/).slice(-CHUNK_OVERLAP_WORDS).join(' ')
      current = overlapWords + '\n\n' + trimmed
    } else {
      current += (current ? '\n\n' : '') + trimmed
    }
  }

  // Fallback: long single blocks without blank lines
  if (!chunks.length && text.trim()) {
    const words = text.trim().split(/\s+/)
    let buf: string[] = []
    let len = 0
    for (const w of words) {
      if (len + w.length + 1 > CHUNK_SIZE && buf.length > 0) {
        chunks.push(buf.join(' '))
        const overlap = buf.slice(-CHUNK_OVERLAP_WORDS)
        buf = [...overlap, w]
        len = buf.join(' ').length
      } else {
        buf.push(w)
        len += w.length + 1
      }
    }
    if (buf.length) chunks.push(buf.join(' '))
    return chunks
  }

  if (current.trim()) chunks.push(current.trim())
  return chunks
}

/**
 * all-MiniLM-L6-v2 is 384-d — matches DocumentChunk vector(384).
 * Prefers OpenAI when OPENAI_API_KEY is set, else uses local transformers.js model.
 */
export async function embedText(text: string): Promise<number[] | null> {
  const providerId = process.env.OPENAI_API_KEY ? 'openai' : 'local'
  const provider = getProviderById(providerId)
  if (!provider) return null

  try {
    return await provider.embed(text)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[Embeddings] embed failed (${providerId}):`, message)
    return null
  }
}

async function deleteChunks(documentId: string): Promise<void> {
  await prisma.$executeRawUnsafe(
    `DELETE FROM "DocumentChunk" WHERE "documentId" = $1`,
    documentId,
  )
}

async function storeChunks(documentId: string, chunks: string[]): Promise<number> {
  let stored = 0

  for (const chunk of chunks) {
    if (!chunk.trim()) continue

    const embedding = await embedText(chunk)
    const vectorStr = embedding ? `[${embedding.join(',')}]` : null

    await prisma.$executeRawUnsafe(
      `INSERT INTO "DocumentChunk" ("id", "documentId", "content", "embedding", "createdAt")
       VALUES ($1, $2, $3, $4::vector, $5)`,
      crypto.randomUUID(),
      documentId,
      chunk,
      vectorStr,
      new Date(),
    )
    stored++
  }

  return stored
}

async function extractPdfMarkdown(filePath: string): Promise<string> {
  const tmpDir = await mkdtemp(join(tmpdir(), 'convio-pdf-'))
  try {
    await convert([filePath], {
      outputDir: tmpDir,
      format: 'markdown',
    })

    const files = await readdir(tmpDir)
    const mdFile = files.find((f) => f.endsWith('.md'))
    if (!mdFile) throw new Error('No markdown output from PDF conversion')

    return await readFile(join(tmpDir, mdFile), 'utf-8')
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}

async function fetchUrlContent(url: string): Promise<string> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20_000)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Convio-RAG/1.0 (+https://convio.app)',
        Accept: 'text/html,application/xhtml+xml,text/plain,application/json;q=0.9,*/*;q=0.8',
      },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch URL (${res.status})`)
    }

    const contentType = res.headers.get('content-type') || ''
    const raw = await res.text()

    if (contentType.includes('application/json') || url.endsWith('.json')) {
      try {
        return JSON.stringify(JSON.parse(raw), null, 2)
      } catch {
        return raw
      }
    }

    if (contentType.includes('text/html') || raw.includes('<html') || raw.includes('<!DOCTYPE')) {
      return htmlToText(raw)
    }

    return raw
  } finally {
    clearTimeout(timeout)
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(p|div|h[1-6]|li|tr|br|hr|section|article|header|footer)>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

async function resolveDocumentText(
  doc: {
    id: string
    type: string
    content: string | null
    url: string | null
    fileKey: string | null
  },
  pdfPath?: string,
): Promise<string> {
  switch (doc.type) {
    case 'pdf': {
      if (pdfPath) {
        return extractPdfMarkdown(pdfPath)
      }
      if (doc.fileKey) {
        const buffer = await downloadFile(doc.fileKey)
        const tmpPath = join(tmpdir(), `convio-reprocess-${doc.id}.pdf`)
        await writeFile(tmpPath, buffer)
        try {
          return await extractPdfMarkdown(tmpPath)
        } finally {
          await rm(tmpPath, { force: true }).catch(() => {})
        }
      }
      if (doc.content?.trim()) return doc.content
      throw new Error('PDF has no file or content to process')
    }
    case 'url': {
      if (!doc.url) throw new Error('URL document is missing a URL')
      return fetchUrlContent(doc.url)
    }
    case 'txt':
    case 'csv':
    case 'md':
    case 'json': {
      if (!doc.content?.trim()) throw new Error('Document has no content to index')
      return doc.content
    }
    default:
      throw new Error(`Unsupported document type: ${doc.type}`)
  }
}

/**
 * Index a document: extract text → chunk → embed → store in pgvector.
 * Safe to call for create and reprocess.
 */
export async function processDocument(
  documentId: string,
  options?: { pdfPath?: string },
): Promise<void> {
  const doc = await prisma.document.findUnique({ where: { id: documentId } })
  if (!doc) throw new Error('Document not found')

  await prisma.document.update({
    where: { id: documentId },
    data: { status: 'processing' },
  })

  try {
    const text = await resolveDocumentText(doc, options?.pdfPath)
    if (!text.trim()) throw new Error('Extracted content is empty')

    const chunks = chunkText(text)
    if (!chunks.length) throw new Error('No chunks produced from document')

    await deleteChunks(documentId)
    const stored = await storeChunks(documentId, chunks)

    if (stored === 0) throw new Error('Failed to store any chunks')

    // Warn via status if embeddings are missing (no OpenAI key)
    const withEmbeddings = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
      `SELECT COUNT(*)::bigint AS count FROM "DocumentChunk"
       WHERE "documentId" = $1 AND "embedding" IS NOT NULL`,
      documentId,
    )
    const embeddedCount = Number(withEmbeddings[0]?.count ?? 0)
    if (embeddedCount === 0) {
      throw new Error(
        'Chunks stored but embeddings failed. The all-MiniLM-L6-v2 model may still be downloading.',
      )
    }

    await prisma.document.update({
      where: { id: documentId },
      data: {
        content: text.slice(0, 200_000),
        status: 'ready',
      },
    })
  } catch (err) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'error' },
    })
    throw err instanceof Error ? err : new Error('Document processing failed')
  }
}

/** @deprecated Prefer processDocument — kept for existing PDF upload call sites. */
export async function processPdf(filePath: string, documentId: string): Promise<void> {
  return processDocument(documentId, { pdfPath: filePath })
}

export type RetrievedChunk = {
  content: string
  documentName: string
  documentId: string
  distance: number
}

/**
 * Semantic search over a knowledge base. Returns grounded context string for the system prompt.
 */
export async function retrieveContext(
  query: string,
  knowledgeBaseId: string,
  limit = DEFAULT_TOP_K,
): Promise<string> {
  const embedding = await embedText(query)
  if (!embedding) return ''

  const vectorStr = `[${embedding.join(',')}]`

  const rows = await prisma.$queryRawUnsafe<
    Array<{
      content: string
      documentName: string
      documentId: string
      distance: number
    }>
  >(
    `SELECT
       dc."content",
       d."name" AS "documentName",
       d."id" AS "documentId",
       (dc."embedding" <=> $2::vector) AS distance
     FROM "DocumentChunk" dc
     JOIN "Document" d ON d."id" = dc."documentId"
     WHERE d."knowledgeBaseId" = $1
       AND d."status" = 'ready'
       AND dc."embedding" IS NOT NULL
       AND (dc."embedding" <=> $2::vector) <= $4
     ORDER BY dc."embedding" <=> $2::vector
     LIMIT $3`,
    knowledgeBaseId,
    vectorStr,
    limit,
    MAX_DISTANCE,
  )

  if (!rows?.length) return ''

  return rows
    .map(
      (r, i) =>
        `[Source ${i + 1}: ${r.documentName}]\n${r.content}`,
    )
    .join('\n\n---\n\n')
}

export async function retrieveChunks(
  query: string,
  knowledgeBaseId: string,
  limit = DEFAULT_TOP_K,
): Promise<RetrievedChunk[]> {
  const embedding = await embedText(query)
  if (!embedding) return []

  const vectorStr = `[${embedding.join(',')}]`
  const rows = await prisma.$queryRawUnsafe<RetrievedChunk[]>(
    `SELECT
       dc."content",
       d."name" AS "documentName",
       d."id" AS "documentId",
       (dc."embedding" <=> $2::vector)::float8 AS distance
     FROM "DocumentChunk" dc
     JOIN "Document" d ON d."id" = dc."documentId"
     WHERE d."knowledgeBaseId" = $1
       AND d."status" = 'ready'
       AND dc."embedding" IS NOT NULL
       AND (dc."embedding" <=> $2::vector) <= $4
     ORDER BY dc."embedding" <=> $2::vector
     LIMIT $3`,
    knowledgeBaseId,
    vectorStr,
    limit,
    MAX_DISTANCE,
  )

  return rows ?? []
}
