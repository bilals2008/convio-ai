import api from './client'

export interface DocFeedbackSummary {
  myVote: { helpful: boolean; comment: string | null } | null
  helpful: number
  notHelpful: number
}

export async function getDocFeedback(orgId: string, slug: string) {
  const res = await api.get(`/organizations/${orgId}/docs/feedback`, { params: { slug } })
  return res.data.data as DocFeedbackSummary
}

export async function submitDocFeedback(orgId: string, slug: string, helpful: boolean, comment?: string) {
  const res = await api.post(`/organizations/${orgId}/docs/feedback`, { slug, helpful, comment })
  return res.data.data as { helpful: boolean }
}
