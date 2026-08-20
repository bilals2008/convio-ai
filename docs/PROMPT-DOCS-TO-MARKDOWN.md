# Prompt: Convert JSX doc pages to Markdown

Paste this into your AI tool to run the docs conversion. Everything below is the task.

---

Convert the Convio documentation site from hand-written JSX pages to markdown content.

## Current state

- 182 pages live in `apps/web/src/pages/docs/*.tsx`, each a default-export React component rendering `DocContent` + `DocPageHeader` + headings/paragraphs/lists + optional `DocCallout`, `DocFeatureCard`, `DocCardGrid`, `DocNextStepCard`.
- Routes are wired in `apps/web/src/App.tsx` (e.g. `/docs/adding-provider-key` -> `@/pages/docs/adding-provider-key`).
- A shared component library exists in `apps/web/src/components/docs/` (`DocContent`, `DocPageHeader`, `DocCallout`, `DocFeatureCard`, `DocCardGrid`, `DocNextStepCard`).
- Doc navigation lives in `apps/web/src/components/docs/docs-nav.ts`.

## Goal

Move the prose out of TSX into markdown files, render markdown with react-markdown (or an existing markdown lib already in the repo — check package.json first; do NOT add a new dependency if one exists), and keep the pages working with zero user-visible change.

## Constraints

1. Preserve all route paths in `App.tsx` exactly.
2. Preserve all anchor ids used in cross-page links (`href="/docs/..."` and `href="#anchor"`). Markdown headings must keep the same slugs.
3. Keep `DocPageHeader` breadcrumbs/title/description working — either keep the page shell as a thin TSX wrapper that loads a markdown file, or encode frontmatter (title, description, breadcrumb) in the markdown and render it.
4. Support at least: h2/h3, p, ul/ol, strong, code, links, and the four doc components. Where a component can't be represented in markdown (e.g. `DocCallout`, `DocFeatureCard`), use a small markdown extension (e.g. custom remark directive or a special code-fence block) and render it in the markdown component.
5. One concern per file: keep the markdown content file and the thin page wrapper separate.
6. Don't convert `help-index.tsx` or the shared docs-nav — only the content pages.
7. Run `pnpm exec tsc --noEmit` in `apps/web` and fix type errors. Run a quick route smoke check (dev server or build).

## Suggested approach

1. Build the markdown renderer component + directive handling for `DocCallout`/`DocFeatureCard`/`DocNextStepCard`/`DocCardGrid` first.
2. Convert 2-3 pages as a pilot, verify routes render identically, then batch-convert the rest.
3. Delete the JSX content (keep thin wrappers if headers/cards need props, otherwise delete the wrapper too).

## Do not

- Do not change any styling or layout tokens.
- Do not touch `apps/web/src/pages/docs/help-index.tsx` or docs-nav.
- Do not add heavy new deps; reuse what's installed.