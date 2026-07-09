# Convio — Frontend Structure

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React + Vite + TypeScript |
| UI | shadcn/ui + Tailwind |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack Query |
| State | React hooks + TanStack Query cache |
| Styling | 100% Semantic Tokens (no hardcoded colors) |

---

## Pages & Routes

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Marketing page |
| Login | `/login` | Email/password + OAuth |
| Signup | `/signup` | Create account |
| Dashboard | `/dashboard` | Overview, stats |
| Agents | `/agents` | List all agents |
| Agent Editor | `/agents/:id` | Edit agent config |
| Conversations | `/conversations` | Chat inbox |
| Chat | `/conversations/:id` | Single chat (Split View) |
| Knowledge | `/knowledge` | Knowledge bases |
| Analytics | `/analytics` | Reports |
| Deployments | `/deployments` | Channel connections |
| Settings | `/settings` | Account, org, billing |

---

## Layout

### Sidebar

- Desktop: Collapsible
- Tablet: Collapsible by default
- Mobile: Drawer

```
layout/
├── AppSidebar.tsx
├── SidebarNav.tsx
├── Header.tsx
├── UserMenu.tsx
├── ThemeToggle.tsx
├── OrganizationSwitcher.tsx
├── CommandMenu.tsx
├── Breadcrumbs.tsx
└── Footer.tsx
```

---

## Component Categories

```
apps/web/src/
├── components/
│   ├── ui/                 ← shadcn components (auto-generated)
│   ├── layout/             ← Sidebar, Header, Footer
│   ├── agents/             ← AgentCard, AgentList, AgentEditor
│   ├── chat/               ← Chat components (modular)
│   ├── knowledge/          ← KnowledgeCard, DocumentUpload
│   ├── analytics/          ← Charts, StatsCards
│   ├── deployments/        ← DeploymentCard, ChannelConfig
│   ├── dashboard/          ← Dashboard widgets
│   └── shared/             ← Reusable components
```

---

## Agent List

| Component | Layout | Reason |
|-----------|--------|--------|
| **Agents** | Grid | Visual (avatar, status, channels) — cards better |

---

## Chat Components (Modular)

```
chat/
├── ChatLayout.tsx
├── ConversationList.tsx
├── ConversationItem.tsx
├── ChatHeader.tsx
├── MessageScroller.tsx      ← shadcn MessageScroller
├── Message.tsx               ← shadcn Message
├── Bubble.tsx                ← shadcn Bubble
├── PromptInput.tsx
├── TypingIndicator.tsx
├── Sources.tsx
├── ToolCall.tsx
├── Reasoning.tsx
├── Attachment.tsx            ← shadcn Attachment
├── ScrollToBottom.tsx
└── EmptyConversation.tsx
```

### Chat Layout: Split View

```
┌─────────────────────────────────────────────┐
│  Conversations List  │    Chat Area         │
│  ─────────────────   │  ────────────────    │
│  • User A      2m    │  Header              │
│  • User B      5m    │  ────────────────    │
│  • User C      1h    │  Messages            │
│  • User D      3h    │  (MessageScroller)   │
│                      │                      │
│                      │  ────────────────    │
│                      │  PromptInput         │
└─────────────────────────────────────────────┘
```

---

## Dashboard Widgets

```
dashboard/
├── OverviewCards.tsx
├── RecentConversations.tsx
├── ActiveBots.tsx
├── ActivityChart.tsx
├── UsageChart.tsx
├── TopAgents.tsx
└── QuickActions.tsx
```

---

## Shared Components

```
shared/
├── LoadingSkeleton.tsx
├── EmptyState.tsx
├── ErrorBoundary.tsx
├── SearchInput.tsx
├── ConfirmDialog.tsx
├── DataTable.tsx
├── PageHeader.tsx
├── StatCard.tsx
├── StatusBadge.tsx
├── CopyButton.tsx
├── CodeBlock.tsx
├── DateTime.tsx
├── DeleteButton.tsx
├── PageContainer.tsx
├── Section.tsx
└── Breadcrumb.tsx
```

---

## Semantic Tokens (100%)

```tsx
// ✅ Correct
<Button className="bg-primary text-primary-foreground">
<Card className="bg-card text-card-foreground">
<Input className="bg-input border-border">
<div className="text-muted-foreground">

// ❌ Wrong
<Button className="bg-orange-500 text-black">
<Card className="bg-[#111113] text-white">
```

---

## Forms

Every editor (Agent, Knowledge, Settings):

- React Hook Form
- Zod validation
- shadcn Form components
- TanStack Query mutations
- Sonner Toast notifications
- Loading states
- Optimistic updates where possible

---

## Data Fetching Architecture

```
lib/
├── api/
│   ├── client.ts
│   ├── agents.ts
│   ├── deployments.ts
│   ├── auth.ts
│   ├── conversations.ts
│   ├── knowledge.ts
│   └── analytics.ts
│
├── hooks/
│   ├── useAgents.ts
│   ├── useDeployments.ts
│   ├── useConversation.ts
│   └── useKnowledge.ts
│
└── utils/
```

Components contain NO fetch logic — all in hooks.

---

## Key Decisions

1. Sidebar: Collapsible (Drawer on mobile)
2. Agent List: Grid
4. Chat: Split View
5. shadcn AI Components: MessageScroller, Message, Bubble, Attachment, Marker
6. Forms: React Hook Form + Zod
7. Data Fetching: TanStack Query
8. Styling: 100% Semantic Tokens
9. Shared Component Library: 16 reusable components
10. Chat: Modular components
11. Dashboard: Modular widgets
12. API Layer: Clean separation with custom hooks
