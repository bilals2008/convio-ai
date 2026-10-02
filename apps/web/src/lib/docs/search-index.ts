import { extractHeadings } from './markdown'

export interface SearchItem {
  slug: string
  title: string
  description: string
  section: string
  /** What cmdk fuzzy-matches against. Body is truncated — full text is not worth scanning per keystroke. */
  haystack: string
}

const files = import.meta.glob('/src/content/docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const humanize = (value: string) =>
  value
    .replace(/[-/]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

/** Built on demand — this module is dynamically imported so the corpus stays out of the main bundle. */
export function buildSearchIndex(): SearchItem[] {
  const corpus = Object.entries(files)
    .map(([path, raw]) => {
      const slug = path
        .replace(/^\/src\/content\/docs\//, '')
        .replace(/\.md$/, '')
        .replace(/\/index$/, '')

      const title = /^#\s+(.+)$/m.exec(raw)?.[1]?.trim() ?? slug
      const description =
        raw
          .split('\n')
          .map((line) => line.trim())
          .find((line) => line && !line.startsWith('#') && !line.startsWith('```')) ?? ''
      const headings = extractHeadings(raw)
        .map((heading) => heading.text)
        .join(' ')

      return {
        slug,
        title,
        description,
        section: humanize(slug.includes('/') ? slug.split('/')[0] : 'Overview'),
        haystack: `${title} ${description} ${headings} ${raw.slice(0, 600)}`,
      }
    })

  // The templates gallery is a React page with no markdown file, so nothing in the glob
  // above can ever describe it. Its section is the sidebar group it sits under.
  const templates: SearchItem = {
    slug: 'templates',
    title: 'Agent templates',
    description: 'Ready-made system prompts with model, temperature, and tool defaults, applied in one click.',
    section: 'Build',
    haystack:
      'agent templates prompt gallery copy paste customer support sales faq tutor recruiter writer meeting summarizer productivity education business',
  }

  return [...corpus, templates].sort((a, b) => a.title.localeCompare(b.title))
}
