import { safeFetchText } from '../ssrf.js'

export interface UrlFetchResult {
  title?: string
  content: string
  error?: string
}

export async function fetchUrl(url: string): Promise<UrlFetchResult> {
  if (!url || typeof url !== 'string') {
    return { content: '', error: 'No URL provided' }
  }

  let normalizedUrl = url
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl
  }

  try {
    new URL(normalizedUrl)
  } catch {
    return { content: '', error: 'Invalid URL format' }
  }

  try {
    const { contentType, text: raw } = await safeFetchText(normalizedUrl, {
      headers: {
        'User-Agent': 'Convio/1.0 (Document Fetcher; +https://convio.app)',
        Accept: 'text/html,text/plain,application/json;q=0.9,*/*;q=0.8',
      },
    }, 5, 15_000)

    let title = ''
    const titleMatch = raw.match(/<title[^>]*>([^<]*)<\/title>/i)
    if (titleMatch) {
      title = titleMatch[1].trim()
    }

    let content: string
    if (contentType.includes('text/html') || raw.includes('<html') || raw.includes('<!DOCTYPE')) {
      content = htmlToText(raw)
    } else if (contentType.includes('application/json') || normalizedUrl.endsWith('.json')) {
      try {
        content = JSON.stringify(JSON.parse(raw), null, 2)
      } catch {
        content = raw
      }
    } else {
      content = raw
    }

    const maxLength = 5000
    if (content.length > maxLength) {
      content = content.slice(0, maxLength) + '\n\n[Content truncated...]'
    }

    return { title: title || undefined, content: content || '(empty page)' }
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { content: '', error: 'Request timed out after 15 seconds' }
    }
    return { content: '', error: `Failed to fetch: ${(err as Error).message}` }
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<\/(p|div|h[1-6]|li|tr|br|hr|section|article|blockquote)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
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
