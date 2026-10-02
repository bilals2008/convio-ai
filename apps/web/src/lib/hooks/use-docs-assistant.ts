import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getDocsAssistantStatus,
  streamDocsAssistant,
  type DocsAssistantHistoryMessage,
  type DocsAssistantSource,
  type DocsAssistantStreamChunk,
} from '@/lib/api/docs-assistant'

export interface DocsAssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: DocsAssistantSource[]
  status: 'streaming' | 'done' | 'error'
}

const MAX_HISTORY = 8

let counter = 0
const nextId = () => `docs-${Date.now()}-${counter++}`

function buildHistory(messages: DocsAssistantMessage[]): DocsAssistantHistoryMessage[] {
  const history: DocsAssistantHistoryMessage[] = []
  for (const message of messages) {
    if (message.status === 'streaming' || !message.content.trim()) continue
    if (message.role === 'user' || message.role === 'assistant') {
      history.push({ role: message.role, content: message.content })
    }
  }
  return history.slice(-MAX_HISTORY)
}

export function useDocsAssistantStatus() {
  return useQuery({
    queryKey: ['docs-assistant', 'status'],
    queryFn: getDocsAssistantStatus,
    staleTime: 60_000,
    retry: false,
  })
}

export function useDocsAssistant() {
  const [messages, setMessages] = useState<DocsAssistantMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const requestInFlightRef = useRef(false)
  const messagesRef = useRef<DocsAssistantMessage[]>(messages)
  const lastQuestionRef = useRef<{ question: string; slug?: string } | null>(null)

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  const patch = useCallback((id: string, patch: Partial<DocsAssistantMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }, [])

  const append = useCallback((id: string, text: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, content: m.content + text } : m)))
  }, [])

  const ask = useCallback(
    async (question: string, slug?: string) => {
      const trimmed = question.trim()
      if (!trimmed || requestInFlightRef.current) return
      requestInFlightRef.current = true

      lastQuestionRef.current = { question: trimmed, slug }
      setError(null)

      const history = buildHistory(messagesRef.current)
      const assistantId = nextId()

      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', content: trimmed, status: 'done' },
        { id: assistantId, role: 'assistant', content: '', status: 'streaming' },
      ])

      const controller = new AbortController()
      abortRef.current = controller
      setIsStreaming(true)

      try {
        const response = await streamDocsAssistant(
          { question: trimmed, slug, history },
          controller.signal,
        )

        if (!response.ok) {
          const data = await response.json().catch(() => null)
          const message =
            response.status === 401
              ? 'Your session has expired. Sign in again to use the assistant.'
              : response.status === 429
                ? 'You are asking too fast — please wait a moment and try again.'
                : (data?.error || data?.message || `Request failed (${response.status})`)
          throw new Error(message)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('Stream unavailable')

        const decoder = new TextDecoder()
        let buffer = ''
        let streamError: string | null = null

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6)
            if (payload === '[DONE]') continue

            let chunk: DocsAssistantStreamChunk
            try {
              chunk = JSON.parse(payload)
            } catch {
              continue
            }

            if (chunk.type === 'sources') {
              patch(assistantId, { sources: chunk.sources })
            } else if (chunk.type === 'text' && chunk.content) {
              append(assistantId, chunk.content)
            } else if (chunk.type === 'error') {
              streamError = chunk.content
            }
          }
        }

        if (streamError) {
          setError(streamError)
          patch(assistantId, { status: 'error' })
        } else {
          patch(assistantId, { status: 'done' })
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          patch(assistantId, { status: 'done' })
        } else {
          const message = err instanceof Error ? err.message : 'Something went wrong.'
          setError(message)
          patch(assistantId, { status: 'error' })
        }
      } finally {
        requestInFlightRef.current = false
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [append, patch],
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const retry = useCallback(() => {
    const last = lastQuestionRef.current
    if (!last) return
    // Remove the failed exchange so the retry reads as a fresh answer.
    setMessages((prev) => prev.filter((m) => m.status !== 'error'))
    void ask(last.question, last.slug)
  }, [ask])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setError(null)
    lastQuestionRef.current = null
  }, [])

  return { messages, isStreaming, error, ask, stop, retry, reset }
}
