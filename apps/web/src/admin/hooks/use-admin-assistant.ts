import { useState, useCallback, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminApi,
  type AdminAssistantStreamChunk,
} from '@/admin/services/admin-api'

export function useAdminConversations() {
  return useQuery({
    queryKey: ['admin', 'assistant', 'conversations'],
    queryFn: async () => {
      const res = await adminApi.assistant.conversations()
      return res.data.data
    },
  })
}

export function useAdminMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['admin', 'assistant', 'conversations', conversationId, 'messages'],
    queryFn: async () => {
      if (!conversationId) return []
      const res = await adminApi.assistant.messages(conversationId)
      return res.data.data
    },
    enabled: !!conversationId,
  })
}

export function useAdminAssistantLogs() {
  return useQuery({
    queryKey: ['admin', 'assistant', 'logs'],
    queryFn: async () => {
      const res = await adminApi.assistant.logs()
      return res.data.data
    },
    refetchInterval: 30_000,
  })
}

export function useCreateAdminConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => adminApi.assistant.createConversation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'assistant', 'conversations'] })
    },
  })
}

export function useDeleteAdminConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.assistant.deleteConversation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'assistant', 'conversations'] })
    },
  })
}

export interface StreamOptions {
  onChunk?: (chunk: AdminAssistantStreamChunk) => void
  onFinal?: () => void
}

export function useAdminAssistantStream() {
  const [isStreaming, setIsStreaming] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const stream = useCallback(
    async (body: { content: string; conversationId?: string }, opts?: StreamOptions) => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setIsStreaming(true)

      try {
        const response = await adminApi.assistant.stream(body, controller.signal)
        if (!response.ok) {
          const err = await response.json().catch(() => null)
          throw new Error(err?.error || `Stream failed (${response.status})`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let streamError: string | null = null

        while (true) {
          const { done, value } = await reader!.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data) as AdminAssistantStreamChunk
              if (parsed.type === 'error') {
                streamError = parsed.content || 'Generation failed'
                continue
              }
              opts?.onChunk?.(parsed)
            } catch {
              // malformed frame — skip
            }
          }
        }

        if (streamError) throw new Error(streamError)
      } finally {
        setIsStreaming(false)
        opts?.onFinal?.()
        abortRef.current = null
      }
    },
    [],
  )

  const abort = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { stream, abort, isStreaming }
}