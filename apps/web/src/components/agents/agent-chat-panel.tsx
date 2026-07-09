import { useState, useCallback, useRef } from 'react'
import { Brain, AlertCircle } from 'lucide-react'
import { ChatPanel } from '@/components/shared/chat-panel'
import { Badge } from '@/components/ui/badge'
import { agents as agentsApi } from '@/lib/api'
import { cn } from '@/lib/utils'

interface MessageItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface AgentChatPanelProps {
  agentConfig: {
    name: string
    model: string
    systemPrompt: string
    temperature: number
    maxTokens: number
    providerKeyId?: string
  }
  className?: string
}

export function AgentChatPanel({ agentConfig, className }: AgentChatPanelProps) {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const configRef = useRef(agentConfig)
  configRef.current = agentConfig

  const handleClear = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
    setMessages([])
    setStreaming(false)
    setStreamingContent('')
  }, [])

  const handleSendMessage = useCallback(async (content: string) => {
    const config = configRef.current
    if (!config.systemPrompt || !config.model) return

    setStreaming(true)
    setStreamingContent('')

    const userMessage: MessageItem = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])

    const history = messages
      .filter((m) => m.id !== userMessage.id)
      .map((m) => ({ role: m.role, content: m.content }))

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const response = await agentsApi.testStream({
        model: config.model,
        systemPrompt: config.systemPrompt,
        message: content,
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        providerKeyId: config.providerKeyId,
        history,
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || `Request failed (${response.status})`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let assistantContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantContent += parsed.content
                setStreamingContent(assistantContent)
              }
              if (parsed.error) {
                throw new Error(parsed.error)
              }
            } catch (e) {
              if (e instanceof Error && e.message !== 'No response body') throw e
            }
          }
        }
      }

      if (assistantContent) {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: assistantContent,
            createdAt: new Date().toISOString(),
          },
        ])
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      console.error('Agent chat error:', err)
    } finally {
      setStreaming(false)
      setStreamingContent('')
      abortRef.current = null
    }
  }, [messages])

  const canSend = !!(agentConfig.systemPrompt && agentConfig.model)

  return (
    <ChatPanel
      messages={messages}
      streaming={streaming}
      streamingContent={streamingContent}
      onSendMessage={handleSendMessage}
      onClear={handleClear}
      placeholder={canSend ? 'Test your agent...' : 'Add a system prompt and model to start testing'}
      className={cn('min-h-[500px]', className)}
      agentName={agentConfig.name}
      header={
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="size-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold">Live Test</span>
          {agentConfig.model && (
            <Badge variant="secondary" className="text-[10px] font-normal">
              {agentConfig.model}
            </Badge>
          )}
          {!canSend && (
            <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
              <AlertCircle className="size-3 mr-1" />
              Config needed
            </Badge>
          )}
        </div>
      }
    />
  )
}
