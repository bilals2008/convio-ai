# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# code-style
See [code-style/taste.md](code-style/taste.md)
# design
See [design/taste.md](design/taste.md)
# database
- Use DIRECT_URL (port 5432, no pgbouncer) for Prisma schema changes like `db push` and `migrate`; the pooler URL (port 6543, ?pgbouncer=true) blocks DDL in transaction mode. Confidence: 0.85
- Use getPrisma() from @convio/database instead of new PrismaClient() for seed scripts and any direct DB access; the project uses a singleton with pg Pool adapter. Confidence: 0.70
- The Prisma model is named `Profile` (not `User`), and the relation on Membership is `profile` (not `user`). Use `include: { profile: true }` and `m.profile` in queries. Confidence: 0.75

# security
- Mask sensitive config fields (tokens/secrets) in GET responses by showing only "x" + last 4 characters. Generate API keys using crypto.randomUUID(). Never log sensitive config fields. Confidence: 0.75

# ui
- Stream AI responses word-by-word with markdown rendering (like ChatGPT), not all at once after completion. Build this as a reusable component. Confidence: 0.65

# communication
- References existing pages/components as design templates rather than describing visual changes in detail (e.g., "make this like @filepath", "convert this page to table same like this"). Often instructs to read the reference file first before making changes. Confidence: 0.80
- Don't invent or fabricate details the user didn't specify — e.g., don't make up domain names for URL displays; slugs should be shown as relative paths like `/{slug}`, not as full URLs with an assumed domain. Confidence: 0.70
- Gives UX feedback by analyzing pros/cons with references to real SaaS products (OpenAI, Intercom, Zendesk, HubSpot) as benchmarks, often in Roman Urdu mixed with English technical terms. Confidence: 0.75
- Explicitly invites honest/direct technical pushback — prefers candid recommendations (e.g., "don't add this yet, wait for real data") over blind compliance. Assistant should give a genuine opinion when asked, not just agree. Confidence: 0.85
- Communicates task instructions in Roman Urdu mixed with English (e.g., "es page mein jo documents card tu theek ha likn table nahi ha"). Assistant should parse the Urdu naturally and respond in English. Confidence: 0.80

# billing
- Use Creem as the payment provider for billing integration (checkout, webhooks, subscription management); migrated from Lemon Squeezy. Confidence: 0.85
- Build billing module to be provider-agnostic — abstract payment provider behind interfaces so switching to Stripe, Polar, or another provider in the future is easy. Confidence: 0.80
- Use hard blocks (not soft warnings) for plan limit enforcement — reject actions exceeding limits with 402 status and PLANT_LIMIT_EXCEEDED code. Confidence: 0.65
