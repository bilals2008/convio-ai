import { convert } from '@opendataloader/pdf'
import { prisma } from '@convio/database'
import { getProviderById } from '@convio/ai/providers'
import { mkdtemp, rm, writeFile, readFile, readdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 200

function chunkText(text: string): string[] {
  const paragraphs = text.split(/\n\s*\n/).filter(Boolean)
  const chunks: string[] = []
  let current = ''

  for (const p of paragraphs) {
    const trimmed = p.trim()
    if (!trimmed) continue

    if (current.length + trimmed.length > CHUNK_SIZE && current.length > 0) {
      chunks.push(current.trim())
      const overlapWords = current.split(' ').slice(-40).join(' ')
      current = overlapWords + '\n\n' + trimmed
    } else {
      current += (current ? '\n\n' : '') + trimmed
    }
  }

  if (current.trim()) chunks.push(current.trim())
  return chunks
}

export async function processPdf(
  filePath: string,
  documentId: string,
): Promise<void> {
  await prisma.document.update({ where: { id: documentId }, data: { status: 'processing' } })

  const tmpDir = await mkdtemp(join(tmpdir(), 'convio-pdf-'))
  try {
    await convert([filePath], {
      outputDir: tmpDir,
      format: 'markdown',
    })

    const files = await readdir(tmpDir)
    const mdFile = files.find((f) => f.endsWith('.md'))
    if (!mdFile) throw new Error('No markdown output from PDF conversion')

    const markdown = await readFile(join(tmpDir, mdFile), 'utf-8')
    const chunks = chunkText(markdown)

    const openaiProvider = getProviderById('openai')
    const googleProvider = getProviderById('google')

    for (let i = 0; i < chunks.length; i++) {
      let embedding: number[] | null = null

      if (openaiProvider) {
        try {
          embedding = await openaiProvider.embed(chunks[i])
        } catch {
          try {
            if (googleProvider) embedding = await googleProvider.embed(chunks[i])
          } catch {}
        }
      }

      const vectorStr = embedding ? `[${embedding.join(',')}]` : null

      await prisma.$executeRawUnsafe(
        `INSERT INTO "DocumentChunk" ("id", "documentId", "content", "embedding", "createdAt")
         VALUES ($1, $2, $3, $4::vector, $5)`,
        crypto.randomUUID(),
        documentId,
        chunks[i],
        vectorStr,
        new Date(),
      )
    }

    await prisma.document.update({
      where: { id: documentId },
      data: { content: markdown, status: 'ready' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'PDF processing failed'
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'error' },
    })
    throw new Error(msg)
  } finally {
    await rm(tmpDir, { recursive: true, force: true })
  }
}

export async function retrieveContext(
  query: string,
  knowledgeBaseId: string,
  limit = 5,
): Promise<string> {
  const openaiProvider = getProviderById('openai')
  const googleProvider = getProviderById('google')

  let embedding: number[] | null = null
  if (openaiProvider) {
    try {
      embedding = await openaiProvider.embed(query)
    } catch {
      try {
        if (googleProvider) embedding = await googleProvider.embed(query)
      } catch {}
    }
  }

  if (!embedding) return ''

  const vectorStr = `[${embedding.join(',')}]`
  const rows = await prisma.$queryRawUnsafe<Array<{ content: string }>>(
    `SELECT dc."content"
     FROM "DocumentChunk" dc
     JOIN "Document" d ON d."id" = dc."documentId"
     WHERE d."knowledgeBaseId" = $1 AND dc."embedding" IS NOT NULL
     ORDER BY dc."embedding" <=> $2::vector
     LIMIT $3`,
    knowledgeBaseId,
    vectorStr,
    limit,
  )

  if (!rows?.length) return ''
  return rows.map((r) => r.content).join('\n\n---\n\n')
}
