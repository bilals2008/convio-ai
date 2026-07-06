import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import Landing from '@/pages/landing'
import LoginPage from '@/pages/auth/login-page'
import SignupPage from '@/pages/auth/signup-page'
import ForgotPasswordPage from '@/pages/auth/forgot-password-page'
import Dashboard from '@/pages/dashboard'
import Bots from '@/pages/bots'
import ChatbotsListPage from '@/pages/chatbots/chatbots-list-page'
import BotEditorPage from '@/pages/chatbots/bot-editor-page'
import AgentsListPage from '@/pages/agents/agents-list-page'
import AgentEditorPage from '@/pages/agents/agent-editor-page'
import Conversations from '@/pages/conversations'
import ConversationDetail from '@/pages/conversation-detail'
import KnowledgeListPage from '@/pages/knowledge/knowledge-list-page'
import KnowledgeDetailPage from '@/pages/knowledge/knowledge-detail-page'
import Documents from '@/pages/documents'
import Analytics from '@/pages/analytics'
import Integrations from '@/pages/integrations'
import Settings from '@/pages/settings'
import OrganizationSettings from '@/pages/organization-settings'
import TeamMembers from '@/pages/team-members'
import ApiKeys from '@/pages/api-keys'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/analytics" element={<Analytics />} />
              <Route path="/agents" element={<AgentsListPage />} />
              <Route path="/agents/new" element={<AgentEditorPage />} />
              <Route path="/agents/:id/edit" element={<AgentEditorPage />} />
              <Route path="/chatbots" element={<ChatbotsListPage />} />
              <Route path="/chatbots/new" element={<BotEditorPage />} />
              <Route path="/chatbots/:id/edit" element={<BotEditorPage />} />
              <Route path="/knowledge" element={<KnowledgeListPage />} />
              <Route path="/knowledge/new" element={<KnowledgeDetailPage />} />
              <Route path="/knowledge/:id" element={<KnowledgeDetailPage />} />
              <Route path="/knowledge/documents" element={<Documents />} />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/conversations/:id" element={<ConversationDetail />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/organization" element={<OrganizationSettings />} />
              <Route path="/settings/team" element={<TeamMembers />} />
              <Route path="/settings/integrations" element={<Integrations />} />
              <Route path="/settings/api-keys" element={<ApiKeys />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
