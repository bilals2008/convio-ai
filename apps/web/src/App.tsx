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
import AdminOverviewPage from '@/admin/pages/overview-page'
import AdminUsersPage from '@/admin/pages/users-page'
import AdminUserDetailPage from '@/admin/pages/user-detail-page'
import AdminOrgsPage from '@/admin/pages/orgs-page'
import AdminOrgDetailPage from '@/admin/pages/org-detail-page'
import AdminSystemPage from '@/admin/pages/system-page'
import AdminAuditLogsPage from '@/admin/pages/audit-logs-page'
import AdminAgentsPage from '@/admin/pages/agents-page'
import AdminAnalyticsPage from '@/admin/pages/analytics-page'
import AdminModerationPage from '@/admin/pages/moderation-page'
import AdminBillingPage from '@/admin/pages/billing-page'
import AdminPricingPage from '@/admin/pages/pricing-page'
import AdminPlanDetailPage from '@/admin/pages/plan-detail-page'
import AdminProvidersPage from '@/admin/pages/providers-page'
import AdminAnnouncementsPage from '@/admin/pages/announcements-page'
import AdminDocsFeedbackPage from '@/admin/pages/docs-feedback-page'
import AdminKnowledgeBasesPage from '@/admin/pages/knowledge-bases-page'
import AdminKnowledgeBaseDetailPage from '@/admin/pages/knowledge-base-detail-page'
import AdminKnowledgeDocumentDetailPage from '@/admin/pages/knowledge-document-detail-page'
import AdminAccessPage from '@/admin/pages/admin-access-page'

import Landing from '@/pages/landing'
import PricingPage from '@/pages/pricing-page'
import ContactPage from '@/pages/contact-page'
import TermsPage from '@/pages/terms-page'
import PrivacyPage from '@/pages/privacy-page'
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
import SettingsAuditLogsPage from '@/pages/settings/audit-logs-page'
import { HelpLayout } from '@/components/help/help-layout'
import HelpIndexPage from '@/pages/docs/help-index'
import WhatIsConvioPage from '@/pages/docs/what-is-convio'
import ComingSoonPage from '@/pages/coming-soon-page'

// Phase 1 - Getting Started
const ConvioVsOthersPage = lazyLoad(() => import('@/pages/docs/convio-vs-others'))
const CreatingAccountPage = lazyLoad(() => import('@/pages/docs/creating-account'))
const DashboardTourPage = lazyLoad(() => import('@/pages/docs/dashboard-tour'))
const CreatingOrganizationPage = lazyLoad(() => import('@/pages/docs/creating-organization'))
const VocabularyPage = lazyLoad(() => import('@/pages/docs/vocabulary'))

// Phase 2 - Organizations
const OrganizationsPage = lazyLoad(() => import('@/pages/docs/organizations'))
const RolesPage = lazyLoad(() => import('@/pages/docs/roles'))
const InvitingMembersPage = lazyLoad(() => import('@/pages/docs/inviting-members'))
const ManagingMembersPage = lazyLoad(() => import('@/pages/docs/managing-members'))
const TransferringOwnershipPage = lazyLoad(() => import('@/pages/docs/transferring-ownership'))
const LeavingOrganizationPage = lazyLoad(() => import('@/pages/docs/leaving-organization'))
const LoginActivityPage = lazyLoad(() => import('@/pages/docs/login-activity'))

// Phase 3 - AI Agents
const AiAgentsPage = lazyLoad(() => import('@/pages/docs/ai-agents'))
const CreatingAgentPage = lazyLoad(() => import('@/pages/docs/creating-agent'))
const AiModelsPage = lazyLoad(() => import('@/pages/docs/ai-models'))
const SystemPromptsPage = lazyLoad(() => import('@/pages/docs/system-prompts'))
const AgentSettingsPage = lazyLoad(() => import('@/pages/docs/agent-settings'))
const WelcomeMessagesPage = lazyLoad(() => import('@/pages/docs/welcome-messages'))
const AgentPlaygroundPage = lazyLoad(() => import('@/pages/docs/agent-playground'))
const AgentStatusesPage = lazyLoad(() => import('@/pages/docs/agent-statuses'))
const CloningAgentsPage = lazyLoad(() => import('@/pages/docs/cloning-agents'))

