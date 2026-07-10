# Spec: Widget Deployment Redesign

## Objective

Replace the current agent-as-widget implementation with a first-class widget deployment workflow. A user can create a widget from an agent, configure its appearance and allowed domains, test it, then publish and embed it without changing the agent's lifecycle or configuration.

Success means a user always understands the widget state and their next action:

1. Create: select an agent and give the widget a name.
2. Configure: set launcher position, greeting, quick replies, theme, and allowed domains.
3. Test: use a live preview before publishing.
4. Publish: activate the widget and copy a single installation snippet.
5. Manage: pause, resume, edit, or archive independently from the agent.

## Current Problems

- A widget is stored in `Agent.widgetConfig`; widget actions mutate agent status and settings.
- Widget list and public endpoints use an agent ID as the widget ID.
- Create flow bypasses the widget API and updates an agent directly from the client.
- Public availability relies on the agent being active, rather than widget publication state.
- Embed snippet is duplicated in agent and widget modules and does not express domain restrictions.

## Proposed Model and API

Add a dedicated `Widget` record. It belongs to one organization and references one agent. It has a stable public key, independent status, a typed JSON configuration, and a list of allowed domains.

### Lifecycle

`draft` → `active` ↔ `paused` → `archived`

- Only `active` widgets are publicly resolvable and can create public conversations.
- Pausing or archiving a widget never changes the linked agent.
- An agent may be used by more than one widget.

### API contract

- `GET /organizations/:orgId/widgets` — paginated deployment list with linked-agent summary.
- `POST /organizations/:orgId/widgets` — create a draft widget.
- `GET /widgets/:id` — authenticated detail and configuration.
- `PATCH /widgets/:id` — partial update to name, agent, configuration, domains, or status.
- `DELETE /widgets/:id` — archive/delete a widget deployment only.
- `GET /widgets/:id/embed` — authenticated embed snippet.
- `GET /public/widgets/:publicKey` — public, active widget configuration.
- `POST /public/widgets/:publicKey/conversations` — public conversation creation.

Existing agent-backed endpoints will remain temporarily as compatibility aliases and be removed only after the web client migrates.

## User Experience

### Widget list

The list shows deployment name, linked agent, state, installed domains, and last updated date. Primary action is **Create widget**. Each row has direct actions for Configure, Copy embed, Pause/Publish, and archive.

### Create widget

A focused two-step form:

1. Details — widget name and agent selection.
2. Appearance — greeting, quick replies, position, and theme.

Creation saves a draft, then opens the configuration workspace.

### Configuration workspace

One page with a live preview on the right and three simple sections on the left:

- Content: agent, title, greeting, starter prompts, avatar.
- Appearance: position and theme.
- Publish: allowed domains, publication state, and installation snippet.

Saving is explicit. Publishing is disabled until at least one allowed domain is provided (localhost is offered for development).

## Technical Structure

- `packages/database/prisma/schema.prisma` — new `Widget` model and indexes.
- `apps/api/src/modules/widgets/` — routes plus small config/domain helpers.
- `apps/web/src/lib/api/widgets.ts` and `apps/web/src/lib/hooks/use-widgets.ts` — typed server state.
- `apps/web/src/pages/widgets/` — list and configuration pages.
- `apps/web/src/components/widgets/` — focused list, form, preview, and embed components.
- `apps/web/src/components/widget/` — embeddable runtime consumes public configuration and public key.

## Commands

- Generate Prisma client: `pnpm exec prisma generate`
- API type-check: `pnpm --filter @convio/api type-check`
- Web type-check: `pnpm --filter @convio/web typecheck`
- Targeted lint: `pnpm --filter @convio/web exec eslint src/pages/widgets src/components/widgets src/components/widget`

## Code Style

```ts
const widget = await prisma.widget.findFirst({
  where: { id, organizationId },
  select: { id: true, publicKey: true, status: true },
})

if (!widget) throw new AppError(404, 'Widget not found')
```

Use Zod at routes and React Hook Form with shadcn form controls in the web app. Use semantic design tokens and TanStack Query hooks for server state.

## Testing Strategy

- Route tests: authorization, organization ownership, state transitions, and public endpoint restrictions.
- UI verification: draft, active, paused, error, and empty states; keyboard navigation; 320px/768px/1024px layouts.
- Manual workflow: create a draft, preview, add domain, publish, copy the snippet, pause, and verify public access is denied.

## Boundaries

- Always: keep the agent independent from widget publication; validate domain input; preserve existing widget API compatibility while migrating.
- Ask first: migrate from agent JSON fields to a dedicated `Widget` database table.
- Never: expose provider keys, permit arbitrary public origins, or alter the linked agent when a widget is paused/deleted.

## Success Criteria

- Widget publication no longer modifies agent status or configuration.
- A user can complete the full create-to-embed flow without leaving the widget workspace.
- Public widget configuration and conversation endpoints accept only active widgets from allowed origins.
- List and configuration endpoints are paginated/select only required fields.
- All updated API and web type checks pass.
