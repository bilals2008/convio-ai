import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, MessageSquare, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/loading'
import { TypingIndicator } from '@/components/shared/typing-indicator'
import { Button } from '@/components/ui/button'
import { ConversationStatusBadge } from '@/components/conversations/conversation-status-badge'
import type { ConvStatus } from '@/components/conversations/conversation-status-badge'
import { MessageList } from '@/components/conversations/message-list'
import { MessageInput } from '@/components/conversations/message-input'
import { ConversationStats } from '@/components/conversations/conversation-stats'
import { conversations as conversationsApi, messages as messagesApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'
type MessageRole = 'user' | 'assistant' | 'system'
type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'error'

interface MessageItem {
  id: string
  role: MessageRole
  content: string
  status?: MessageStatus
  createdAt: string
}

interface ConversationDetail {
  id: string
  userId?: string
  userName?: string
  agentName: string
  agentId: string
  channel: Channel
  status: ConvStatus
  messageCount: number
  createdAt: string
  updatedAt: string
  messages: MessageItem[]
}

export default function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [sending, setSending] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [typingAgents, setTypingAgents] = useState<string[]>([])
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const presenceRef = useRef<{ online: boolean }>({ online: false })

  const broadcastTyping = useCallback(() => {
    if (!id) return
    supabase.channel(`conversation:${id}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: {},
    })
  }, [id])

  const handleInputChange = () => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    broadcastTyping()
    typingTimerRef.current = setTimeout(() => {
      supabase.channel(`conversation:${id}`).send({
        type: 'broadcast',
        event: 'typing_stop',
        payload: {},
      })
    }, 2000)
  }

  useEffect(() => {
    if (!id) return

    const channel = supabase.channel(`conversation:${id}`, {
      config: { broadcast: { self: true } },
    })

    channel.on('broadcast', { event: 'message' }, () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', id] })
    })

    channel.on('broadcast', { event: 'typing' }, () => {
      setTypingAgents(['Agent'])
      setTimeout(() => setTypingAgents([]), 3000)
    })

    channel.on('broadcast', { event: 'typing_stop' }, () => {
      setTypingAgents([])
    })

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
  }, [id, queryClient])

  const { data: conversation, isLoading } = useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      const res = await conversationsApi.get(id!)
      const raw = res.data.data
      return {
        ...raw,
        agentName: raw.agent?.name || raw.agentName || 'Unknown Agent',
        agentId: raw.agent?.id || raw.agentId,
      } as ConversationDetail
    },
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: (status: ConvStatus) => conversationsApi.update(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', id] })
    },
  })

  const [error, setError] = useState<string | null>(null)

  const handleSendMessage = async (content: string) => {
    if (!id) return
    setSending(true)
    setStreaming(true)
    setStreamingContent('')
    setError(null)

    try {
      await messagesApi.send(id, content)

      const { data: { session } } = await supabase.auth.getSession()
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      const response = await fetch(`${baseURL}/conversations/${id}/messages/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ role: 'user', content }),
      })

      if (!response.ok) {
        const errBody = await response.json().catch(() => null)
        throw new Error(errBody?.message || 'Stream request failed')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''
      let streamError: string | null = null

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
              if (parsed.error) {
                streamError = parsed.error
              } else if (parsed.content) {
                fullContent += parsed.content
                setStreamingContent(fullContent)
              }
            } catch { /* skip malformed JSON */ }
          }
        }
      }

      if (streamError) {
        setError(streamError)
        toast.error(streamError)
      }

      queryClient.invalidateQueries({ queryKey: ['conversation', id] })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send message'
      setError(msg)
      toast.error(msg)
      queryClient.invalidateQueries({ queryKey: ['conversation', id] })
    } finally {
      setSending(false)
      setStreaming(false)
      setStreamingContent('')
    }
  }

  const handleStatusChange = (status: ConvStatus) => {
    statusMutation.mutate(status)
  }

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Loading..." />
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </PageContainer>
    )
  }

  if (!conversation) {
    return (
      <PageContainer>
        <PageHeader title="Conversation not found" />
        <Button variant="outline" onClick={() => navigate('/conversations')}>
          <ArrowLeft className="size-4" />
          Back to conversations
        </Button>
      </PageContainer>
    )
  }

  const isClosed = conversation.status === 'closed' || conversation.status === 'archived'

  const displayMessages = (conversation.messages || []) as MessageItem[]

  return (
    <PageContainer>
      <PageHeader
        title={`Conversation with ${conversation.userName || 'Anonymous'}`}
        description=""
        action={
          <div className="flex items-center gap-3">
            <ConversationStatusBadge status={conversation.status} />
            <Button variant="outline" onClick={() => navigate('/conversations')}>
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 flex flex-col rounded-xl border bg-card min-h-[500px]">
          <MessageList
            messages={displayMessages}
            loading={isLoading}
            streamingMessage={streaming ? { role: 'assistant', content: streamingContent, id: 'streaming', createdAt: new Date().toISOString(), status: 'sending' } : undefined}
          />

          {typingAgents.length > 0 && !streaming && (
            <div className="flex items-center gap-2 px-4 pb-1 text-xs text-muted-foreground">
              <MessageSquare className="size-3 text-primary" />
              <span>{typingAgents.join(', ')} is typing</span>
              <TypingIndicator className="scale-75 origin-left" />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 px-4 pb-2 text-xs text-destructive">
              <AlertCircle className="size-3 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <MessageInput
            onSend={handleSendMessage}
            loading={sending}
            disabled={isClosed}
            onInputChange={handleInputChange}
            placeholder={
              isClosed
                ? 'This conversation is closed'
                : 'Type a message...'
            }
          />
        </div>

        <div className="lg:col-span-1">
          <ConversationStats
            userName={conversation.userName}
            agentName={conversation.agentName}
            channel={conversation.channel}
            status={conversation.status}
            messageCount={conversation.messageCount}
            createdAt={conversation.createdAt}
            updatedAt={conversation.updatedAt}
            onStatusChange={handleStatusChange}
            loading={statusMutation.isPending}
          />
        </div>
      </div>
    </PageContainer>
  )
}