// Phase 4 - Knowledge Bases
const WhatIsKnowledgeBasePage = lazyLoad(() => import('@/pages/docs/what-is-knowledge-base'))
const CreatingKnowledgeBasePage = lazyLoad(() => import('@/pages/docs/creating-knowledge-base'))
const SupportedDocumentsPage = lazyLoad(() => import('@/pages/docs/supported-documents'))
const UploadingDocumentsPage = lazyLoad(() => import('@/pages/docs/uploading-documents'))
const AddingWebPagesPage = lazyLoad(() => import('@/pages/docs/adding-web-pages'))
const DocumentProcessingPage = lazyLoad(() => import('@/pages/docs/document-processing'))
const UnderstandingChunkingPage = lazyLoad(() => import('@/pages/docs/understanding-chunking'))
const VectorSearchPage = lazyLoad(() => import('@/pages/docs/vector-search'))
const RerankingPage = lazyLoad(() => import('@/pages/docs/reranking'))
const DocumentStatusesPage = lazyLoad(() => import('@/pages/docs/document-statuses'))
const ManagingKnowledgeBasesPage = lazyLoad(() => import('@/pages/docs/managing-knowledge-bases'))
const KnowledgeBaseTemplatesPage = lazyLoad(() => import('@/pages/docs/knowledge-base-templates'))

// Phase 5 - Tools & MCP
const ToolsOverviewPage = lazyLoad(() => import('@/pages/docs/tools-overview'))
const BuiltInToolsPage = lazyLoad(() => import('@/pages/docs/built-in-tools'))
const WebSearchToolPage = lazyLoad(() => import('@/pages/docs/web-search-tool'))
const CalculatorToolPage = lazyLoad(() => import('@/pages/docs/calculator-tool'))
const UrlFetcherToolPage = lazyLoad(() => import('@/pages/docs/url-fetcher-tool'))
const CustomToolsPage = lazyLoad(() => import('@/pages/docs/custom-tools'))
const AttachingToolsPage = lazyLoad(() => import('@/pages/docs/attaching-tools'))
const McpOverviewPage = lazyLoad(() => import('@/pages/docs/mcp-overview'))
const McpServerTypesPage = lazyLoad(() => import('@/pages/docs/mcp-server-types'))
const ConnectingMcpServerPage = lazyLoad(() => import('@/pages/docs/connecting-mcp-server'))
const LinkingMcpAgentsPage = lazyLoad(() => import('@/pages/docs/linking-mcp-agents'))
const McpSecurityPage = lazyLoad(() => import('@/pages/docs/mcp-security'))

// Phase 6 - Conversations
const ConversationsPage = lazyLoad(() => import('@/pages/docs/conversations'))
const ConversationStatusesPage = lazyLoad(() => import('@/pages/docs/conversation-statuses'))
const ViewingConversationsPage = lazyLoad(() => import('@/pages/docs/viewing-conversations'))
const ReadingMessagesPage = lazyLoad(() => import('@/pages/docs/reading-messages'))
const SendingMessagesPage = lazyLoad(() => import('@/pages/docs/sending-messages'))
const MessageStreamingPage = lazyLoad(() => import('@/pages/docs/message-streaming'))
const ConversationMetadataPage = lazyLoad(() => import('@/pages/docs/conversation-metadata'))
const LeadsPage = lazyLoad(() => import('@/pages/docs/leads'))
const ResolvingConversationsPage = lazyLoad(() => import('@/pages/docs/resolving-conversations'))
const ConversationSearchPage = lazyLoad(() => import('@/pages/docs/conversation-search'))

// Phase 7 - Human Handoff
const HumanHandoffPage = lazyLoad(() => import('@/pages/docs/human-handoff'))
const HandoffSetupPage = lazyLoad(() => import('@/pages/docs/handoff-setup'))
const AssigningConversationsPage = lazyLoad(() => import('@/pages/docs/assigning-conversations'))
const AgentInboxPage = lazyLoad(() => import('@/pages/docs/agent-inbox'))
const TakingOverPage = lazyLoad(() => import('@/pages/docs/taking-over'))
const ReturningToAiPage = lazyLoad(() => import('@/pages/docs/returning-to-ai'))
const HandoffNotificationsPage = lazyLoad(() => import('@/pages/docs/handoff-notifications'))
const HandoffBestPracticesPage = lazyLoad(() => import('@/pages/docs/handoff-best-practices'))

// Phase 8 - Widgets
const WebWidgetPage = lazyLoad(() => import('@/pages/docs/web-widget'))
const CreatingWidgetPage = lazyLoad(() => import('@/pages/docs/creating-widget'))
const WidgetAppearancePage = lazyLoad(() => import('@/pages/docs/widget-appearance'))
const AllowedDomainsPage = lazyLoad(() => import('@/pages/docs/allowed-domains'))
const WidgetSettingsPage = lazyLoad(() => import('@/pages/docs/widget-settings'))
const EmbeddingScriptPage = lazyLoad(() => import('@/pages/docs/embedding-script'))
const EmbeddingJavascriptPage = lazyLoad(() => import('@/pages/docs/embedding-javascript'))
const WidgetPublicApiPage = lazyLoad(() => import('@/pages/docs/widget-public-api'))
const TestingWidgetPage = lazyLoad(() => import('@/pages/docs/testing-widget'))
const WidgetAnalyticsPage = lazyLoad(() => import('@/pages/docs/widget-analytics'))
const WidgetMultilangPage = lazyLoad(() => import('@/pages/docs/widget-multilang'))
const WidgetTroubleshootingPage = lazyLoad(() => import('@/pages/docs/widget-troubleshooting'))

