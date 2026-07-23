# design
- Use real user-provided assets in the UI — e.g., show actual uploaded avatar images from `user.image`, not fake/generic placeholder icons. Only fall back to initials or a generic icon when no real image exists. Confidence: 0.80
- For channel/service setup flows, use a hybrid approach: default to a simple one-click OAuth2 flow (no config needed), with an optional "Advanced" toggle revealing manual credential fields for users who want their own branded/custom setup. Confidence: 0.85
- Keep dashboard stats cards compact with a horizontal row layout (icon, label+value, change badge in one line); use p-3.5, size-9 icons, text-lg for values, and small change badges. Confidence: 0.75
- Never display the same information twice in a single card/component — avoid redundant info tiles that repeat data already visible in the header or avatar section. Confidence: 0.60
- Use responsive layouts that stack vertically (flex-col) on mobile and go horizontal (flex-row) on sm+ breakpoint; never cram many items into a single rigid horizontal row that overflows on smaller screens. Confidence: 0.65
- Reuse existing UI patterns from similar pages/components rather than inventing new designs — when a page like profile-page.tsx has an established style (hero banner, avatar size/shape, rings, shadows), match that same style in related components like org cards. Confidence: 0.70
