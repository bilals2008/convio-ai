import { lazyLoad } from '@/lib/lazy-load'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/lib/auth-context'
import { RedirectAuthenticated } from '@/components/auth/redirect-authenticated'
import { OrgProvider } from '@/lib/org-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AdminLayout } from '@/admin/admin-layout'
import { AdminGuard } from '@/admin/admin-guard'
import { ConversationsLayout } from '@/components/conversations/conversations-layout'
import { ChatView } from '@/components/conversations/chat-view'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { SettingsLayout } from '@/components/settings/settings-layout'
import { PageContainer } from '@/components/shared/page-container'

const AdminOverviewPage = lazyLoad(() => import('@/admin/pages/overview-page'))
const AdminUsersPage = lazyLoad(() => import('@/admin/pages/users-page'))
const AdminUserDetailPage = lazyLoad(() => import('@/admin/pages/user-detail-page'))
const AdminOrgsPage = lazyLoad(() => import('@/admin/pages/orgs-page'))
const AdminOrgDetailPage = lazyLoad(() => import('@/admin/pages/org-detail-page'))
const AdminSystemPage = lazyLoad(() => import('@/admin/pages/system-page'))
const AdminAuditLogsPage = lazyLoad(() => import('@/admin/pages/audit-logs-page'))
const AdminAgentsPage = lazyLoad(() => import('@/admin/pages/agents-page'))
const AdminAnalyticsPage = lazyLoad(() => import('@/admin/pages/analytics-page'))
const AdminRevenuePage = lazyLoad(() => import('@/admin/pages/revenue-page'))
const AdminModerationPage = lazyLoad(() => import('@/admin/pages/moderation-page'))
const AdminBillingPage = lazyLoad(() => import('@/admin/pages/billing-page'))
const AdminPricingPage = lazyLoad(() => import('@/admin/pages/pricing-page'))
const AdminPlanDetailPage = lazyLoad(() => import('@/admin/pages/plan-detail-page'))
const AdminProvidersPage = lazyLoad(() => import('@/admin/pages/providers-page'))
const AdminNotificationsPage = lazyLoad(() => import('@/admin/pages/notifications-page'))
const AdminDocsFeedbackPage = lazyLoad(() => import('@/admin/pages/docs-feedback-page'))
const AdminKnowledgeBasesPage = lazyLoad(() => import('@/admin/pages/knowledge-bases-page'))
const AdminKnowledgeBaseDetailPage = lazyLoad(() => import('@/admin/pages/knowledge-base-detail-page'))
const AdminKnowledgeDocumentDetailPage = lazyLoad(() => import('@/admin/pages/knowledge-document-detail-page'))
const AdminAccessPage = lazyLoad(() => import('@/admin/pages/admin-access-page'))
const AdminAssistantPage = lazyLoad(() => import('@/admin/pages/assistant-page'))
const AdminTicketsPage = lazyLoad(() => import('@/admin/pages/tickets-page'))
const AdminTicketDetailPage = lazyLoad(() => import('@/admin/pages/ticket-detail-page'))
const AdminPlaygroundPage = lazyLoad(() => import('@/admin/pages/playground-page'))
const AdminApiUsagePage = lazyLoad(() => import('@/admin/pages/api-usage-page'))
const AdminFontsPage = lazyLoad(() => import('@/admin/pages/fonts-page'))

const Landing = lazyLoad(() => import('@/pages/landing'))
const PricingPage = lazyLoad(() => import('@/pages/pricing-page'))
const ContactPage = lazyLoad(() => import('@/pages/contact-page'))
const TermsPage = lazyLoad(() => import('@/pages/terms-page'))
const PrivacyPage = lazyLoad(() => import('@/pages/privacy-page'))
const LoginPage = lazyLoad(() => import('@/pages/auth/login-page'))
const SignupPage = lazyLoad(() => import('@/pages/auth/signup-page'))
const ForgotPasswordPage = lazyLoad(() => import('@/pages/auth/forgot-password-page'))
const DashboardOverviewPage = lazyLoad(() => import('@/pages/dashboard/dashboard-overview-page'))
const AgentsListPage = lazyLoad(() => import('@/pages/agents/agents-list-page'))
const AgentTemplatesPage = lazyLoad(() => import('@/pages/agents/agent-templates-page'))
const CreateAgentPage = lazyLoad(() => import('@/pages/agents/create-agent-page'))
const AgentDetailPage = lazyLoad(() => import('@/pages/agents/agent-detail-page'))
const AgentPlaygroundTestPage = lazyLoad(() => import('@/pages/agents/agent-playground-page'))
const ConversationsListPage = lazyLoad(() => import('@/pages/conversations/conversations-list-page'))
const KnowledgeListPage = lazyLoad(() => import('@/pages/knowledge/knowledge-list-page'))
const KnowledgeDetailPage = lazyLoad(() => import('@/pages/knowledge/knowledge-detail-page'))

