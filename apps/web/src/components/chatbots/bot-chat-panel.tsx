import { useState, useCallback, useRef } from 'react'
import { ChatPanel } from '@/components/shared/chat-panel'
import { agents as agentsApi } from '@/lib/api'
import { cn } from '@/lib/utils'

interface MessageItem {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface BotChatPanelProps {
  botName: string
  widgetColor: string
  avatar: string
  agentConfig: {
    model: string
    systemPrompt: string
    temperature: number
    maxTokens: number
    providerKeyId?: string
  }
  className?: string
}

export function BotChatPanel({ botName, widgetColor, avatar, agentConfig, className }: BotChatPanelProps) {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [streaming, setStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const configRef = useRef(agentConfig)
  configRef.current = agentConfig

  const displayName = botName || 'Bot'
  const initial = displayName.charAt(0).toUpperCase()

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

      if (!response.ok) throw new Error(`Request failed (${response.status})`)

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
      console.error('Bot chat error:', err)
    } finally {
      setStreaming(false)
      setStreamingContent('')
      abortRef.current = null
    }
  }, [messages])

  const canSend = !!(agentConfig.systemPrompt && agentConfig.model)

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border shadow-lg overflow-hidden',
        className
      )}
    >
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ backgroundColor: widgetColor || '#fb923c' }}
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-white/20 shrink-0">
          {avatar ? (
            <img src={avatar} alt={displayName} className="size-8 rounded-full object-cover" />
          ) : (
            <span className="text-white text-sm font-bold">{initial}</span>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-white text-sm">{displayName}</h4>
          <p className="text-xs text-white/80">{streaming ? 'Typing...' : 'Online'}</p>
        </div>
      </div>

      <ChatPanel
        messages={messages}
        streaming={streaming}
        streamingContent={streamingContent}
        onSendMessage={handleSendMessage}
        onClear={handleClear}
        placeholder={canSend ? 'Test your chatbot...' : 'Select an agent with a model and prompt'}
        className="border-none rounded-none flex-1"
        botName={displayName}
        botAvatar={avatar}
        header={undefined}
      />
    </div>
  )
}
