import api from './client'

export interface DailyBreakdown {
  date: string
  totalConversations: number
  totalMessages: number
  uniqueUsers: number
  avgResponseTime: number
  inputTokens: number
  outputTokens: number
}

export interface ChannelBreakdown {
  channel: string
  count: number
}

export interface OrgAnalyticsResponse {
  totalConversations: number
  totalMessages: number
  uniqueUsers: number
  avgResponseTime: number
  totalInputTokens: number
  totalOutputTokens: number
  successRate: number
  conversationsChange: number
  messagesChange: number
  usersChange: number
  responseTimeChange: number
  channelBreakdown: ChannelBreakdown[]
  dailyBreakdown: DailyBreakdown[]
  resolutionRate: number
  totalCost: number
  returningUsers: number
  avgSatisfactionScore: number | null
}

export interface AgentAnalyticsResponse {
  totalConversations: number
  totalMessages: number
  uniqueUsers: number
  avgResponseTime: number
  successRate: number
  conversationsChange: number
  messagesChange: number
  usersChange: number
  responseTimeChange: number
  satisfactionScore: number | null
  totalInputTokens: number
  totalOutputTokens: number
  channelBreakdown: ChannelBreakdown[]
  dailyBreakdown: DailyBreakdown[]
  resolutionRate: number
  totalCost: number
  returningUsers: number
}

export interface TopDocumentEntry {
  id: string
  name: string
  queries: number
  successRate: number
}

export interface TopAgentEntry {
  agentId: string
  agentName: string
  agentAvatar: string | null
  totalConversations: number
  totalMessages: number
  avgResponseTime: number
  successRate: number
  satisfactionScore: number | null
  totalInputTokens: number
  totalOutputTokens: number
  resolutionRate: number
  totalCost: number
}

export const analyticsApi = {
  overview: (orgId: string, params?: { from?: string; to?: string }) =>
    api.get<{ data: OrgAnalyticsResponse }>(`/organizations/${orgId}/analytics`, { params }),

  agent: (agentId: string, params?: { from?: string; to?: string }) =>
    api.get<{ data: AgentAnalyticsResponse }>(`/agents/${agentId}/analytics`, { params }),

  topAgents: (orgId: string, params?: { from?: string; to?: string; limit?: number }) =>
    api.get<{ data: TopAgentEntry[] }>(`/organizations/${orgId}/analytics/top-agents`, { params }),

  topDocuments: (orgId: string, params?: { limit?: number }) =>
    api.get<{ data: TopDocumentEntry[] }>(`/organizations/${orgId}/analytics/top-documents`, { params }),
}
