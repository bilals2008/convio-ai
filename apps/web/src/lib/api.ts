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
  agent: (agentId: string, params?: { from?: string; to?: string }) =>
    api.get(`/agents/${agentId}/analytics`, { params }),
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
  testStream: async (config: {
    model: string
    systemPrompt: string
    message: string
    temperature: number
    maxTokens: number
    reasoningEffort?: string
    providerKeyId?: string
    knowledgeBaseId?: string
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
    signal?: AbortSignal
  }) => {
    const { signal, ...body } = config
    const { data: { session } } = await supabase.auth.getSession()
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const response = await fetch(`${baseURL}/agents/test-stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(body),
      signal,
    })
    return response
  },
  addTool: (id: string, toolId: string) => api.post(`/agents/${id}/tools`, { toolId }),
  removeTool: (id: string, toolId: string) => api.delete(`/agents/${id}/tools/${toolId}`),
}

export const conversations = {
  list: (params?: { status?: string; channel?: string; agentId?: string; cursor?: string; limit?: number }) =>
    api.get('/conversations', { params }),
  get: (id: string) => api.get(`/conversations/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/conversations/${id}`, data),
  create: (agentId: string, data?: Record<string, unknown>) =>
    api.post(`/agents/${agentId}/conversations`, data || {}),
  listByAgent: (agentId: string, params?: { status?: string; cursor?: string; limit?: number }) =>
    api.get(`/agents/${agentId}/conversations`, { params }),
  delete: (id: string) => api.delete(`/conversations/${id}`),
}

export const messages = {
  send: (conversationId: string, content: string, role = 'user') =>
    api.post(`/conversations/${conversationId}/messages`, { role, content }),
  list: (conversationId: string, params?: { cursor?: string; limit?: number }) =>
    api.get(`/conversations/${conversationId}/messages`, { params }),
  stream: (conversationId: string, content: string) =>
    api.post(`/conversations/${conversationId}/messages/stream`, { role: 'user', content }),
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
  uploadPdf: (knowledgeBaseId: string, formData: FormData) =>
    api.post(`/knowledge-bases/${knowledgeBaseId}/documents/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getDocuments: (knowledgeBaseId: string, params?: { cursor?: string; limit?: number; status?: string }) =>
    api.get(`/knowledge-bases/${knowledgeBaseId}/documents`, { params }),
  getDocument: (docId: string) => api.get(`/documents/${docId}`),
  searchChunks: (knowledgeBaseId: string, query: string, limit = 10) =>
    api.get(`/knowledge-bases/${knowledgeBaseId}/chunks`, {
      params: { q: query, limit },
    }),
  getDocumentChunks: (docId: string) =>
    api.get(`/documents/${docId}/chunks`),
  updateDocument: (docId: string, data: Record<string, unknown>) =>
    api.patch(`/documents/${docId}`, data),
  reprocessDocument: (docId: string) => api.post(`/documents/${docId}/reprocess`),
  deleteDocument: (docId: string) => api.delete(`/documents/${docId}`),
}

export const widgets = {
  list: (orgId: string) => api.get(`/organizations/${orgId}/widgets`),
  get: (id: string) => api.get(`/widgets/${id}`),
  create: (orgId: string, data: { name: string; agentId: string; config?: Record<string, unknown> }) => api.post(`/organizations/${orgId}/widgets`, data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/widgets/${id}`, data),
  delete: (id: string) => api.delete(`/widgets/${id}`),
  getEmbed: (id: string) => api.get(`/widgets/${id}/embed`),
}

export const deployments = {
  list: (agentId: string) => api.get(`/agents/${agentId}/deployments`),
  get: (id: string) => api.get(`/deployments/${id}`),
  create: (agentId: string, data: Record<string, unknown>) =>
    api.post(`/agents/${agentId}/deployments`, data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/deployments/${id}`, data),
  delete: (id: string) => api.delete(`/deployments/${id}`),
  test: (id: string) => api.post(`/deployments/${id}/test`),
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

export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: { 'Content-Type': 'application/json' },
})

export default api
