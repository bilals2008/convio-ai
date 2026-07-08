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
