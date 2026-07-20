/**
 * Markdown → WhatsApp text formatter.
 *
 * WhatsApp supports a limited subset of formatting:
 *   *bold*  _italic_  ~strikethrough~  `code`  ```code block```
 *   > quote
 *
 * It does NOT support:
 *   **double asterisks**  # headings  - bullet lists  [text](url)  tables
 */
export function formatForWhatsApp(text: string): string {
  let result = text

  result = result.replace(/```([\s\S]*?)```/g, (_, code) => `\`\`\`${code}\`\`\``)

  result = result.replace(/\*\*\*(.+?)\*\*\*/g, '*_$1_*')

  result = result.replace(/\*\*(.+?)\*\*/g, '*$1*')

  result = result.replace(/(^|[^*])\*(?!\s)([^*]+?)\*(?!\S)/g, '$1_$2_')

  result = result.replace(/~~(.+?)~~/g, '~$1~')

  result = result.replace(/^#{1}\s+(.+)$/gm, '*$1*')
  result = result.replace(/^#{2,}\s+(.+)$/gm, '*$1*')

  result = result.replace(/^[-*]\s+(.+)$/gm, '• $1')

  result = result.replace(/^\d+\.\s+(.+)$/gm, (match, item) => match.replace(/^\d+\./, '•').replace(item, item))

  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')

  result = result.replace(/^\|(.+)\|$/gm, (_, content) =>
    content.split('|').map((c: string) => c.trim()).filter(Boolean).join(' | ')
  )

  result = result.replace(/\n{3,}/g, '\n\n')

  return result.trim()
}
