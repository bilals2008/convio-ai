import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, MessageSquare, AlertCircle, MoreVertical, CheckCircle, Archive, Trash2, Clock } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChannelBadge } from '@/components/shared/channel-badge'
import { toast } from '@/lib/toast'
import { Skeleton } from '@/components/shared/loading'
import { TypingIndicator } from '@/components/shared/typing-indicator'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MessageList } from './message-list'
import { MessageInput } from './message-input'
import { ConversationStatusBadge } from './conversation-status-badge'
import type { ConvStatus } from './conversation-status-badge'
import { conversations as conversationsApi, messages as messagesApi } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Channel = 'web' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'api'
type MessageRole = 'user' | 'assistant' | 'system'
type MessageStatus = 'sending' | 'sent' | 'error'

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

function getInitials(name: string | undefined): string {
  if (!name) return 'A'
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function ChatView() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [sending, setSending] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [streamingReasoning, setStreamingReasoning] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [typingAgents, setTypingAgents] = useState<string[]>([])
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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
      config: { broadcast: { self: false } },
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
    onError: (err: Error) => toast.error(err.message || 'Could not update status'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => conversationsApi.delete(id!),
    onSuccess: () => {
      toast.success('Conversation deleted')
      navigate('/conversations')
    },
    onError: (err: Error) => toast.error(err.message || 'Could not delete conversation'),
  })

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
      let fullReasoning = ''
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
              } else if (parsed.type === 'reasoning') {
                fullReasoning += parsed.content
                setStreamingReasoning(fullReasoning)
              } else if (parsed.content) {
                fullContent += parsed.content
                setStreamingContent(fullContent)
              }
            } catch (e) { console.warn('Malformed SSE chunk:', data, e) }
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

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className={i % 2 === 0 ? 'flex gap-2' : 'flex flex-row-reverse gap-2'}>
              <Skeleton className="size-8 rounded-full shrink-0" />
              <Skeleton className={i % 2 === 0 ? 'h-10 w-48 rounded-xl' : 'h-10 w-36 rounded-xl'} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    )
  }

  const isClosed = conversation.status === 'closed' || conversation.status === 'archived'
  const displayMessages = (conversation.messages || []) as MessageItem[]

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden size-8"
          onClick={() => navigate('/conversations')}
        >
          <ArrowLeft className="size-4" />
        </Button>

        <Avatar size="lg" className="shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {getInitials(conversation.userName)}
          </AvatarFallback>
          <ChannelBadge channel={conversation.channel} />
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">
              {conversation.userName || 'Anonymous'}
            </span>
            <ConversationStatusBadge status={conversation.status} />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{conversation.agentName}</span>
            <span>·</span>
            <span className="capitalize">{conversation.channel}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "size-8")}>
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {conversation.status !== 'active' && (
                <DropdownMenuItem onClick={() => statusMutation.mutate('active')}>
                  <Clock className="size-4" />
                  Mark as Active
                </DropdownMenuItem>
              )}
              {conversation.status !== 'waiting' && (
                <DropdownMenuItem onClick={() => statusMutation.mutate('waiting')}>
                  <Clock className="size-4" />
                  Mark as Waiting
                </DropdownMenuItem>
              )}
              {conversation.status !== 'resolved' && (
                <DropdownMenuItem onClick={() => statusMutation.mutate('resolved')}>
                  <CheckCircle className="size-4" />
                  Resolve
                </DropdownMenuItem>
              )}
              {conversation.status !== 'closed' && (
                <DropdownMenuItem onClick={() => statusMutation.mutate('closed')}>
                  <Archive className="size-4" />
                  Close
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={displayMessages}
        loading={isLoading}
        streamingMessage={streaming ? { role: 'assistant', content: streamingContent, id: 'streaming', createdAt: new Date().toISOString(), status: 'sending', reasoning: streamingReasoning } : undefined}
        streamingReasoning={streamingReasoning}
      />

      {typingAgents.length > 0 && !streaming && (
        <div className="flex items-center gap-2 px-4 pb-1 text-xs text-muted-foreground">
          <MessageSquare className="size-3 text-primary" />
          <span>{typingAgents.join(', ')} is typing</span>
          <TypingIndicator className="scale-75 origin-left" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 pb-2 text-xs text-destructive" role="alert" aria-live="polite">
          <AlertCircle className="size-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Message Input */}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
