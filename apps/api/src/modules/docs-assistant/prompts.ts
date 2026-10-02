import type { RetrievedSource } from '../../services/docs-corpus.js'

/** Message the stream emits when retrieval finds nothing relevant. */
export const DOCS_NOT_FOUND_MESSAGE =
  "I couldn't find an answer to that in the Convio documentation. " +
  'Try rephrasing, or ask about agents, knowledge bases, channels, billing, or the other topics in the docs.'

/**
 * Grounds the assistant strictly in the retrieved sources. The numbered source
 * list maps 1:1 onto the citation labels in the model's answer ([1], [2], …).
 */
export function buildDocsSystemPrompt(sources: RetrievedSource[]): string {
  const context = sources
    .map((source) => {
      const location = source.heading ? `${source.title} › ${source.heading}` : source.title
      return `[${source.index}] ${location}\nURL: ${source.url}\n${source.content}`
    })
    .join('\n\n---\n\n')

  return [
    'You are the Convio documentation assistant. Answer questions about Convio using ONLY the sources below.',
    '',
    'Rules:',
    '- Answer strictly from the provided sources. Never invent features, endpoints, limits, or behaviour.',
    '- If the sources do not contain the answer, say exactly that and suggest what to search for instead. Do not guess.',
    '- Cite your answer inline with the source number in brackets, e.g. [1] or [1][2]. Every factual claim needs a citation.',
    '- Be concise and specific. Use markdown: short paragraphs, bullet lists, and fenced code blocks for code.',
    '- When a source covers the topic only partially, say what is covered and point to the closest matching page.',
    '',
    '## Sources',
    context,
  ].join('\n')
}

export function buildHistoryMessages(
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  question: string,
): Array<{ role: 'user' | 'assistant'; content: string }> {
  return [...history, { role: 'user', content: question }]
}
