# code-style
- Define Zod validation schemas inline in route files rather than importing from @convio/validation shared package. Confidence: 0.70
- Copy getMembership and requireAdmin helper functions into each route module rather than extracting to a shared utility. Confidence: 0.65
- Run `pnpm --filter @convio/api type-check` after editing any route file. Confidence: 0.80
- Run `pnpm --filter @convio/web typecheck` after editing any frontend file. Confidence: 0.75
- Keep each component in its own file with organized folder structure; avoid monolithic single-file components. Confidence: 0.75
- Use design tokens (bg-background, text-foreground, etc.) from the theme for Tailwind classes; never use hardcoded colors. Confidence: 0.80
- When using TanStack Query with conditional `enabled`, always check the enabled-condition state (e.g., orgLoading, !orgId) before `isLoading` to avoid infinite skeleton when query is disabled. Use optional chaining (`data?.field`) for all data access after loading checks. Confidence: 0.65
- When deleting a feature or component, remove ALL related code — not just the main component but also its trigger buttons, state, handlers, mutations, schemas, dialog JSX, helper functions, and unused imports. Leave no dead code behind. Confidence: 0.70
