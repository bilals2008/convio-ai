# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/


# code-style
See [code-style/taste.md](code-style/taste.md)
# design
- Keep dashboard stats cards compact with a horizontal row layout (icon, label+value, change badge in one line); use p-3.5, size-9 icons, text-lg for values, and small change badges. Confidence: 0.75

# database
- Use DIRECT_URL (port 5432, no pgbouncer) for Prisma schema changes like `db push` and `migrate`; the pooler URL (port 6543, ?pgbouncer=true) blocks DDL in transaction mode. Confidence: 0.85
- Use getPrisma() from @convio/database instead of new PrismaClient() for seed scripts and any direct DB access; the project uses a singleton with pg Pool adapter. Confidence: 0.70
- The Prisma model is named `Profile` (not `User`), and the relation on Membership is `profile` (not `user`). Use `include: { profile: true }` and `m.profile` in queries. Confidence: 0.75

# security
- Mask sensitive config fields (tokens/secrets) in GET responses by showing only "x" + last 4 characters. Generate API keys using crypto.randomUUID(). Never log sensitive config fields. Confidence: 0.75

# ui
- Stream AI responses word-by-word with markdown rendering (like ChatGPT), not all at once after completion. Build this as a reusable component. Confidence: 0.65

# billing
- Use Creem as the payment provider for billing integration (checkout, webhooks, subscription management); migrated from Lemon Squeezy. Confidence: 0.85
- Build billing module to be provider-agnostic — abstract payment provider behind interfaces so switching to Stripe, Polar, or another provider in the future is easy. Confidence: 0.80
- Use hard blocks (not soft warnings) for plan limit enforcement — reject actions exceeding limits with 402 status and PLANT_LIMIT_EXCEEDED code. Confidence: 0.65
