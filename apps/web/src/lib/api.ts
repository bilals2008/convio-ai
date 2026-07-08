import axios from 'axios'
import { supabase } from '@/lib/supabase'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

function extractOrgId(data: Record<string, unknown>) {
  const { organizationId, ...rest } = data
  return { orgId: organizationId as string, data: rest }
}

export const analytics = {
  overview: (orgId: string, params?: { from?: string; to?: string }) =>
    api.get(`/organizations/${orgId}/analytics`, { params }),
}

export const bots = {
  list: (orgId: string) => api.get(`/organizations/${orgId}/bots`),
  get: (id: string) => api.get(`/bots/${id}`),
  create: (body: Record<string, unknown>) => {
    const { orgId, data } = extractOrgId(body)
    return api.post(`/organizations/${orgId}/bots`, data)
  },
  update: (id: string, data: Record<string, unknown>) => api.patch(`/bots/${id}`, data),
  delete: (id: string) => api.delete(`/bots/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/bots/${id}/status`, { status }),
  getEmbed: (id: string) => api.get(`/bots/${id}/embed`),
}

export const agents = {
  list: (orgId: string) => api.get(`/organizations/${orgId}/agents`),
  get: (id: string) => api.get(`/agents/${id}`),
  create: (body: Record<string, unknown>) => {
    const { orgId, data } = extractOrgId(body)
    return api.post(`/organizations/${orgId}/agents`, data)
  },
  update: (id: string, data: Record<string, unknown>) => api.patch(`/agents/${id}`, data),
  delete: (id: string) => api.delete(`/agents/${id}`),
  test: (id: string, message: string) => api.post(`/agents/${id}/test`, { message }),
  addTool: (id: string, toolId: string) => api.post(`/agents/${id}/tools`, { toolId }),
  removeTool: (id: string, toolId: string) => api.delete(`/agents/${id}/tools/${toolId}`),
}

export const conversations = {
  list: (params?: { status?: string; channel?: string; botId?: string; cursor?: string; limit?: number }) =>
    api.get('/conversations', { params }),
  get: (id: string) => api.get(`/conversations/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/conversations/${id}`, data),
  create: (botId: string, data?: Record<string, unknown>) =>
    api.post(`/bots/${botId}/conversations`, data || {}),
  listByBot: (botId: string, params?: { status?: string; cursor?: string; limit?: number }) =>
    api.get(`/bots/${botId}/conversations`, { params }),
}

export const messages = {
  send: (conversationId: string, content: string, role = 'user') =>
    api.post(`/conversations/${conversationId}/messages`, { role, content }),
  list: (conversationId: string, params?: { cursor?: string; limit?: number }) =>
    api.get(`/conversations/${conversationId}/messages`, { params }),
  stream: (conversationId: string, content: string) =>
    api.post(`/conversations/${conversationId}/messages/stream`, { role: 'user', content }, { responseType: 'stream' }),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/messages/${id}`, data),
  delete: (id: string) => api.delete(`/messages/${id}`),
}

export const knowledge = {
  list: (orgId: string) => api.get(`/organizations/${orgId}/knowledge-bases`),
  get: (id: string) => api.get(`/knowledge-bases/${id}`),
  create: (body: Record<string, unknown>) => {
    const { orgId, data } = extractOrgId(body)
    return api.post(`/organizations/${orgId}/knowledge-bases`, data)
  },
  update: (id: string, data: Record<string, unknown>) => api.patch(`/knowledge-bases/${id}`, data),
  delete: (id: string) => api.delete(`/knowledge-bases/${id}`),
  uploadDocument: (knowledgeBaseId: string, data: Record<string, unknown>) =>
    api.post(`/knowledge-bases/${knowledgeBaseId}/documents`, data),
  getDocuments: (knowledgeBaseId: string, params?: { cursor?: string; limit?: number; status?: string }) =>
    api.get(`/knowledge-bases/${knowledgeBaseId}/documents`, { params }),
  deleteDocument: (docId: string) => api.delete(`/documents/${docId}`),
}

export const widgets = {
  list: (orgId: string) => api.get(`/organizations/${orgId}/widgets`),
  delete: (id: string) => api.delete(`/widgets/${id}`),
}

export const integrations = {
  list: (botId: string) => api.get(`/bots/${botId}/integrations`),
  get: (id: string) => api.get(`/integrations/${id}`),
  create: (botId: string, data: Record<string, unknown>) =>
    api.post(`/bots/${botId}/integrations`, data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/integrations/${id}`, data),
  delete: (id: string) => api.delete(`/integrations/${id}`),
  test: (id: string) => api.post(`/integrations/${id}/test`),
}

export const organizations = {
  api,
  list: () => api.get('/organizations'),
  get: (id: string) => api.get(`/organizations/${id}`),
  create: (data: Record<string, unknown>) => api.post('/organizations', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/organizations/${id}`, data),
  delete: (id: string) => api.delete(`/organizations/${id}`),
  members: (id: string) => api.get(`/organizations/${id}/members`),
  addMember: (id: string, data: Record<string, unknown>) => api.post(`/organizations/${id}/members`, data),
  removeMember: (orgId: string, userId: string) => api.delete(`/organizations/${orgId}/members/${userId}`),
  updateMemberRole: (orgId: string, userId: string, role: string) =>
    api.patch(`/organizations/${orgId}/members/${userId}/role`, { role }),
}

export const chat = {
  models: () => api.get('/chat/models'),
}

export const providerKeys = {
  list: (orgId: string) => api.get(`/organizations/${orgId}/provider-keys`),
  create: (orgId: string, data: { provider: string; apiKey: string; label?: string }) =>
    api.post(`/organizations/${orgId}/provider-keys`, data),
  update: (orgId: string, keyId: string, data: { apiKey?: string; label?: string }) =>
    api.patch(`/organizations/${orgId}/provider-keys/${keyId}`, data),
  delete: (orgId: string, keyId: string) => api.delete(`/organizations/${orgId}/provider-keys/${keyId}`),
}

export const apiKeys = {
  list: (orgId: string) => api.get(`/organizations/${orgId}/api-keys`),
  create: (orgId: string, name: string) => api.post(`/organizations/${orgId}/api-keys`, { name }),
  delete: (orgId: string, keyId: string) => api.delete(`/organizations/${orgId}/api-keys/${keyId}`),
}

export default api
