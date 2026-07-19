export interface WebSearchResult {
  title: string
  url: string
  snippet: string
}

const TAVILY_ENDPOINT = 'https://api.tavily.com/search'

export async function webSearch(query: string): Promise<WebSearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    throw new Error(
      'Web search is not configured. Set TAVILY_API_KEY in the environment (get a free key at https://tavily.com).'
    )
  }

  return tavilySearch(query, apiKey)
}

async function tavilySearch(query: string, apiKey: string): Promise<WebSearchResult[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  try {
    const res = await fetch(TAVILY_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        search_depth: 'basic',
        max_results: 5,
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => null) as { error?: string } | null
      throw new Error(err?.error || `Tavily API error (${res.status})`)
    }

    const data = await res.json() as {
      results?: Array<{ title?: string; url?: string; content?: string }>
    }

    return (data.results ?? []).map((item) => ({
      title: item.title || 'Result',
      url: item.url || '',
      snippet: item.content || '',
    }))
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Web search timed out after 15 seconds')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
