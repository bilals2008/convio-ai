import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/lib/auth-context'
import { OrgProvider } from '@/lib/org-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import Landing from '@/pages/landing'
import LoginPage from '@/pages/auth/login-page'
import SignupPage from '@/pages/auth/signup-page'
import ForgotPasswordPage from '@/pages/auth/forgot-password-page'
import DashboardOverviewPage from '@/pages/dashboard/dashboard-overview-page'
import AgentsListPage from '@/pages/agents/agents-list-page'
import CreateAgentPage from '@/pages/agents/create-agent-page'
import AgentDetailPage from '@/pages/agents/agent-detail-page'
import ConversationsListPage from '@/pages/conversations/conversations-list-page'
import ConversationDetailPage from '@/pages/conversations/conversation-detail-page'
import { ConversationsLayout } from '@/components/conversations/conversations-layout'
import { ChatView } from '@/components/conversations/chat-view'
import KnowledgeListPage from '@/pages/knowledge/knowledge-list-page'
import KnowledgeDetailPage from '@/pages/knowledge/knowledge-detail-page'

import AnalyticsPage from '@/pages/analytics/analytics-page'
import WidgetsListPage from '@/pages/widgets/widgets-list-page'
import WidgetConfigPage from '@/pages/widgets/widget-config-page'
import WidgetDemoPage from '@/pages/widget/WidgetDemo'
import PlaygroundPage from '@/pages/playground/playground-page'
import AuditLogsPage from '@/pages/settings/audit-logs-page'
import SsoSettingsPage from '@/pages/settings/sso-settings-page'
import { SettingsLayout } from '@/components/settings/settings-layout'
import OrganizationSettingsPage from '@/pages/settings/organization-settings-page'
import TeamMembersPage from '@/pages/settings/team-members-page'
import DeploymentsPage from '@/pages/settings/deployments-page'
import ApiKeysPage from '@/pages/settings/api-keys-page'
import ProviderKeysPage from '@/pages/settings/provider-keys-page'
import ProfileSettingsPage from '@/pages/settings/profile-settings-page'

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
        <Toaster />
        <Router>
          <AuthProvider>
            <OrgProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/widget/demo" element={<WidgetDemoPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardOverviewPage />} />
              <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
              <Route path="/agents" element={<AgentsListPage />} />
              <Route path="/agents/new" element={<CreateAgentPage />} />
              <Route path="/agents/:id/edit" element={<AgentDetailPage />} />
              <Route path="/knowledge" element={<KnowledgeListPage />} />
              <Route path="/knowledge/:id" element={<KnowledgeDetailPage />} />
              <Route path="/widgets" element={<WidgetsListPage />} />
              <Route path="/widgets/:id" element={<WidgetConfigPage />} />
              <Route path="/conversations" element={<ConversationsLayout />}>
                <Route index element={<ConversationsListPage />} />
                <Route path=":id" element={<ChatView />} />
              </Route>
              <Route path="/settings" element={<SettingsLayout />}>
                <Route index element={<OrganizationSettingsPage />} />
                <Route path="profile" element={<ProfileSettingsPage />} />
                <Route path="organization" element={<OrganizationSettingsPage />} />
                <Route path="team" element={<TeamMembersPage />} />
                <Route path="deployments" element={<DeploymentsPage />} />
                <Route path="api-keys" element={<ApiKeysPage />} />
                <Route path="provider-keys" element={<ProviderKeysPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
                <Route path="sso" element={<SsoSettingsPage />} />
                <Route path="playground" element={<PlaygroundPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
            </OrgProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