const AnalyticsPage = lazyLoad(() => import('@/pages/analytics/analytics-page'))
const WidgetsListPage = lazyLoad(() => import('@/pages/widgets/widgets-list-page'))
const WidgetConfigPage = lazyLoad(() => import('@/pages/widgets/widget-config-page'))
const WidgetDemoPage = lazyLoad(() => import('@/pages/widget/WidgetDemo'))
const OrganizationSettingsPage = lazyLoad(() => import('@/pages/settings/organization-settings-page'))
const DeploymentsPage = lazyLoad(() => import('@/pages/settings/deployments-page'))
const ProviderKeysPage = lazyLoad(() => import('@/pages/settings/provider-keys-page'))
const ProfilePage = lazyLoad(() => import('@/pages/settings/profile-page'))
const BillingPage = lazyLoad(() => import('@/pages/settings/billing-page'))
const DataManagementPage = lazyLoad(() => import('@/pages/settings/data-management-page'))
const McpServersPage = lazyLoad(() => import('@/pages/settings/mcp-servers-page'))
const McpTemplatesPage = lazyLoad(() => import('@/pages/settings/mcp-templates-page'))
const ComposioPage = lazyLoad(() => import('@/pages/settings/composio-page'))
const SettingsAuditLogsPage = lazyLoad(() => import('@/pages/settings/audit-logs-page'))
const NotificationPreferencesPage = lazyLoad(() => import('@/pages/settings/notification-preferences-page'))
const SupportTicketsPage = lazyLoad(() => import('@/pages/support/support-tickets-page'))
const SupportTicketDetailPage = lazyLoad(() => import('@/pages/support/ticket-detail-page'))
const NotificationsPage = lazyLoad(() => import('@/pages/notifications-page'))
const DocsComingSoonPage = lazyLoad(() => import('@/pages/docs-coming-soon-page'))

import InvitePage from '@/pages/invite-page'
import StatusPage from '@/pages/status-page'

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
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/login" element={<RedirectAuthenticated><LoginPage /></RedirectAuthenticated>} />
            <Route path="/signup" element={<RedirectAuthenticated><SignupPage /></RedirectAuthenticated>} />
            <Route path="/forgot-password" element={<RedirectAuthenticated><ForgotPasswordPage /></RedirectAuthenticated>} />
            <Route path="/invite" element={<InvitePage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/widget/demo" element={<WidgetDemoPage />} />
            <Route path="/docs" element={<DocsComingSoonPage />} />
            <Route path="/docs/*" element={<Navigate to="/docs" replace />} />
            <Route element={<ErrorBoundary name="Dashboard"><DashboardLayout /></ErrorBoundary>}>
            <Route path="/dashboard" element={<DashboardOverviewPage />} />
              <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
              <Route path="/agents" element={<AgentsListPage />} />
              <Route path="/agents/templates" element={<AgentTemplatesPage />} />
              <Route path="/agents/new" element={<CreateAgentPage />} />
              <Route path="/agents/:id/edit" element={<AgentDetailPage />} />
              <Route path="/agents/:id/playground" element={<AgentPlaygroundTestPage />} />
              <Route path="/mcp-servers" element={<PageContainer><McpServersPage /></PageContainer>} />
              <Route path="/mcp-servers/templates" element={<McpTemplatesPage />} />
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
                <Route path="composio" element={<ComposioPage />} />
                <Route path="billing" element={<BillingPage />} />
                 <Route path="data" element={<DataManagementPage />} />
                 <Route path="audit-logs" element={<SettingsAuditLogsPage />} />
                 <Route path="notifications" element={<NotificationPreferencesPage />} />
                </Route>
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/support" element={<SupportTicketsPage />} />
              <Route path="/support/:ticketId" element={<SupportTicketDetailPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
            <Route element={<AdminGuard />}>
              <Route element={<ErrorBoundary name="Admin"><AdminLayout /></ErrorBoundary>}>
                <Route path="/admin" element={<AdminOverviewPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
                <Route path="/admin/organizations" element={<AdminOrgsPage />} />
                <Route path="/admin/organizations/:id" element={<AdminOrgDetailPage />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                <Route path="/admin/revenue" element={<AdminRevenuePage />} />
                <Route path="/admin/agents" element={<AdminAgentsPage />} />
                <Route path="/admin/system" element={<AdminSystemPage />} />
                <Route path="/admin/moderation" element={<AdminModerationPage />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="/admin/billing" element={<AdminBillingPage />} />
                <Route path="/admin/pricing" element={<AdminPricingPage />} />
                <Route path="/admin/pricing/:id" element={<AdminPlanDetailPage />} />
                <Route path="/admin/providers" element={<AdminProvidersPage />} />
                <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
                <Route path="/admin/docs-feedback" element={<AdminDocsFeedbackPage />} />
                <Route path="/admin/access" element={<AdminAccessPage />} />
                <Route path="/admin/knowledge-bases" element={<AdminKnowledgeBasesPage />} />
                <Route path="/admin/knowledge-bases/:id" element={<AdminKnowledgeBaseDetailPage />} />
                <Route path="/admin/knowledge-bases/:kbId/documents/:documentId" element={<AdminKnowledgeDocumentDetailPage />} />
                <Route path="/admin/assistant" element={<AdminAssistantPage />} />
                <Route path="/admin/playground" element={<AdminPlaygroundPage />} />
                <Route path="/admin/tickets" element={<AdminTicketsPage />} />
                <Route path="/admin/tickets/:ticketId" element={<AdminTicketDetailPage />} />
                <Route path="/admin/api-usage" element={<AdminApiUsagePage />} />
                <Route path="/admin/fonts" element={<AdminFontsPage />} />
              </Route>
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
