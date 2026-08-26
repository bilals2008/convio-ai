import { useCallback, useRef, useState } from 'react'
import { agents } from '@/lib/api'

export interface ToolCallEntry {
  tool: string
  args?: Record<string, unknown>
  result?: unknown
  status: 'calling' | 'done'
}

export interface PlaygroundMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  reasoning?: string
  toolActivity?: ToolCallEntry[]
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
}

export interface PlaygroundConfig {
  model: string
  systemPrompt: string
  temperature?: number
  maxTokens?: number
  reasoningEffort?: string
  providerKeyId?: string
  knowledgeBaseId?: string | null
  tools?: string[]
  mcpServerIds?: string[]
  guardrails?: { enabled: boolean; blockedWords: string[]; restrictedTopics: string[] }
}

let counter = 0
const nextId = () => `pg-${Date.now()}-${counter++}`

function toFriendlyStreamError(raw: string): string {
  const lower = (raw || '').toLowerCase()

  if (lower.includes('api key') || lower.includes('apikey') || lower.includes('authentication')
    || lower.includes('unauthorized') || lower.includes('401')) {
    return 'No valid API key for this provider. Add your key in Settings → Provider Keys and try again.'
  }
  if ((lower.includes('no provider configured') || lower.includes('model')) && (lower.includes('not found') || lower.includes('does not exist'))) {
    return 'This model is not available for the configured provider. Pick a different model.'
  }
  if (lower.includes('rate limit') || lower.includes('429') || lower.includes('quota') || lower.includes('insufficient')) {
    return 'The provider is rate-limiting requests. Wait a moment and try again.'
  }
  if (lower.includes('upstream') || lower.includes('503') || lower.includes('overloaded') || lower.includes('unavailable')) {
    return 'The provider is temporarily overloaded. Try again in a few seconds.'
  }
  if (lower.includes('knowledge base') || lower.includes('not found')) {
    return 'The connected knowledge base could not be loaded. Check it in Settings.'
  }
  return raw || 'Something went wrong while generating a response. Please try again.'
}

async function readStreamError(response: Response): Promise<string> {
  const text = await response.text().catch(() => '')
  const match = text.match(/data:\s*(\{.*\})/)
  if (match) {
    try {
      const parsed = JSON.parse(match[1])
      if (parsed.error) return String(parsed.error)
    } catch { /* not JSON */ }
  }
  try {
    const parsed = JSON.parse(text)
    if (parsed.error) return String(parsed.error)
    if (parsed.message) return String(parsed.message)
  } catch { /* not JSON */ }
  return `Request failed (${response.status})`
}

export function usePlaygroundChat() {
  const [messages, setMessages] = useState<PlaygroundMessage[]>([])
  const [status, setStatus] = useState<'idle' | 'streaming'>('idle')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setMessages([])
    setError(null)
    setStatus('idle')
  }, [])

  const send = useCallback(
    async (text: string, config: PlaygroundConfig) => {
      const trimmed = text.trim()
      if (!trimmed || abortRef.current || !config.model || !config.systemPrompt) return
      setError(null)

      const history = messages.map((m) => ({ role: m.role, content: m.content }))
      const assistantId = nextId()
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', content: trimmed },
        { id: assistantId, role: 'assistant', content: '' },
      ])

      const controller = new AbortController()
      abortRef.current = controller
      setStatus('streaming')

      const appendChunk = (chunk: string) =>
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
        )
      const patchAssistant = (patch: Partial<PlaygroundMessage>) =>
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)))

      try {
        const response = await agents.testStream({
          model: config.model,
          systemPrompt: config.systemPrompt,
          message: trimmed,
          temperature: config.temperature ?? 0.7,
          maxTokens: config.maxTokens ?? 2048,
          reasoningEffort: config.reasoningEffort,
          providerKeyId: config.providerKeyId,
          knowledgeBaseId: config.knowledgeBaseId ?? null,
          tools: config.tools ?? [],
          mcpServerIds: config.mcpServerIds ?? [],
          guardrails: config.guardrails,
          history,
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(toFriendlyStreamError(await readStreamError(response)))
        }
        if (!response.body) throw new Error('No response body')

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let reasoning = ''
        const toolCalls: ToolCallEntry[] = []

        while (true) {
          let readRes: Awaited<ReturnType<typeof reader.read>>
          try {
            readRes = await reader.read()
          } catch (e) {
            // Stop pressed mid-read — keep what we have.
            if (abortRef.current === controller) throw e
            break
          }
          if (readRes.done) break

          buffer += decoder.decode(readRes.value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const payload = line.slice(6)
            if (payload === '[DONE]') continue
            const chunk = JSON.parse(payload) as {
              type?: string
              content?: string
              error?: string
              tool?: string
              args?: Record<string, unknown>
              result?: unknown
              usage?: { promptTokens: number; completionTokens: number; totalTokens: number }
            }
            if (chunk.error) throw new Error(toFriendlyStreamError(chunk.error))
            if (chunk.type === 'error') {
              throw new Error(toFriendlyStreamError(chunk.content || 'Generation failed'))
            }
            if (chunk.type === 'text' && chunk.content) appendChunk(chunk.content)
            if (chunk.type === 'reasoning' && chunk.content) {
              reasoning += chunk.content
              patchAssistant({ reasoning })
            }
            if (chunk.type === 'tool_call' && chunk.tool) {
              toolCalls.push({ tool: chunk.tool, args: chunk.args, status: 'calling' })
              patchAssistant({ toolActivity: [...toolCalls] })
            }
            if (chunk.type === 'tool_result' && chunk.tool) {
              for (const tc of toolCalls) {
                if (tc.tool === chunk.tool && tc.status === 'calling') {
                  tc.result = chunk.result
                  tc.status = 'done'
                }
              }
              patchAssistant({ toolActivity: [...toolCalls] })
            }
            if (chunk.type === 'usage' && chunk.usage) patchAssistant({ usage: chunk.usage })
          }
        }
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          setError(err instanceof Error ? err.message : 'Something went wrong')
        }
      } finally {
        abortRef.current = null
        setStatus('idle')
        setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content))
      }
    },
    [messages],
  )

  return { messages, status, error, send, stop, reset }
}
