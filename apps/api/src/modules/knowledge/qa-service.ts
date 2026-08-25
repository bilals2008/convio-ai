// Q&A pairs: structured source of truth for editing + one DocumentChunk per pair
// for RAG. Chunk id == QuestionAnswer id, so sync is a simple upsert by id.

import { prisma } from '@convio/database'
import { AppError } from '../../plugins/error.js'
import { embedText } from '../../services/processor.js'

const QA_DOC_NAME = 'Q&A Pairs'

/** Get (or lazily create) the hidden per-KB document that holds Q&A chunks. */
export async function getOrCreateQaDocument(knowledgeBaseId: string): Promise<{ id: string }> {
  const existing = await prisma.document.findFirst({
    where: { knowledgeBaseId, type: 'qa' },
    select: { id: true },
  })
  if (existing) return existing

  const created = await prisma.document.create({
    data: {
      knowledgeBaseId,
      name: QA_DOC_NAME,
      type: 'qa',
      status: 'ready',
    },
    select: { id: true },
  })
  return created
}

function chunkContent(question: string, answer: string): string {
  return `Q: ${question}\nA: ${answer}`
}

/** Create or replace the RAG chunk for a Q&A pair (re-embeds on every change). */
export async function syncQaChunk(qa: { id: string; documentId: string; question: string; answer: string }): Promise<void> {
  const content = chunkContent(qa.question, qa.answer)
  const embedding = await embedText(content)
  const vectorStr = embedding ? `[${embedding.join(',')}]` : null

  await prisma.$executeRawUnsafe(
    `INSERT INTO "DocumentChunk" ("id", "documentId", "content", "embedding", "createdAt")
     VALUES ($1, $2, $3, $4::vector, now())
     ON CONFLICT ("id") DO UPDATE SET "content" = $3, "embedding" = $4::vector`,
    qa.id,
    qa.documentId,
    content,
    vectorStr,
  )
}

export async function deleteQaChunk(qaId: string): Promise<void> {
  await prisma.$executeRawUnsafe(`DELETE FROM "DocumentChunk" WHERE "id" = $1`, qaId)
}

export async function getQaOrThrow(qaId: string) {
  const qa = await prisma.questionAnswer.findUnique({
    where: { id: qaId },
    include: { document: { select: { knowledgeBase: { select: { organizationId: true } } } } },
  })
  if (!qa) throw new AppError(404, 'Q&A pair not found')
  return qa
}
