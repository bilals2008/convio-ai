/**
 * Markdown → Discord embed formatter.
 *
 * Discord embeds support most markdown but NOT # headings (they render
 * as plain text). We convert headings to bold and clean up other minor issues.
 */
export function formatForDiscord(text: string): string {
  let result = text

  result = result.replace(/^#{1,3}\s+(.+)$/gm, '**$1**')

  result = result.replace(/\n{3,}/g, '\n\n')

  return result.trim()
}
