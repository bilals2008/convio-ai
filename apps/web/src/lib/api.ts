import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
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

export default api

// Auth functions
export const auth = {
  signUp: (email: string, password: string, name: string) =>
    api.post('/auth/sign-up', { email, password, name }),
  signIn: (email: string, password: string) =>
    api.post('/auth/sign-in', { email, password }),
  signOut: () => api.post('/auth/sign-out'),
  getSession: () => api.get('/auth/session'),
  getMe: () => api.get('/auth/me'),
  googleAuth: () => window.location.assign(`${api.defaults.baseURL}/auth/google`),
  githubAuth: () => window.location.assign(`${api.defaults.baseURL}/auth/github`),
}

// API functions
export const bots = {
  list: (orgId: string) => api.get(`/bots?orgId=${orgId}`),
  get: (id: string) => api.get(`/bots/${id}`),
  create: (data: any) => api.post('/bots', data),
  update: (id: string, data: any) => api.patch(`/bots/${id}`, data),
  delete: (id: string) => api.delete(`/bots/${id}`),
  getEmbed: (id: string) => api.get(`/bots/${id}/embed`),
}

export const agents = {
  list: (orgId: string) => api.get(`/agents?orgId=${orgId}`),
  get: (id: string) => api.get(`/agents/${id}`),
  create: (data: any) => api.post('/agents', data),
  update: (id: string, data: any) => api.patch(`/agents/${id}`, data),
  delete: (id: string) => api.delete(`/agents/${id}`),
  test: (id: string, message: string) => api.post(`/agents/${id}/test`, { message }),
}

export const conversations = {
  list: (orgId: string) => api.get(`/conversations?orgId=${orgId}`),
  get: (id: string) => api.get(`/conversations/${id}`),
  create: (data: any) => api.post('/conversations', data),
  update: (id: string, data: any) => api.patch(`/conversations/${id}`, data),
  delete: (id: string) => api.delete(`/conversations/${id}`),
}

export const messages = {
  list: (conversationId: string) => api.get(`/conversations/${conversationId}/messages`),
  send: (conversationId: string, content: string) => api.post(`/conversations/${conversationId}/messages`, { content, role: 'user' }),
}

export const knowledge = {
  list: (orgId: string) => api.get(`/knowledge?orgId=${orgId}`),
  get: (id: string) => api.get(`/knowledge/${id}`),
  create: (data: any) => api.post('/knowledge', data),
  update: (id: string, data: any) => api.patch(`/knowledge/${id}`, data),
  delete: (id: string) => api.delete(`/knowledge/${id}`),
  uploadDocument: (kbId: string, data: any) => api.post(`/knowledge/${kbId}/documents`, data),
}

export const analytics = {
  overview: (orgId: string) => api.get(`/analytics/overview?orgId=${orgId}`),
  bot: (id: string) => api.get(`/analytics/bots/${id}`),
  conversations: (orgId: string) => api.get(`/analytics/conversations?orgId=${orgId}`),
}

export const organizations = {
  list: () => api.get('/organizations'),
  get: (id: string) => api.get(`/organizations/${id}`),
  create: (data: any) => api.post('/organizations', data),
  update: (id: string, data: any) => api.patch(`/organizations/${id}`, data),
  delete: (id: string) => api.delete(`/organizations/${id}`),
  members: (id: string) => api.get(`/organizations/${id}/members`),
}

export const widgets = {
  list: (orgId: string) => api.get(`/widgets?orgId=${orgId}`),
  get: (id: string) => api.get(`/widgets/${id}`),
  create: (data: any) => api.post('/widgets', data),
  update: (id: string, data: any) => api.patch(`/widgets/${id}`, data),
  delete: (id: string) => api.delete(`/widgets/${id}`),
}

export const integrations = {
  list: (orgId: string) => api.get(`/integrations?orgId=${orgId}`),
  get: (id: string) => api.get(`/integrations/${id}`),
  create: (data: any) => api.post('/integrations', data),
  update: (id: string, data: any) => api.patch(`/integrations/${id}`, data),
  delete: (id: string) => api.delete(`/integrations/${id}`),
  test: (id: string) => api.post(`/integrations/${id}/test`),
}