// Phase 9 - Deployments
const ChannelsPage = lazyLoad(() => import('@/pages/docs/channels'))
const CreatingDeploymentPage = lazyLoad(() => import('@/pages/docs/creating-deployment'))
const DeploymentStatusesPage = lazyLoad(() => import('@/pages/docs/deployment-statuses'))
const WhatsappIntegrationPage = lazyLoad(() => import('@/pages/docs/whatsapp-integration'))
const WhatsappTwilioPage = lazyLoad(() => import('@/pages/docs/whatsapp-twilio'))
const WhatsappTemplatesPage = lazyLoad(() => import('@/pages/docs/whatsapp-templates'))
const TelegramIntegrationPage = lazyLoad(() => import('@/pages/docs/telegram-integration'))
const DiscordIntegrationPage = lazyLoad(() => import('@/pages/docs/discord-integration'))
const DiscordGatewayPage = lazyLoad(() => import('@/pages/docs/discord-gateway'))
const SlackIntegrationPage = lazyLoad(() => import('@/pages/docs/slack-integration'))
const TestingDeploymentsPage = lazyLoad(() => import('@/pages/docs/testing-deployments'))
const ManagingDeploymentsPage = lazyLoad(() => import('@/pages/docs/managing-deployments'))
const ChannelBehaviorPage = lazyLoad(() => import('@/pages/docs/channel-behavior'))

// Phase 10 - Provider Keys
const ByokPage = lazyLoad(() => import('@/pages/docs/byok'))
const SupportedProvidersPage = lazyLoad(() => import('@/pages/docs/supported-providers'))
const AddingProviderKeyPage = lazyLoad(() => import('@/pages/docs/adding-provider-key'))
const ManagingProviderKeysPage = lazyLoad(() => import('@/pages/docs/managing-provider-keys'))
const KeyResolutionPage = lazyLoad(() => import('@/pages/docs/key-resolution'))
const AvailableModelsPage = lazyLoad(() => import('@/pages/docs/available-models'))
const UsingDifferentProvidersPage = lazyLoad(() => import('@/pages/docs/using-different-providers'))
const LocalModelsPage = lazyLoad(() => import('@/pages/docs/local-models'))
const RateLimitsPage = lazyLoad(() => import('@/pages/docs/rate-limits'))
const ApiKeySecurityPage = lazyLoad(() => import('@/pages/docs/api-key-security'))

// Phase 11 - Automations
const AutomationsPage = lazyLoad(() => import('@/pages/docs/automations'))
const BroadcastsPage = lazyLoad(() => import('@/pages/docs/broadcasts'))
const CreatingBroadcastPage = lazyLoad(() => import('@/pages/docs/creating-broadcast'))
const ManagingBroadcastsPage = lazyLoad(() => import('@/pages/docs/managing-broadcasts'))
const WebhooksPage = lazyLoad(() => import('@/pages/docs/webhooks'))
const WebhookEventsPage = lazyLoad(() => import('@/pages/docs/webhook-events'))
const CreatingWebhookPage = lazyLoad(() => import('@/pages/docs/creating-webhook'))
const WebhookSecurityPage = lazyLoad(() => import('@/pages/docs/webhook-security'))
const TestingWebhooksPage = lazyLoad(() => import('@/pages/docs/testing-webhooks'))
const WebhookRetryPage = lazyLoad(() => import('@/pages/docs/webhook-retry'))
const WebhookWorkflowsPage = lazyLoad(() => import('@/pages/docs/webhook-workflows'))

// Phase 12 - Analytics
const AnalyticsDocsPage = lazyLoad(() => import('@/pages/docs/analytics'))
const DashboardAnalyticsPage = lazyLoad(() => import('@/pages/docs/dashboard-analytics'))
const PerAgentAnalyticsPage = lazyLoad(() => import('@/pages/docs/per-agent-analytics'))
const KeyMetricsPage = lazyLoad(() => import('@/pages/docs/key-metrics'))
const ChannelBreakdownPage = lazyLoad(() => import('@/pages/docs/channel-breakdown'))
const DateRangesPage = lazyLoad(() => import('@/pages/docs/date-ranges'))
const SuccessRatePage = lazyLoad(() => import('@/pages/docs/success-rate'))
const TokenTrackingPage = lazyLoad(() => import('@/pages/docs/token-tracking'))
const AuditLogsPage = lazyLoad(() => import('@/pages/docs/audit-logs'))
const ExportingAnalyticsPage = lazyLoad(() => import('@/pages/docs/exporting-analytics'))

