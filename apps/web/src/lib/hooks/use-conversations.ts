import { useInfiniteQuery } from '@tanstack/react-query'
import { conversations as conversationsApi } from '@/lib/api'

export type ConversationStatus = 'active' | 'waiting' | 'resolved' | 'closed' | 'archived'

export interface ConversationItem {
  id: string
  userId?: string
  userName?: string
  agentName: string
  agentId: string
  channel: string
  status: ConversationStatus
  messageCount: number
  lastMessage?: string
  messages?: Array<{ content: string }>
  updatedAt: string
}

interface ConversationPage {
  data: ConversationItem[]
  nextCursor: string | null
}

export const conversationKeys = {
  list: (orgId: string, status: string) => ['conversations', orgId, status] as const,
}

export function useConversations(orgId: string | undefined, status: string) {
  return useInfiniteQuery({
    queryKey: conversationKeys.list(orgId ?? 'none', status),
    queryFn: async ({ pageParam, signal }): Promise<ConversationPage> => {
      const res = await conversationsApi.list(
        {
          organizationId: orgId,
          status: status === 'all' ? undefined : status,
          cursor: pageParam,
          limit: 20,
        },
        { signal },
      )
      return res.data as ConversationPage
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: Boolean(orgId),
  })
}
