import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/lib/auth-context'
import { RedirectAuthenticated } from '@/components/auth/redirect-authenticated'
import { OrgProvider } from '@/lib/org-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import Landing from '@/pages/landing'
import PricingPage from '@/pages/pricing-page'
import ContactPage from '@/pages/contact-page'
import LoginPage from '@/pages/auth/login-page'
import SignupPage from '@/pages/auth/signup-page'
import ForgotPasswordPage from '@/pages/auth/forgot-password-page'
import DashboardOverviewPage from '@/pages/dashboard/dashboard-overview-page'
import AgentsListPage from '@/pages/agents/agents-list-page'
import CreateAgentPage from '@/pages/agents/create-agent-page'
import AgentDetailPage from '@/pages/agents/agent-detail-page'
import ConversationsListPage from '@/pages/conversations/conversations-list-page'
import { ConversationsLayout } from '@/components/conversations/conversations-layout'
import { ChatView } from '@/components/conversations/chat-view'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import KnowledgeListPage from '@/pages/knowledge/knowledge-list-page'
import KnowledgeDetailPage from '@/pages/knowledge/knowledge-detail-page'

import AnalyticsPage from '@/pages/analytics/analytics-page'
import WidgetsListPage from '@/pages/widgets/widgets-list-page'
import WidgetConfigPage from '@/pages/widgets/widget-config-page'
import WidgetDemoPage from '@/pages/widget/WidgetDemo'
import { SettingsLayout } from '@/components/settings/settings-layout'
import OrganizationSettingsPage from '@/pages/settings/organization-settings-page'
import DeploymentsPage from '@/pages/settings/deployments-page'
import ProviderKeysPage from '@/pages/settings/provider-keys-page'
import ProfilePage from '@/pages/settings/profile-page'
import BillingPage from '@/pages/settings/billing-page'
import DataManagementPage from '@/pages/settings/data-management-page'
import McpServersPage from '@/pages/settings/mcp-servers-page'
import { HelpLayout } from '@/components/help/help-layout'
import HelpIndexPage from '@/pages/docs/help-index'
import WhatIsConvioPage from '@/pages/docs/what-is-convio'
import HelpLazyPage from '@/pages/docs/help-lazy'
import ComingSoonPage from '@/pages/coming-soon-page'
import InvitePage from '@/pages/invite-page'

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
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<RedirectAuthenticated><LoginPage /></RedirectAuthenticated>} />
            <Route path="/signup" element={<RedirectAuthenticated><SignupPage /></RedirectAuthenticated>} />
            <Route path="/forgot-password" element={<RedirectAuthenticated><ForgotPasswordPage /></RedirectAuthenticated>} />
            <Route path="/invite" element={<InvitePage />} />
            <Route path="/widget/demo" element={<WidgetDemoPage />} />
            <Route element={<HelpLayout />}>
              <Route path="/docs" element={<HelpIndexPage />} />
              <Route path="/docs/what-is-convio" element={<WhatIsConvioPage />} />
              <Route path="/docs/creating-account" element={<HelpLazyPage />} />
              <Route path="/docs/platform-tour" element={<HelpLazyPage />} />
              <Route path="/docs/first-organization" element={<HelpLazyPage />} />
              <Route path="/docs/vocabulary" element={<HelpLazyPage />} />
              <Route path="/docs/organizations" element={<HelpLazyPage />} />
              <Route path="/docs/roles" element={<HelpLazyPage />} />
              <Route path="/docs/inviting-members" element={<HelpLazyPage />} />
              <Route path="/docs/managing-members" element={<HelpLazyPage />} />
              <Route path="/docs/login-activity" element={<HelpLazyPage />} />
              <Route path="/docs/ai-agents" element={<HelpLazyPage />} />
              <Route path="/docs/creating-agent" element={<HelpLazyPage />} />
              <Route path="/docs/ai-models" element={<HelpLazyPage />} />
              <Route path="/docs/system-prompts" element={<HelpLazyPage />} />
              <Route path="/docs/agent-settings" element={<HelpLazyPage />} />
              <Route path="/docs/agent-playground" element={<HelpLazyPage />} />
              <Route path="/docs/knowledge-bases" element={<HelpLazyPage />} />
              <Route path="/docs/creating-knowledge-base" element={<HelpLazyPage />} />
              <Route path="/docs/supported-documents" element={<HelpLazyPage />} />
              <Route path="/docs/uploading-documents" element={<HelpLazyPage />} />
              <Route path="/docs/vector-search" element={<HelpLazyPage />} />
              <Route path="/docs/tools-overview" element={<HelpLazyPage />} />
              <Route path="/docs/built-in-tools" element={<HelpLazyPage />} />
              <Route path="/docs/custom-tools" element={<HelpLazyPage />} />
              <Route path="/docs/mcp-overview" element={<HelpLazyPage />} />
              <Route path="/docs/mcp-servers" element={<HelpLazyPage />} />
              <Route path="/docs/conversations" element={<HelpLazyPage />} />
              <Route path="/docs/managing-conversations" element={<HelpLazyPage />} />
              <Route path="/docs/leads" element={<HelpLazyPage />} />
              <Route path="/docs/human-handoff" element={<HelpLazyPage />} />
              <Route path="/docs/handoff-setup" element={<HelpLazyPage />} />
              <Route path="/docs/agent-inbox" element={<HelpLazyPage />} />
              <Route path="/docs/web-widget" element={<HelpLazyPage />} />
              <Route path="/docs/widget-appearance" element={<HelpLazyPage />} />
              <Route path="/docs/embedding" element={<HelpLazyPage />} />
              <Route path="/docs/channels" element={<HelpLazyPage />} />
              <Route path="/docs/whatsapp" element={<HelpLazyPage />} />
              <Route path="/docs/telegram" element={<HelpLazyPage />} />
              <Route path="/docs/discord" element={<HelpLazyPage />} />
              <Route path="/docs/slack" element={<HelpLazyPage />} />
              <Route path="/docs/byok" element={<HelpLazyPage />} />
              <Route path="/docs/adding-provider-keys" element={<HelpLazyPage />} />
              <Route path="/docs/supported-providers" element={<HelpLazyPage />} />
              <Route path="/docs/automations" element={<HelpLazyPage />} />
              <Route path="/docs/broadcasts" element={<HelpLazyPage />} />
              <Route path="/docs/webhooks" element={<HelpLazyPage />} />
              <Route path="/docs/analytics" element={<HelpLazyPage />} />
              <Route path="/docs/per-agent-analytics" element={<HelpLazyPage />} />
              <Route path="/docs/audit-logs" element={<HelpLazyPage />} />
              <Route path="/docs/security" element={<HelpLazyPage />} />
              <Route path="/docs/moderation" element={<HelpLazyPage />} />
              <Route path="/docs/data-management" element={<HelpLazyPage />} />
              <Route path="/docs/plans" element={<HelpLazyPage />} />
              <Route path="/docs/subscriptions" element={<HelpLazyPage />} />
              <Route path="/docs/usage-limits" element={<HelpLazyPage />} />
              <Route path="/docs/api-overview" element={<HelpLazyPage />} />
              <Route path="/docs/api-endpoints" element={<HelpLazyPage />} />
              <Route path="/docs/streaming-api" element={<HelpLazyPage />} />
              <Route path="/docs/sdk" element={<HelpLazyPage />} />
              <Route path="/docs/common-issues" element={<HelpLazyPage />} />
              <Route path="/docs/faqs" element={<HelpLazyPage />} />
              <Route path="/docs/best-practices" element={<HelpLazyPage />} />
            </Route>
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
                <Route path=":id" element={<ErrorBoundary><ChatView /></ErrorBoundary>} />
              </Route>
              <Route path="/settings" element={<SettingsLayout />}>
                <Route index element={<OrganizationSettingsPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="organization" element={<OrganizationSettingsPage />} />
                <Route path="deployments" element={<DeploymentsPage />} />
                <Route path="provider-keys" element={<ProviderKeysPage />} />
                <Route path="mcp-servers" element={<McpServersPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="data" element={<DataManagementPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
            </OrgProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
