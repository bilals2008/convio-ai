-- Reconcile schema drift: McpServer.lastTestResult / lastTestedAt were declared
-- in schema.prisma but never captured in a migration (added previously via db push).
-- IF NOT EXISTS keeps this idempotent regardless of the current DB state.
ALTER TABLE "McpServer" ADD COLUMN IF NOT EXISTS "lastTestResult" JSONB;
ALTER TABLE "McpServer" ADD COLUMN IF NOT EXISTS "lastTestedAt" TIMESTAMPTZ(6);
