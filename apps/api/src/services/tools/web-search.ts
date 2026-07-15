export interface WebSearchResult {
  title: string
  url: string
  snippet: string
}

export async function webSearch(query: string): Promise<WebSearchResult[]> {
  const apiKey = process.env.SEARCH_API_KEY
  const engineId = process.env.SEARCH_ENGINE_ID

  if (apiKey && engineId) {
    return googleSearch(query, apiKey, engineId)
  }

  return fallbackSearch(query)
}

async function googleSearch(query: string, apiKey: string, engineId: string): Promise<WebSearchResult[]> {
  const res = await fetch(
    `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${encodeURIComponent(query)}&num=5`
  )

  if (!res.ok) {
    throw new Error(`Google Search API error (${res.status})`)
  }

  const data = await res.json() as {
    items?: Array<{ title: string; link: string; snippet: string }>
  }

  return (data.items ?? []).map((item) => ({
    title: item.title,
    url: item.link,
    snippet: item.snippet,
  }))
}

async function fallbackSearch(query: string): Promise<WebSearchResult[]> {
  try {
    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`,
      { headers: { 'User-Agent': 'Convio/1.0' } }
    )

    if (!res.ok) return []

    const data = await res.json() as {
      AbstractText?: string
      AbstractURL?: string
      Heading?: string
      RelatedTopics?: Array<{ Text?: string; FirstURL?: string; Result?: string }>
    }

    const results: WebSearchResult[] = []

    if (data.AbstractText) {
      results.push({
        title: data.Heading || 'Result',
        url: data.AbstractURL || '',
        snippet: data.AbstractText,
      })
    }

    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 4)) {
        if (topic.Text) {
          results.push({
            title: topic.Text.split(' - ')[0] || 'Result',
            url: topic.FirstURL || '',
            snippet: topic.Text,
          })
        }
      }
    }

    return results
  } catch {
    return []
  }
}
