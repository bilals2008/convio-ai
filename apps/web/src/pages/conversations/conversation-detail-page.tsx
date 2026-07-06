import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { PageContainer } from '@/components/shared/page-container'
import { PageHeader } from '@/components/shared/page-header'
import { Skeleton } from '@/components/shared/loading'
import { Button } from '@/components/ui/button'
import { ConversationStatusBadge } from '@/components/conversations/conversation-status-badge'
import type { ConvStatus } from '@/components/conversations/conversation-status-badge'
import { MessageList } from '@/components/conversations/message-list'
import { MessageInput } from '@/components/conversations/message-input'
import { ConversationStats } from '@/components/conversations/conversation-stats'
import { conversations as conversationsApi, messages as messagesApi } from '@/lib/api'

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
  botName: string
  botId: string
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

  const { data: conversation, isLoading } = useQuery({
    queryKey: ['conversation', id],
    queryFn: async () => {
      const res = await conversationsApi.get(id!)
      return res.data.data as ConversationDetail
    },
    enabled: !!id,
  })

  const statusMutation = useMutation({
    mutationFn: (status: ConvStatus) => conversationsApi.update(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation', id] })
    },
  })

  const handleSendMessage = async (content: string) => {
    if (!id) return
    setSending(true)
    try {
      await messagesApi.send(id, content)
      queryClient.invalidateQueries({ queryKey: ['conversation', id] })
    } finally {
      setSending(false)
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
            messages={conversation.messages || []}
            loading={isLoading}
          />
          <MessageInput
            onSend={handleSendMessage}
            loading={sending}
            disabled={isClosed}
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
            botName={conversation.botName}
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
