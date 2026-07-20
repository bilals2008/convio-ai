/**
 * Markdown → Web/Widget formatter.
 *
 * Web widgets render markdown natively (via a markdown renderer), so we
 * return the text as-is. This exists for consistency with other channels.
 */
export function formatForWeb(text: string): string {
  return text
}
