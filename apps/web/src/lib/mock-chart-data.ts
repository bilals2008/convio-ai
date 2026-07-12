function d(daysAgo: number): string {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

export const mockOverviewData = Array.from({ length: 30 }, (_, i) => ({
  date: d(29 - i),
  messages: Math.round(40 + Math.random() * 120 + Math.sin(i / 4) * 30),
  conversations: Math.round(8 + Math.random() * 35 + Math.cos(i / 3) * 10),
}))

export const mockChannelData = [
  { channel: "web" as const, count: 284 },
  { channel: "whatsapp" as const, count: 196 },
  { channel: "slack" as const, count: 87 },
  { channel: "discord" as const, count: 52 },
  { channel: "telegram" as const, count: 41 },
  { channel: "api" as const, count: 138 },
]

export const mockResponseTimeData = Array.from({ length: 30 }, (_, i) => ({
  date: d(29 - i),
  avgTime: Number((0.4 + Math.random() * 1.8 + Math.sin(i / 5) * 0.3).toFixed(2)),
}))

export const mockAgentsData = [
  { id: "1", name: "Convio Assistant", conversations: 312, messages: 1847, avgResponseTime: 0.6, satisfactionScore: 4.8 },
  { id: "2", name: "Sales Bot", conversations: 198, messages: 1102, avgResponseTime: 1.1, satisfactionScore: 4.5 },
  { id: "3", name: "Support Agent", conversations: 156, messages: 890, avgResponseTime: 0.9, satisfactionScore: 4.7 },
  { id: "4", name: "FAQ Helper", conversations: 87, messages: 445, avgResponseTime: 0.4, satisfactionScore: 4.9 },
  { id: "5", name: "Lead Qualifier", conversations: 64, messages: 312, avgResponseTime: 1.4, satisfactionScore: 4.2 },
  { id: "6", name: "Onboarding Bot", conversations: 43, messages: 267, avgResponseTime: 0.8, satisfactionScore: 4.6 },
  { id: "7", name: "Tech Support", conversations: 29, messages: 189, avgResponseTime: 1.7, satisfactionScore: 4.1 },
]
