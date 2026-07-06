# Contributing to Convio

## Code Style

### Semantic Tokens Only

```tsx
// ✅ Correct
<Button className="bg-primary text-primary-foreground">
<Card className="bg-card text-card-foreground">

// ❌ Wrong
<Button className="bg-orange-500 text-black">
<Card className="bg-[#111113] text-white">
```

### Use shadcn Components

Always use existing shadcn components before writing custom UI.

```tsx
// ✅ Correct
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// ❌ Wrong
<button className="rounded-md bg-primary px-4 py-2">
<div className="rounded-lg border p-4">
```

### Reusable Components

Extract repeated patterns into shared components.

```
components/shared/
├── LoadingSkeleton.tsx
├── EmptyState.tsx
├── ErrorBoundary.tsx
├── SearchInput.tsx
├── ConfirmDialog.tsx
├── DataTable.tsx
├── PageHeader.tsx
├── StatCard.tsx
└── StatusBadge.tsx
```

## Architecture

- See [ARCHITECTURE.md](./ARCHITECTURE.md) for high-level decisions
- See [docs/](./docs/) for detailed specifications

## Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Run tests
pnpm test

# Lint
pnpm lint

# Type check
pnpm type-check
```

## Pull Requests

1. Create a feature branch
2. Make your changes
3. Run tests and lint
4. Submit a PR with clear description

## Conventions

- TypeScript strict mode
- Functional components only
- React Hook Form for forms
- TanStack Query for data fetching
- Zod for validation
