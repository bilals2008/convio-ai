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

export interface DailyBreakdownEntry {
  date: string
  totalConversations: number
  totalMessages: number
  uniqueUsers: number
  avgResponseTime: number
}

export interface AnalyticsSnapshotInput {
  date: string
  totalConversations: number
  totalMessages: number
  uniqueUsers: number
  avgResponseTime: number
  satisfactionScore?: number
  resolvedConversations?: number
  escalatedConversations?: number
  totalCost?: number
  totalInputTokens?: number
  totalOutputTokens?: number
  returningUsers?: number
}
