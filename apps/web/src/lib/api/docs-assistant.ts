import { supabase } from '@/lib/supabase'
import api from './client'

export interface DocsAssistantSource {
  index: number
  slug: string
  title: string
  heading: string
  url: string
  snippet: string
}

export interface DocsAssistantHistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface DocsAssistantStreamBody {
  question: string
  slug?: string
  history?: DocsAssistantHistoryMessage[]
}

export type DocsAssistantStreamChunk =
  | { type: 'sources'; sources: DocsAssistantSource[] }
  | { type: 'text'; content: string }
  | { type: 'reasoning'; content: string }
  | { type: 'done'; usage?: { promptTokens: number; completionTokens: number; totalTokens: number } }
  | { type: 'error'; content: string }

export interface DocsAssistantStatus {
  ready: boolean
  chunks: number
}

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

/** SSE-over-fetch so the Authorization header can ride along (EventSource can't). */
export async function streamDocsAssistant(
  body: DocsAssistantStreamBody,
  signal?: AbortSignal,
): Promise<Response> {
  const { data } = await supabase.auth.getSession()
  return fetch(`${baseURL}/docs/assistant/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session?.access_token ?? ''}`,
    },
    body: JSON.stringify(body),
    signal,
  })
}

export async function getDocsAssistantStatus(): Promise<DocsAssistantStatus> {
  const res = await api.get('/docs/assistant/status')
  return res.data.data as DocsAssistantStatus
}
