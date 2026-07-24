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
import SuggestionsPage from '@/pages/suggestions/suggestions-page'
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
import DocsOverviewPage from '@/pages/docs/index'
import DocsPlanPage from '@/pages/docs/plan'
import CorrectiveRagPage from '@/pages/docs/corrective-rag'
import HybridSearchPage from '@/pages/docs/hybrid-search'
import AgenticRagPage from '@/pages/docs/agentic-rag'
import KnowledgeGraphRagPage from '@/pages/docs/knowledge-graph-rag'
import TokenOptimizationPage from '@/pages/docs/token-optimization'
import ContextOptimizationPage from '@/pages/docs/context-optimization'
import VoicePage from '@/pages/docs/voice'
import McpPage from '@/pages/docs/mcp'
import WhatsAppFeaturesPage from '@/pages/docs/whatsapp-features'
import DiscordFeaturesPage from '@/pages/docs/discord-features'
import WidgetFeaturesPage from '@/pages/docs/widget-features'
import ApiFeaturesPage from '@/pages/docs/api-features'
import GenerativeUiPage from '@/pages/docs/generative-ui'
import MemoryPage from '@/pages/docs/memory'
import MultiAgentPage from '@/pages/docs/multi-agent'
import { DocsLayout } from '@/components/docs/docs-layout'
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
            <Route element={<DocsLayout />}>
              <Route path="/docs" element={<DocsOverviewPage />} />
              <Route path="/docs/plan" element={<DocsPlanPage />} />
              <Route path="/docs/corrective-rag" element={<CorrectiveRagPage />} />
              <Route path="/docs/hybrid-search" element={<HybridSearchPage />} />
              <Route path="/docs/agentic-rag" element={<AgenticRagPage />} />
              <Route path="/docs/knowledge-graph-rag" element={<KnowledgeGraphRagPage />} />
              <Route path="/docs/token-optimization" element={<TokenOptimizationPage />} />
              <Route path="/docs/context-optimization" element={<ContextOptimizationPage />} />
              <Route path="/docs/voice" element={<VoicePage />} />
              <Route path="/docs/mcp" element={<McpPage />} />
              <Route path="/docs/whatsapp-features" element={<WhatsAppFeaturesPage />} />
              <Route path="/docs/discord-features" element={<DiscordFeaturesPage />} />
              <Route path="/docs/widget-features" element={<WidgetFeaturesPage />} />
              <Route path="/docs/api-features" element={<ApiFeaturesPage />} />
              <Route path="/docs/generative-ui" element={<GenerativeUiPage />} />
              <Route path="/docs/memory" element={<MemoryPage />} />
              <Route path="/docs/multi-agent" element={<MultiAgentPage />} />
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
              <Route path="/suggestions" element={<SuggestionsPage />} />
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
