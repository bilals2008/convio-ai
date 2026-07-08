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
  overview: (orgId: string) => api.get(`/organizations/${orgId}/analytics`),
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
}

export const conversations = {
  list: (orgId: string) => api.get(`/organizations/${orgId}/conversations`),
  get: (id: string) => api.get(`/conversations/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/conversations/${id}`, data),
}

export const messages = {
  send: (conversationId: string, content: string) =>
    api.post(`/conversations/${conversationId}/messages`, { content }),
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
}

export const widgets = {
  list: (orgId: string) => api.get(`/organizations/${orgId}/widgets`),
  delete: (id: string) => api.delete(`/widgets/${id}`),
}

export const integrations = {
  list: (botIdOrOrgId: string) => api.get(`/bots/${botIdOrOrgId}/integrations`),
  create: (body: Record<string, unknown>) => {
    const { orgId, data } = extractOrgId(body)
    return api.post(`/organizations/${orgId}/integrations`, data)
  },
  delete: (id: string) => api.delete(`/integrations/${id}`),
  test: (id: string) => api.post(`/integrations/${id}/test`),
}

export const organizations = {
  api,
  get: (id: string) => api.get(`/organizations/${id}`),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/organizations/${id}`, data),
  delete: (id: string) => api.delete(`/organizations/${id}`),
  members: (id: string) => api.get(`/organizations/${id}/members`),
}

export default api
