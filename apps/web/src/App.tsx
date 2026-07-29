import { lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/lib/auth-context'
import { RedirectAuthenticated } from '@/components/auth/redirect-authenticated'
import { OrgProvider } from '@/lib/org-context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AdminLayout } from '@/admin/admin-layout'

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
const ConvioVsOthersPage = lazy(() => import('@/pages/docs/convio-vs-others'))
const CreatingAccountPage = lazy(() => import('@/pages/docs/creating-account'))
const DashboardTourPage = lazy(() => import('@/pages/docs/dashboard-tour'))
const CreatingOrganizationPage = lazy(() => import('@/pages/docs/creating-organization'))
const VocabularyPage = lazy(() => import('@/pages/docs/vocabulary'))

// Phase 2 - Organizations
const OrganizationsPage = lazy(() => import('@/pages/docs/organizations'))
const RolesPage = lazy(() => import('@/pages/docs/roles'))
const InvitingMembersPage = lazy(() => import('@/pages/docs/inviting-members'))
const ManagingMembersPage = lazy(() => import('@/pages/docs/managing-members'))
const TransferringOwnershipPage = lazy(() => import('@/pages/docs/transferring-ownership'))
const LeavingOrganizationPage = lazy(() => import('@/pages/docs/leaving-organization'))
const LoginActivityPage = lazy(() => import('@/pages/docs/login-activity'))

// Phase 3 - AI Agents
const AiAgentsPage = lazy(() => import('@/pages/docs/ai-agents'))
const CreatingAgentPage = lazy(() => import('@/pages/docs/creating-agent'))
const AiModelsPage = lazy(() => import('@/pages/docs/ai-models'))
const SystemPromptsPage = lazy(() => import('@/pages/docs/system-prompts'))
const AgentSettingsPage = lazy(() => import('@/pages/docs/agent-settings'))
const WelcomeMessagesPage = lazy(() => import('@/pages/docs/welcome-messages'))
const AgentPlaygroundPage = lazy(() => import('@/pages/docs/agent-playground'))
const AgentStatusesPage = lazy(() => import('@/pages/docs/agent-statuses'))
const CloningAgentsPage = lazy(() => import('@/pages/docs/cloning-agents'))

// Phase 4 - Knowledge Bases
const WhatIsKnowledgeBasePage = lazy(() => import('@/pages/docs/what-is-knowledge-base'))
const CreatingKnowledgeBasePage = lazy(() => import('@/pages/docs/creating-knowledge-base'))
const SupportedDocumentsPage = lazy(() => import('@/pages/docs/supported-documents'))
const UploadingDocumentsPage = lazy(() => import('@/pages/docs/uploading-documents'))
const AddingWebPagesPage = lazy(() => import('@/pages/docs/adding-web-pages'))
const DocumentProcessingPage = lazy(() => import('@/pages/docs/document-processing'))
const UnderstandingChunkingPage = lazy(() => import('@/pages/docs/understanding-chunking'))
const VectorSearchPage = lazy(() => import('@/pages/docs/vector-search'))
const RerankingPage = lazy(() => import('@/pages/docs/reranking'))
const DocumentStatusesPage = lazy(() => import('@/pages/docs/document-statuses'))
const ManagingKnowledgeBasesPage = lazy(() => import('@/pages/docs/managing-knowledge-bases'))
const KnowledgeBaseTemplatesPage = lazy(() => import('@/pages/docs/knowledge-base-templates'))

// Phase 5 - Tools & MCP
const ToolsOverviewPage = lazy(() => import('@/pages/docs/tools-overview'))
const BuiltInToolsPage = lazy(() => import('@/pages/docs/built-in-tools'))
const WebSearchToolPage = lazy(() => import('@/pages/docs/web-search-tool'))
const CalculatorToolPage = lazy(() => import('@/pages/docs/calculator-tool'))
const UrlFetcherToolPage = lazy(() => import('@/pages/docs/url-fetcher-tool'))
const CustomToolsPage = lazy(() => import('@/pages/docs/custom-tools'))
const AttachingToolsPage = lazy(() => import('@/pages/docs/attaching-tools'))
const McpOverviewPage = lazy(() => import('@/pages/docs/mcp-overview'))
const McpServerTypesPage = lazy(() => import('@/pages/docs/mcp-server-types'))
const ConnectingMcpServerPage = lazy(() => import('@/pages/docs/connecting-mcp-server'))
const LinkingMcpAgentsPage = lazy(() => import('@/pages/docs/linking-mcp-agents'))
const McpSecurityPage = lazy(() => import('@/pages/docs/mcp-security'))

// Phase 6 - Conversations
const ConversationsPage = lazy(() => import('@/pages/docs/conversations'))
const ConversationStatusesPage = lazy(() => import('@/pages/docs/conversation-statuses'))
const ViewingConversationsPage = lazy(() => import('@/pages/docs/viewing-conversations'))
const ReadingMessagesPage = lazy(() => import('@/pages/docs/reading-messages'))
const SendingMessagesPage = lazy(() => import('@/pages/docs/sending-messages'))
const MessageStreamingPage = lazy(() => import('@/pages/docs/message-streaming'))
const ConversationMetadataPage = lazy(() => import('@/pages/docs/conversation-metadata'))
const LeadsPage = lazy(() => import('@/pages/docs/leads'))
const ResolvingConversationsPage = lazy(() => import('@/pages/docs/resolving-conversations'))
const ConversationSearchPage = lazy(() => import('@/pages/docs/conversation-search'))

// Phase 7 - Human Handoff
const HumanHandoffPage = lazy(() => import('@/pages/docs/human-handoff'))
const HandoffSetupPage = lazy(() => import('@/pages/docs/handoff-setup'))
const AssigningConversationsPage = lazy(() => import('@/pages/docs/assigning-conversations'))
const AgentInboxPage = lazy(() => import('@/pages/docs/agent-inbox'))
const TakingOverPage = lazy(() => import('@/pages/docs/taking-over'))
const ReturningToAiPage = lazy(() => import('@/pages/docs/returning-to-ai'))
const HandoffNotificationsPage = lazy(() => import('@/pages/docs/handoff-notifications'))
const HandoffBestPracticesPage = lazy(() => import('@/pages/docs/handoff-best-practices'))

// Phase 8 - Widgets
const WebWidgetPage = lazy(() => import('@/pages/docs/web-widget'))
const CreatingWidgetPage = lazy(() => import('@/pages/docs/creating-widget'))
const WidgetAppearancePage = lazy(() => import('@/pages/docs/widget-appearance'))
const AllowedDomainsPage = lazy(() => import('@/pages/docs/allowed-domains'))
const WidgetSettingsPage = lazy(() => import('@/pages/docs/widget-settings'))
const EmbeddingScriptPage = lazy(() => import('@/pages/docs/embedding-script'))
const EmbeddingJavascriptPage = lazy(() => import('@/pages/docs/embedding-javascript'))
const WidgetPublicApiPage = lazy(() => import('@/pages/docs/widget-public-api'))
const TestingWidgetPage = lazy(() => import('@/pages/docs/testing-widget'))
const WidgetAnalyticsPage = lazy(() => import('@/pages/docs/widget-analytics'))
const WidgetMultilangPage = lazy(() => import('@/pages/docs/widget-multilang'))
const WidgetTroubleshootingPage = lazy(() => import('@/pages/docs/widget-troubleshooting'))

// Phase 9 - Deployments
const ChannelsPage = lazy(() => import('@/pages/docs/channels'))
const CreatingDeploymentPage = lazy(() => import('@/pages/docs/creating-deployment'))
const DeploymentStatusesPage = lazy(() => import('@/pages/docs/deployment-statuses'))
const WhatsappIntegrationPage = lazy(() => import('@/pages/docs/whatsapp-integration'))
const WhatsappTwilioPage = lazy(() => import('@/pages/docs/whatsapp-twilio'))
const WhatsappTemplatesPage = lazy(() => import('@/pages/docs/whatsapp-templates'))
const TelegramIntegrationPage = lazy(() => import('@/pages/docs/telegram-integration'))
const DiscordIntegrationPage = lazy(() => import('@/pages/docs/discord-integration'))
const DiscordGatewayPage = lazy(() => import('@/pages/docs/discord-gateway'))
const SlackIntegrationPage = lazy(() => import('@/pages/docs/slack-integration'))
const TestingDeploymentsPage = lazy(() => import('@/pages/docs/testing-deployments'))
const ManagingDeploymentsPage = lazy(() => import('@/pages/docs/managing-deployments'))
const ChannelBehaviorPage = lazy(() => import('@/pages/docs/channel-behavior'))

// Phase 10 - Provider Keys
const ByokPage = lazy(() => import('@/pages/docs/byok'))
const SupportedProvidersPage = lazy(() => import('@/pages/docs/supported-providers'))
const AddingProviderKeyPage = lazy(() => import('@/pages/docs/adding-provider-key'))
const ManagingProviderKeysPage = lazy(() => import('@/pages/docs/managing-provider-keys'))
const KeyResolutionPage = lazy(() => import('@/pages/docs/key-resolution'))
const AvailableModelsPage = lazy(() => import('@/pages/docs/available-models'))
const UsingDifferentProvidersPage = lazy(() => import('@/pages/docs/using-different-providers'))
const LocalModelsPage = lazy(() => import('@/pages/docs/local-models'))
const RateLimitsPage = lazy(() => import('@/pages/docs/rate-limits'))
const ApiKeySecurityPage = lazy(() => import('@/pages/docs/api-key-security'))

// Phase 11 - Automations
const AutomationsPage = lazy(() => import('@/pages/docs/automations'))
const BroadcastsPage = lazy(() => import('@/pages/docs/broadcasts'))
const CreatingBroadcastPage = lazy(() => import('@/pages/docs/creating-broadcast'))
const ManagingBroadcastsPage = lazy(() => import('@/pages/docs/managing-broadcasts'))
const WebhooksPage = lazy(() => import('@/pages/docs/webhooks'))
const WebhookEventsPage = lazy(() => import('@/pages/docs/webhook-events'))
const CreatingWebhookPage = lazy(() => import('@/pages/docs/creating-webhook'))
const WebhookSecurityPage = lazy(() => import('@/pages/docs/webhook-security'))
const TestingWebhooksPage = lazy(() => import('@/pages/docs/testing-webhooks'))
const WebhookRetryPage = lazy(() => import('@/pages/docs/webhook-retry'))
const WebhookWorkflowsPage = lazy(() => import('@/pages/docs/webhook-workflows'))

// Phase 12 - Analytics
const AnalyticsDocsPage = lazy(() => import('@/pages/docs/analytics'))
const DashboardAnalyticsPage = lazy(() => import('@/pages/docs/dashboard-analytics'))
const PerAgentAnalyticsPage = lazy(() => import('@/pages/docs/per-agent-analytics'))
const KeyMetricsPage = lazy(() => import('@/pages/docs/key-metrics'))
const ChannelBreakdownPage = lazy(() => import('@/pages/docs/channel-breakdown'))
const DateRangesPage = lazy(() => import('@/pages/docs/date-ranges'))
const SuccessRatePage = lazy(() => import('@/pages/docs/success-rate'))
const TokenTrackingPage = lazy(() => import('@/pages/docs/token-tracking'))
const AuditLogsPage = lazy(() => import('@/pages/docs/audit-logs'))
const ExportingAnalyticsPage = lazy(() => import('@/pages/docs/exporting-analytics'))

// Phase 13 - Security
const SecurityDocsPage = lazy(() => import('@/pages/docs/security'))
const ModerationPage = lazy(() => import('@/pages/docs/moderation'))
const ProfanityFilterPage = lazy(() => import('@/pages/docs/profanity-filter'))
const PiiDetectionPage = lazy(() => import('@/pages/docs/pii-detection'))
const PromptInjectionPage = lazy(() => import('@/pages/docs/prompt-injection'))
const CustomModerationPage = lazy(() => import('@/pages/docs/custom-moderation'))
const BlockOnViolationPage = lazy(() => import('@/pages/docs/block-on-violation'))
const AuditLogsSecurityPage = lazy(() => import('@/pages/docs/audit-logs-security'))
const SsoPage = lazy(() => import('@/pages/docs/sso'))
const DataRetentionPage = lazy(() => import('@/pages/docs/data-retention'))
const DocsDataManagementPage = lazy(() => import('@/pages/docs/data-management'))
const SecurityChecklistPage = lazy(() => import('@/pages/docs/security-checklist'))

// Phase 14 - Billing
const PlansPage = lazy(() => import('@/pages/docs/plans'))
const PlanFeaturesPage = lazy(() => import('@/pages/docs/plan-features'))
const UsageLimitsPage = lazy(() => import('@/pages/docs/usage-limits'))
const ViewingPlanPage = lazy(() => import('@/pages/docs/viewing-plan'))
const UpgradingPlanPage = lazy(() => import('@/pages/docs/upgrading-plan'))
const ManagingSubscriptionsPage = lazy(() => import('@/pages/docs/managing-subscriptions'))
const ViewingInvoicesPage = lazy(() => import('@/pages/docs/viewing-invoices'))
const CustomerPortalPage = lazy(() => import('@/pages/docs/customer-portal'))
const UsageNotificationsPage = lazy(() => import('@/pages/docs/usage-notifications'))
const EnterprisePlansPage = lazy(() => import('@/pages/docs/enterprise-plans'))
const CancelingSubscriptionPage = lazy(() => import('@/pages/docs/canceling-subscription'))

// Phase 15 - API
const ApiOverviewPage = lazy(() => import('@/pages/docs/api-overview'))
const AuthenticationPage = lazy(() => import('@/pages/docs/authentication'))
const FirstApiRequestPage = lazy(() => import('@/pages/docs/first-api-request'))
const ApiConventionsPage = lazy(() => import('@/pages/docs/api-conventions'))
const ApiAgentsPage = lazy(() => import('@/pages/docs/api-agents'))
const ApiConversationsPage = lazy(() => import('@/pages/docs/api-conversations'))
const ApiMessagesPage = lazy(() => import('@/pages/docs/api-messages'))
const ApiKnowledgeBasesPage = lazy(() => import('@/pages/docs/api-knowledge-bases'))
const StreamingApiPage = lazy(() => import('@/pages/docs/streaming-api'))
const WebhookEventsReferencePage = lazy(() => import('@/pages/docs/webhook-events-reference'))
const RateLimitingPage = lazy(() => import('@/pages/docs/rate-limiting'))
const ErrorCodesPage = lazy(() => import('@/pages/docs/error-codes'))

// Phase 16 - Troubleshooting
const WidgetNotLoadingPage = lazy(() => import('@/pages/docs/widget-not-loading'))
const AgentNotRespondingPage = lazy(() => import('@/pages/docs/agent-not-responding'))
const KbNotAnsweringPage = lazy(() => import('@/pages/docs/kb-not-answering'))
const DeploymentErrorsPage = lazy(() => import('@/pages/docs/deployment-errors'))
const WhatsappIssuesPage = lazy(() => import('@/pages/docs/whatsapp-issues'))
const DiscordIssuesPage = lazy(() => import('@/pages/docs/discord-issues'))
const TelegramIssuesPage = lazy(() => import('@/pages/docs/telegram-issues'))
const SlackIssuesPage = lazy(() => import('@/pages/docs/slack-issues'))
const StreamingNotWorkingPage = lazy(() => import('@/pages/docs/streaming-not-working'))
const BillingIssuesPage = lazy(() => import('@/pages/docs/billing-issues'))
const LoginIssuesPage = lazy(() => import('@/pages/docs/login-issues'))
const PerformanceIssuesPage = lazy(() => import('@/pages/docs/performance-issues'))

// FAQs
const FaqsPage = lazy(() => import('@/pages/docs/faqs'))
const TechnicalFaqsPage = lazy(() => import('@/pages/docs/technical-faqs'))
const BillingFaqsPage = lazy(() => import('@/pages/docs/billing-faqs'))
const SecurityFaqsPage = lazy(() => import('@/pages/docs/security-faqs'))

// Best Practices
const BestPracticesPage = lazy(() => import('@/pages/docs/best-practices'))
const PromptEngineeringPage = lazy(() => import('@/pages/docs/prompt-engineering'))
const KbBestPracticesPage = lazy(() => import('@/pages/docs/kb-best-practices'))
const MultiChannelStrategyPage = lazy(() => import('@/pages/docs/multi-channel-strategy'))
const PerformanceOptimizationPage = lazy(() => import('@/pages/docs/performance-optimization'))
const SecurityBestPracticesPage = lazy(() => import('@/pages/docs/security-best-practices'))
const CostOptimizationPage = lazy(() => import('@/pages/docs/cost-optimization'))
const AgentDesignPatternsPage = lazy(() => import('@/pages/docs/agent-design-patterns'))
const ConversationDesignPage = lazy(() => import('@/pages/docs/conversation-design'))
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
            <Route element={<HelpLayout />}>
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
                 <Route path="audit-logs" element={<SettingsAuditLogsPage />} />
                </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Admin Dashboard — Coming Soon</div>} />
              <Route path="/admin/users" element={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">User Management — Coming Soon</div>} />
              <Route path="/admin/organizations" element={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Organizations — Coming Soon</div>} />
              <Route path="/admin/analytics" element={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Analytics — Coming Soon</div>} />
              <Route path="/admin/agents" element={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Agent Monitoring — Coming Soon</div>} />
              <Route path="/admin/system" element={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">System Health — Coming Soon</div>} />
              <Route path="/admin/moderation" element={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Moderation — Coming Soon</div>} />
              <Route path="/admin/billing" element={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Billing Overview — Coming Soon</div>} />
              <Route path="/admin/providers" element={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Provider Management — Coming Soon</div>} />
              <Route path="/admin/announcements" element={<div className="flex items-center justify-center h-full text-muted-foreground text-sm">Announcements — Coming Soon</div>} />
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
