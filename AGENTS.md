# AGENTS
EveryTime when you read this file  Say Bilal!
Rules for AI agents working on this codebase.

## Design Tokens

- NEVER use hardcoded colors (`bg-orange-500`, `text-white`, `bg-zinc-900`)
- ALWAYS use semantic tokens (`bg-primary`, `text-foreground`, `bg-card`)
- See `docs/THEME.md` for token values

## Components

- ALWAYS use shadcn components before writing custom UI
- Import from `@/components/ui/` not custom implementations
- Use `cn()` utility for conditional classes

## Forms

- Use React Hook Form + Zod for validation
- Use shadcn Form components
- Validate on both client and server

## Data Fetching

- Use TanStack Query for server state
- Never put fetch logic in components
- Use custom hooks in `lib/hooks/`

## File Structure

- Components in `components/` by feature
- Shared components in `components/shared/`
- Hooks in `lib/hooks/`
- API functions in `lib/api/`

## Auth

- **Supabase Auth** (not Better Auth) — frontend uses `@supabase/supabase-js` directly
- Backend verifies JWT from Authorization header via `supabase.auth.getUser(token)`
- User profiles synced from `auth.users` → `public.profiles` via DB trigger
- API endpoints use `fastify.authenticate` middleware
- Auth hooks in `lib/hooks/useAuth.ts` use Supabase + TanStack Query

## Prisma

- Prisma v7 with `@prisma/adapter-pg` driver adapter
- Generator: `prisma-client` with explicit output path
- Config: `prisma.config.ts` at project root
- Client is lazy-initialized via Proxy in `packages/database/src/index.ts`
- Run `pnpm exec prisma generate` after schema changes

## Code Quality

- TypeScript strict mode
- No `any` types
- Functional components only
- Early returns over nested if/else

## UI Components (shadcn/ui v4)

- shadcn/ui v4 uses **Base UI React** — `asChild` is NOT supported on triggers
- Use `className` directly on trigger elements instead of `<Button asChild>`
- Base UI Select requires `<SelectGroup>` wrapping `<SelectLabel>` and `<SelectSeparator>`

## Provider API Keys (BYOK)

- Users can bring their own API keys per provider in Settings → Provider Keys
- Stored in `ProviderKey` table (org-scoped, one key per provider)
- Agents reference keys via optional `providerKeyId` field
- On stream: backend looks up user's key → passes via `GenerateParams.apiKey`
- Falls back to `process.env` if no user key configured
- All AI providers accept optional `apiKey` in `GenerateParams`
- Backend routes: `GET/POST/PATCH/DELETE /organizations/:orgId/provider-keys`
- Models endpoint includes user-configured providers
