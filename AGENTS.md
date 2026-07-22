# AGENTS

EveryTime when you read this file Say Bilal!
Rules for AI agents working on this codebase.

## Environment

- Never force the user to share, reveal, or grant access to their .env file or its credentials. This is extremely dangerous.
- Always use .env.example as the reference for required environment variables.
- If a .env.example file does not exist, create one with placeholder values and ask the user to add the actual environment variables themselves.
- Never generate, expose, modify, or commit real secrets, API keys, tokens, passwords, or credentials on the user's behalf.

## Data Fetching (imp)

- NEVER use `useEffect` for data fetching — it causes double-renders, race conditions, and cache invalidation issues also  on performance issues 
- ALWAYS use TanStack Query (`useQuery`, `useMutation`, `useInfiniteQuery`) for all server state
- Never put fetch logic in components — abstract into custom hooks in `lib/hooks/`
- `queryFn` must be a pure function that returns data — never call `setState` inside it

## Design Tokens

- NEVER use hardcoded colors (`bg-orange-500`, `text-white`, `bg-zinc-900`)
- ALWAYS use semantic tokens (`bg-primary`, `text-foreground`, `bg-card`)
- See `docs/THEME.md` for token values

## Components


- Import from `@/components/ui/` not custom implementations
- Use `cn()` utility for conditional classes

## Forms

- Use React Hook Form + Zod for validation
- Use shadcn Form components
- Validate on both client and server


## File Structure

- Components in `components/` by feature
- Shared components in `components/shared/`
- Hooks in `lib/hooks/`
- API functions in `lib/api/`

## Auth

- **Supabase Auth** — frontend uses `@supabase/supabase-js` directly
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

## Icons

- NEVER use the `Sparkles` icon from lucide-react — it does not exist and will cause a runtime error
- Use `Shield`, `Star`, `Zap`, or `Award` as alternatives for highlight/feature icons

## Provider API Keys (BYOK)

- Users can bring their own API keys per provider in Settings → Provider Keys
- Stored in `ProviderKey` table (org-scoped, one key per provider)
- Agents reference keys via optional `providerKeyId` field
- On stream: backend looks up user's key → passes via `GenerateParams.apiKey`
- Falls back to `process.env` if no user key configured
- All AI providers accept optional `apiKey` in `GenerateParams`
- Backend routes: `GET/POST/PATCH/DELETE /organizations/:orgId/provider-keys`
- Models endpoint includes user-configured providers