// Phase 13 - Security
const SecurityDocsPage = lazyLoad(() => import('@/pages/docs/security'))
const ModerationPage = lazyLoad(() => import('@/pages/docs/moderation'))
const ProfanityFilterPage = lazyLoad(() => import('@/pages/docs/profanity-filter'))
const PiiDetectionPage = lazyLoad(() => import('@/pages/docs/pii-detection'))
const PromptInjectionPage = lazyLoad(() => import('@/pages/docs/prompt-injection'))
const CustomModerationPage = lazyLoad(() => import('@/pages/docs/custom-moderation'))
const BlockOnViolationPage = lazyLoad(() => import('@/pages/docs/block-on-violation'))
const AuditLogsSecurityPage = lazyLoad(() => import('@/pages/docs/audit-logs-security'))
const SsoPage = lazyLoad(() => import('@/pages/docs/sso'))
const DataRetentionPage = lazyLoad(() => import('@/pages/docs/data-retention'))
const DocsDataManagementPage = lazyLoad(() => import('@/pages/docs/data-management'))
const SecurityChecklistPage = lazyLoad(() => import('@/pages/docs/security-checklist'))

// Phase 14 - Billing
const PlansPage = lazyLoad(() => import('@/pages/docs/plans'))
const PlanFeaturesPage = lazyLoad(() => import('@/pages/docs/plan-features'))
const UsageLimitsPage = lazyLoad(() => import('@/pages/docs/usage-limits'))
const ViewingPlanPage = lazyLoad(() => import('@/pages/docs/viewing-plan'))
const UpgradingPlanPage = lazyLoad(() => import('@/pages/docs/upgrading-plan'))
const ManagingSubscriptionsPage = lazyLoad(() => import('@/pages/docs/managing-subscriptions'))
const ViewingInvoicesPage = lazyLoad(() => import('@/pages/docs/viewing-invoices'))
const CustomerPortalPage = lazyLoad(() => import('@/pages/docs/customer-portal'))
const UsageNotificationsPage = lazyLoad(() => import('@/pages/docs/usage-notifications'))
const EnterprisePlansPage = lazyLoad(() => import('@/pages/docs/enterprise-plans'))
const CancelingSubscriptionPage = lazyLoad(() => import('@/pages/docs/canceling-subscription'))

// Phase 15 - API
const ApiOverviewPage = lazyLoad(() => import('@/pages/docs/api-overview'))
const AuthenticationPage = lazyLoad(() => import('@/pages/docs/authentication'))
const FirstApiRequestPage = lazyLoad(() => import('@/pages/docs/first-api-request'))
const ApiConventionsPage = lazyLoad(() => import('@/pages/docs/api-conventions'))
const ApiAgentsPage = lazyLoad(() => import('@/pages/docs/api-agents'))
const ApiConversationsPage = lazyLoad(() => import('@/pages/docs/api-conversations'))
const ApiMessagesPage = lazyLoad(() => import('@/pages/docs/api-messages'))
const ApiKnowledgeBasesPage = lazyLoad(() => import('@/pages/docs/api-knowledge-bases'))
const StreamingApiPage = lazyLoad(() => import('@/pages/docs/streaming-api'))
const WebhookEventsReferencePage = lazyLoad(() => import('@/pages/docs/webhook-events-reference'))
const RateLimitingPage = lazyLoad(() => import('@/pages/docs/rate-limiting'))
const ErrorCodesPage = lazyLoad(() => import('@/pages/docs/error-codes'))

// Phase 16 - Troubleshooting
const WidgetNotLoadingPage = lazyLoad(() => import('@/pages/docs/widget-not-loading'))
const AgentNotRespondingPage = lazyLoad(() => import('@/pages/docs/agent-not-responding'))
const KbNotAnsweringPage = lazyLoad(() => import('@/pages/docs/kb-not-answering'))
const DeploymentErrorsPage = lazyLoad(() => import('@/pages/docs/deployment-errors'))
const WhatsappIssuesPage = lazyLoad(() => import('@/pages/docs/whatsapp-issues'))
const DiscordIssuesPage = lazyLoad(() => import('@/pages/docs/discord-issues'))
const TelegramIssuesPage = lazyLoad(() => import('@/pages/docs/telegram-issues'))
const SlackIssuesPage = lazyLoad(() => import('@/pages/docs/slack-issues'))
const StreamingNotWorkingPage = lazyLoad(() => import('@/pages/docs/streaming-not-working'))
const BillingIssuesPage = lazyLoad(() => import('@/pages/docs/billing-issues'))
const LoginIssuesPage = lazyLoad(() => import('@/pages/docs/login-issues'))
const PerformanceIssuesPage = lazyLoad(() => import('@/pages/docs/performance-issues'))

