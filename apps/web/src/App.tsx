import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import Landing from '@/pages/landing'
import Dashboard from '@/pages/dashboard'
import Bots from '@/pages/bots'
import Agents from '@/pages/agents'
import Conversations from '@/pages/conversations'
import ConversationDetail from '@/pages/conversation-detail'
import Knowledge from '@/pages/knowledge'
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
            <Route path="/login" element={<div>Login</div>} />
            <Route path="/signup" element={<div>Signup</div>} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/analytics" element={<Analytics />} />
              <Route path="/agents" element={<Agents />} />
              <Route path="/chatbots" element={<Bots />} />
              <Route path="/knowledge" element={<Knowledge />} />
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
