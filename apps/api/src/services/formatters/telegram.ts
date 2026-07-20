/**
 * Markdown → Telegram HTML formatter.
 *
 * Telegram Bot API supports HTML parse mode:
 *   <b> <i> <s> <u> <code> <pre> <a href=""> <blockquote>
 *
 * It does NOT support # headings or - bullet lists directly.
 * We escape HTML special chars first, then convert markdown to HTML tags.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function formatForTelegram(text: string): string {
  const codeBlocks: string[] = []

  let result = text.replace(/```([\s\S]*?)```/g, (_, code) => {
    codeBlocks.push(code)
    return `\x00CODE_BLOCK_${codeBlocks.length - 1}\x00`
  })

  const inlineCodes: string[] = []
  result = result.replace(/`([^`]+?)`/g, (_, code) => {
    inlineCodes.push(code)
    return `\x00INLINE_CODE_${inlineCodes.length - 1}\x00`
  })

  const links: { text: string; url: string }[] = []
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, linkText, url) => {
    links.push({ text: linkText, url })
    return `\x00LINK_${links.length - 1}\x00`
  })

  result = escapeHtml(result)

  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '<b><i>$1</i></b>')
  result = result.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
  result = result.replace(/(^|[^*])\*(?!\s)([^*]+?)\*(?!\S)/g, '$1<i>$2</i>')
  result = result.replace(/__(.+?)__/g, '<u>$1</u>')
  result = result.replace(/~~(.+?)~~/g, '<s>$1</s>')

  result = result.replace(/^#{1,3}\s+(.+)$/gm, '<b>$1</b>')

  result = result.replace(/^[-*]\s+(.+)$/gm, '• $1')

  result = result.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')

  result = result.replace(/\x00INLINE_CODE_(\d+)\x00/g, (_, i) => `<code>${escapeHtml(inlineCodes[Number(i)])}</code>`)
  result = result.replace(/\x00CODE_BLOCK_(\d+)\x00/g, (_, i) => `<pre>${escapeHtml(codeBlocks[Number(i)])}</pre>`)
  result = result.replace(/\x00LINK_(\d+)\x00/g, (_, i) => {
    const link = links[Number(i)]
    return `<a href="${escapeHtml(link.url)}">${escapeHtml(link.text)}</a>`
  })

  result = result.replace(/\n{3,}/g, '\n\n')

  return result.trim()
}