// FAQs
const FaqsPage = lazyLoad(() => import('@/pages/docs/faqs'))
const TechnicalFaqsPage = lazyLoad(() => import('@/pages/docs/technical-faqs'))
const BillingFaqsPage = lazyLoad(() => import('@/pages/docs/billing-faqs'))
const SecurityFaqsPage = lazyLoad(() => import('@/pages/docs/security-faqs'))

// Best Practices
const BestPracticesPage = lazyLoad(() => import('@/pages/docs/best-practices'))
const PromptEngineeringPage = lazyLoad(() => import('@/pages/docs/prompt-engineering'))
const KbBestPracticesPage = lazyLoad(() => import('@/pages/docs/kb-best-practices'))
const MultiChannelStrategyPage = lazyLoad(() => import('@/pages/docs/multi-channel-strategy'))
const PerformanceOptimizationPage = lazyLoad(() => import('@/pages/docs/performance-optimization'))
const SecurityBestPracticesPage = lazyLoad(() => import('@/pages/docs/security-best-practices'))
const CostOptimizationPage = lazyLoad(() => import('@/pages/docs/cost-optimization'))
const AgentDesignPatternsPage = lazyLoad(() => import('@/pages/docs/agent-design-patterns'))
const ConversationDesignPage = lazyLoad(() => import('@/pages/docs/conversation-design'))
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
            <Route element={<ErrorBoundary name="HelpDocs"><HelpLayout /></ErrorBoundary>}>
              <Route path="/docs" element={<HelpIndexPage />} />
              <Route path="/docs/what-is-convio" element={<WhatIsConvioPage />} />
              <Route path="/docs/roadmap" element={<ComingSoonPage />} />
              <Route path="/docs/plan" element={<ComingSoonPage />} />

              {/* Phase 1 - Getting Started */}
              <Route path="/docs/convio-vs-others" element={<ConvioVsOthersPage />} />
              <Route path="/docs/creating-account" element={<CreatingAccountPage />} />
              <Route path="/docs/dashboard-tour" element={<DashboardTourPage />} />
              <Route path="/docs/first-organization" element={<CreatingOrganizationPage />} />
              <Route path="/docs/vocabulary" element={<VocabularyPage />} />

              {/* Phase 2 - Organizations */}
              <Route path="/docs/organizations" element={<OrganizationsPage />} />
              <Route path="/docs/roles" element={<RolesPage />} />
              <Route path="/docs/inviting-members" element={<InvitingMembersPage />} />
              <Route path="/docs/managing-members" element={<ManagingMembersPage />} />
              <Route path="/docs/transferring-ownership" element={<TransferringOwnershipPage />} />
              <Route path="/docs/leaving-organization" element={<LeavingOrganizationPage />} />
              <Route path="/docs/login-activity" element={<LoginActivityPage />} />

              {/* Phase 3 - AI Agents */}
              <Route path="/docs/ai-agents" element={<AiAgentsPage />} />
              <Route path="/docs/creating-agent" element={<CreatingAgentPage />} />
              <Route path="/docs/ai-models" element={<AiModelsPage />} />
              <Route path="/docs/system-prompts" element={<SystemPromptsPage />} />
              <Route path="/docs/agent-settings" element={<AgentSettingsPage />} />
              <Route path="/docs/welcome-messages" element={<WelcomeMessagesPage />} />
              <Route path="/docs/agent-playground" element={<AgentPlaygroundPage />} />
              <Route path="/docs/agent-statuses" element={<AgentStatusesPage />} />
              <Route path="/docs/cloning-agents" element={<CloningAgentsPage />} />

              {/* Phase 4 - Knowledge Bases */}
              <Route path="/docs/what-is-knowledge-base" element={<WhatIsKnowledgeBasePage />} />
              <Route path="/docs/creating-knowledge-base" element={<CreatingKnowledgeBasePage />} />
              <Route path="/docs/supported-documents" element={<SupportedDocumentsPage />} />
              <Route path="/docs/uploading-documents" element={<UploadingDocumentsPage />} />
              <Route path="/docs/adding-web-pages" element={<AddingWebPagesPage />} />
              <Route path="/docs/document-processing" element={<DocumentProcessingPage />} />
              <Route path="/docs/understanding-chunking" element={<UnderstandingChunkingPage />} />
              <Route path="/docs/vector-search" element={<VectorSearchPage />} />
              <Route path="/docs/reranking" element={<RerankingPage />} />
              <Route path="/docs/document-statuses" element={<DocumentStatusesPage />} />
              <Route path="/docs/managing-knowledge-bases" element={<ManagingKnowledgeBasesPage />} />
              <Route path="/docs/knowledge-base-templates" element={<KnowledgeBaseTemplatesPage />} />

              {/* Phase 5 - Tools & MCP */}
              <Route path="/docs/tools-overview" element={<ToolsOverviewPage />} />
              <Route path="/docs/built-in-tools" element={<BuiltInToolsPage />} />
              <Route path="/docs/web-search-tool" element={<WebSearchToolPage />} />
              <Route path="/docs/calculator-tool" element={<CalculatorToolPage />} />
              <Route path="/docs/url-fetcher-tool" element={<UrlFetcherToolPage />} />
              <Route path="/docs/custom-tools" element={<CustomToolsPage />} />
              <Route path="/docs/attaching-tools" element={<AttachingToolsPage />} />
              <Route path="/docs/mcp-overview" element={<McpOverviewPage />} />
              <Route path="/docs/mcp-server-types" element={<McpServerTypesPage />} />
              <Route path="/docs/connecting-mcp-server" element={<ConnectingMcpServerPage />} />
              <Route path="/docs/linking-mcp-agents" element={<LinkingMcpAgentsPage />} />
              <Route path="/docs/mcp-security" element={<McpSecurityPage />} />

              {/* Phase 6 - Conversations */}
              <Route path="/docs/conversations" element={<ConversationsPage />} />
              <Route path="/docs/conversation-statuses" element={<ConversationStatusesPage />} />
              <Route path="/docs/viewing-conversations" element={<ViewingConversationsPage />} />
              <Route path="/docs/reading-messages" element={<ReadingMessagesPage />} />
              <Route path="/docs/sending-messages" element={<SendingMessagesPage />} />
              <Route path="/docs/message-streaming" element={<MessageStreamingPage />} />
              <Route path="/docs/conversation-metadata" element={<ConversationMetadataPage />} />
              <Route path="/docs/leads" element={<LeadsPage />} />
              <Route path="/docs/resolving-conversations" element={<ResolvingConversationsPage />} />
              <Route path="/docs/conversation-search" element={<ConversationSearchPage />} />

              {/* Phase 7 - Human Handoff */}
              <Route path="/docs/human-handoff" element={<HumanHandoffPage />} />
              <Route path="/docs/handoff-setup" element={<HandoffSetupPage />} />
              <Route path="/docs/assigning-conversations" element={<AssigningConversationsPage />} />
              <Route path="/docs/agent-inbox" element={<AgentInboxPage />} />
              <Route path="/docs/taking-over" element={<TakingOverPage />} />
              <Route path="/docs/returning-to-ai" element={<ReturningToAiPage />} />
              <Route path="/docs/handoff-notifications" element={<HandoffNotificationsPage />} />
              <Route path="/docs/handoff-best-practices" element={<HandoffBestPracticesPage />} />

              {/* Phase 8 - Widgets */}
              <Route path="/docs/web-widget" element={<WebWidgetPage />} />
              <Route path="/docs/creating-widget" element={<CreatingWidgetPage />} />
              <Route path="/docs/widget-appearance" element={<WidgetAppearancePage />} />
              <Route path="/docs/allowed-domains" element={<AllowedDomainsPage />} />
              <Route path="/docs/widget-settings" element={<WidgetSettingsPage />} />
              <Route path="/docs/embedding-script" element={<EmbeddingScriptPage />} />
              <Route path="/docs/embedding-javascript" element={<EmbeddingJavascriptPage />} />
              <Route path="/docs/widget-public-api" element={<WidgetPublicApiPage />} />
              <Route path="/docs/testing-widget" element={<TestingWidgetPage />} />
              <Route path="/docs/widget-analytics" element={<WidgetAnalyticsPage />} />
              <Route path="/docs/widget-multilang" element={<WidgetMultilangPage />} />
              <Route path="/docs/widget-troubleshooting" element={<WidgetTroubleshootingPage />} />

              {/* Phase 9 - Deployments */}
              <Route path="/docs/channels" element={<ChannelsPage />} />
              <Route path="/docs/creating-deployment" element={<CreatingDeploymentPage />} />
              <Route path="/docs/deployment-statuses" element={<DeploymentStatusesPage />} />
              <Route path="/docs/whatsapp-integration" element={<WhatsappIntegrationPage />} />
              <Route path="/docs/whatsapp-twilio" element={<WhatsappTwilioPage />} />
              <Route path="/docs/whatsapp-templates" element={<WhatsappTemplatesPage />} />
              <Route path="/docs/telegram-integration" element={<TelegramIntegrationPage />} />
              <Route path="/docs/discord-integration" element={<DiscordIntegrationPage />} />
              <Route path="/docs/discord-gateway" element={<DiscordGatewayPage />} />
              <Route path="/docs/slack-integration" element={<SlackIntegrationPage />} />
              <Route path="/docs/testing-deployments" element={<TestingDeploymentsPage />} />
              <Route path="/docs/managing-deployments" element={<ManagingDeploymentsPage />} />
              <Route path="/docs/channel-behavior" element={<ChannelBehaviorPage />} />

              {/* Phase 10 - Provider Keys */}
              <Route path="/docs/byok" element={<ByokPage />} />
              <Route path="/docs/supported-providers" element={<SupportedProvidersPage />} />
              <Route path="/docs/adding-provider-key" element={<AddingProviderKeyPage />} />
              <Route path="/docs/managing-provider-keys" element={<ManagingProviderKeysPage />} />
              <Route path="/docs/key-resolution" element={<KeyResolutionPage />} />
              <Route path="/docs/available-models" element={<AvailableModelsPage />} />
              <Route path="/docs/using-different-providers" element={<UsingDifferentProvidersPage />} />
              <Route path="/docs/local-models" element={<LocalModelsPage />} />
              <Route path="/docs/rate-limits" element={<RateLimitsPage />} />
              <Route path="/docs/api-key-security" element={<ApiKeySecurityPage />} />

              {/* Phase 11 - Automations */}
              <Route path="/docs/automations" element={<AutomationsPage />} />
              <Route path="/docs/broadcasts" element={<BroadcastsPage />} />
              <Route path="/docs/creating-broadcast" element={<CreatingBroadcastPage />} />
              <Route path="/docs/managing-broadcasts" element={<ManagingBroadcastsPage />} />
              <Route path="/docs/webhooks" element={<WebhooksPage />} />
              <Route path="/docs/webhook-events" element={<WebhookEventsPage />} />
              <Route path="/docs/creating-webhook" element={<CreatingWebhookPage />} />
              <Route path="/docs/webhook-security" element={<WebhookSecurityPage />} />
              <Route path="/docs/testing-webhooks" element={<TestingWebhooksPage />} />
              <Route path="/docs/webhook-retry" element={<WebhookRetryPage />} />
              <Route path="/docs/webhook-workflows" element={<WebhookWorkflowsPage />} />

              {/* Phase 12 - Analytics */}
              <Route path="/docs/analytics" element={<AnalyticsDocsPage />} />
              <Route path="/docs/dashboard-analytics" element={<DashboardAnalyticsPage />} />
              <Route path="/docs/per-agent-analytics" element={<PerAgentAnalyticsPage />} />
              <Route path="/docs/key-metrics" element={<KeyMetricsPage />} />
              <Route path="/docs/channel-breakdown" element={<ChannelBreakdownPage />} />
              <Route path="/docs/date-ranges" element={<DateRangesPage />} />
              <Route path="/docs/success-rate" element={<SuccessRatePage />} />
              <Route path="/docs/token-tracking" element={<TokenTrackingPage />} />
              <Route path="/docs/audit-logs" element={<AuditLogsPage />} />
              <Route path="/docs/exporting-analytics" element={<ExportingAnalyticsPage />} />

              {/* Phase 13 - Security */}
              <Route path="/docs/security" element={<SecurityDocsPage />} />
              <Route path="/docs/moderation" element={<ModerationPage />} />
              <Route path="/docs/profanity-filter" element={<ProfanityFilterPage />} />
              <Route path="/docs/pii-detection" element={<PiiDetectionPage />} />
              <Route path="/docs/prompt-injection" element={<PromptInjectionPage />} />
              <Route path="/docs/custom-moderation" element={<CustomModerationPage />} />
              <Route path="/docs/block-on-violation" element={<BlockOnViolationPage />} />
              <Route path="/docs/audit-logs-security" element={<AuditLogsSecurityPage />} />
              <Route path="/docs/sso" element={<SsoPage />} />
              <Route path="/docs/data-retention" element={<DataRetentionPage />} />
              <Route path="/docs/data-management" element={<DocsDataManagementPage />} />
              <Route path="/docs/security-checklist" element={<SecurityChecklistPage />} />

              {/* Phase 14 - Billing */}
              <Route path="/docs/plans" element={<PlansPage />} />
              <Route path="/docs/plan-features" element={<PlanFeaturesPage />} />
              <Route path="/docs/usage-limits" element={<UsageLimitsPage />} />
              <Route path="/docs/viewing-plan" element={<ViewingPlanPage />} />
              <Route path="/docs/upgrading-plan" element={<UpgradingPlanPage />} />
              <Route path="/docs/managing-subscriptions" element={<ManagingSubscriptionsPage />} />
              <Route path="/docs/viewing-invoices" element={<ViewingInvoicesPage />} />
              <Route path="/docs/customer-portal" element={<CustomerPortalPage />} />
              <Route path="/docs/usage-notifications" element={<UsageNotificationsPage />} />
              <Route path="/docs/enterprise-plans" element={<EnterprisePlansPage />} />
              <Route path="/docs/canceling-subscription" element={<CancelingSubscriptionPage />} />

              {/* Phase 15 - API */}
              <Route path="/docs/api-overview" element={<ApiOverviewPage />} />
              <Route path="/docs/authentication" element={<AuthenticationPage />} />
              <Route path="/docs/first-api-request" element={<FirstApiRequestPage />} />
              <Route path="/docs/api-conventions" element={<ApiConventionsPage />} />
              <Route path="/docs/api-agents" element={<ApiAgentsPage />} />
              <Route path="/docs/api-conversations" element={<ApiConversationsPage />} />
              <Route path="/docs/api-messages" element={<ApiMessagesPage />} />
              <Route path="/docs/api-knowledge-bases" element={<ApiKnowledgeBasesPage />} />
              <Route path="/docs/streaming-api" element={<StreamingApiPage />} />
              <Route path="/docs/webhook-events-reference" element={<WebhookEventsReferencePage />} />
              <Route path="/docs/rate-limiting" element={<RateLimitingPage />} />
              <Route path="/docs/error-codes" element={<ErrorCodesPage />} />

              {/* Phase 16 - Troubleshooting */}
              <Route path="/docs/widget-not-loading" element={<WidgetNotLoadingPage />} />
              <Route path="/docs/agent-not-responding" element={<AgentNotRespondingPage />} />
              <Route path="/docs/kb-not-answering" element={<KbNotAnsweringPage />} />
              <Route path="/docs/deployment-errors" element={<DeploymentErrorsPage />} />
              <Route path="/docs/whatsapp-issues" element={<WhatsappIssuesPage />} />
              <Route path="/docs/discord-issues" element={<DiscordIssuesPage />} />
              <Route path="/docs/telegram-issues" element={<TelegramIssuesPage />} />
              <Route path="/docs/slack-issues" element={<SlackIssuesPage />} />
              <Route path="/docs/streaming-not-working" element={<StreamingNotWorkingPage />} />
              <Route path="/docs/billing-issues" element={<BillingIssuesPage />} />
              <Route path="/docs/login-issues" element={<LoginIssuesPage />} />
              <Route path="/docs/performance-issues" element={<PerformanceIssuesPage />} />

              {/* FAQs */}
              <Route path="/docs/faqs" element={<FaqsPage />} />
              <Route path="/docs/technical-faqs" element={<TechnicalFaqsPage />} />
              <Route path="/docs/billing-faqs" element={<BillingFaqsPage />} />
              <Route path="/docs/security-faqs" element={<SecurityFaqsPage />} />

              {/* Best Practices */}
              <Route path="/docs/best-practices" element={<BestPracticesPage />} />
              <Route path="/docs/prompt-engineering" element={<PromptEngineeringPage />} />
              <Route path="/docs/kb-best-practices" element={<KbBestPracticesPage />} />
              <Route path="/docs/multi-channel-strategy" element={<MultiChannelStrategyPage />} />
              <Route path="/docs/performance-optimization" element={<PerformanceOptimizationPage />} />
              <Route path="/docs/security-best-practices" element={<SecurityBestPracticesPage />} />
              <Route path="/docs/cost-optimization" element={<CostOptimizationPage />} />
              <Route path="/docs/agent-design-patterns" element={<AgentDesignPatternsPage />} />
              <Route path="/docs/conversation-design" element={<ConversationDesignPage />} />
            </Route>
            <Route element={<ErrorBoundary name="Dashboard"><DashboardLayout /></ErrorBoundary>}>
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
                 <Route path="audit-logs" element={<SettingsAuditLogsPage />} />
                </Route>
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
                <Route path="/admin/agents" element={<AdminAgentsPage />} />
                <Route path="/admin/system" element={<AdminSystemPage />} />
                <Route path="/admin/moderation" element={<AdminModerationPage />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="/admin/billing" element={<AdminBillingPage />} />
                <Route path="/admin/pricing" element={<AdminPricingPage />} />
                <Route path="/admin/pricing/:id" element={<AdminPlanDetailPage />} />
                <Route path="/admin/providers" element={<AdminProvidersPage />} />
                <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
                <Route path="/admin/docs-feedback" element={<AdminDocsFeedbackPage />} />
                <Route path="/admin/access" element={<AdminAccessPage />} />
                <Route path="/admin/knowledge-bases" element={<AdminKnowledgeBasesPage />} />
                <Route path="/admin/knowledge-bases/:id" element={<AdminKnowledgeBaseDetailPage />} />
                <Route path="/admin/knowledge-bases/:kbId/documents/:documentId" element={<AdminKnowledgeDocumentDetailPage />} />
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
