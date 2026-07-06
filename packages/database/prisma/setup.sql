-- Convio Database Setup (Supabase / Postgres)
-- Run this after `prisma db push` to apply RLS and server configuration.
-- Apply with: psql $DATABASE_URL -f setup.sql

-- ============================================================
-- 1. CONNECTION MANAGEMENT (conn-* rules)
-- ============================================================

-- Terminate connections idle in transaction after 30s
ALTER SYSTEM SET idle_in_transaction_session_timeout = '30s';

-- Terminate completely idle connections after 10min
ALTER SYSTEM SET idle_session_timeout = '10min';

-- Set work_mem conservatively: 8MB per connection * max_connections
-- On Supabase the max_connections is managed; set work_mem per query-sort
ALTER SYSTEM SET work_mem = '8MB';

-- Apply configuration changes (superuser required on Supabase)
-- SELECT pg_reload_conf();

-- ============================================================
-- 2. ROW LEVEL SECURITY (security-rls-* rules)
-- ============================================================

-- Organization: members only see their orgs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'organizations_member_policy'
  ) THEN
    ALTER TABLE "Organization" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY organizations_member_policy ON "Organization"
      FOR ALL
      TO authenticated
      USING (id IN (
        SELECT "organizationId" FROM "Membership" WHERE "userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- Membership: users see their own
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'memberships_user_policy'
  ) THEN
    ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY memberships_user_policy ON "Membership"
      FOR ALL
      TO authenticated
      USING ("userId" = (SELECT auth.uid()));
  END IF;
END $$;

-- Agents: org-scoped via membership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'agents_org_policy'
  ) THEN
    ALTER TABLE "Agent" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY agents_org_policy ON "Agent"
      FOR ALL
      TO authenticated
      USING ("organizationId" IN (
        SELECT "organizationId" FROM "Membership" WHERE "userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- Bots: org-scoped via membership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'bots_org_policy'
  ) THEN
    ALTER TABLE "Bot" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY bots_org_policy ON "Bot"
      FOR ALL
      TO authenticated
      USING ("organizationId" IN (
        SELECT "organizationId" FROM "Membership" WHERE "userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- Conversations: scoped to bot's org via membership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'conversations_org_policy'
  ) THEN
    ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY conversations_org_policy ON "Conversation"
      FOR ALL
      TO authenticated
      USING ("botId" IN (
        SELECT b.id FROM "Bot" b
        JOIN "Membership" m ON m."organizationId" = b."organizationId"
        WHERE m."userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- Messages: scoped via conversation → bot → org → membership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'messages_org_policy'
  ) THEN
    ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY messages_org_policy ON "Message"
      FOR ALL
      TO authenticated
      USING ("conversationId" IN (
        SELECT c.id FROM "Conversation" c
        JOIN "Bot" b ON b.id = c."botId"
        JOIN "Membership" m ON m."organizationId" = b."organizationId"
        WHERE m."userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- KnowledgeBase: org-scoped
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'knowledgebases_org_policy'
  ) THEN
    ALTER TABLE "KnowledgeBase" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY knowledgebases_org_policy ON "KnowledgeBase"
      FOR ALL
      TO authenticated
      USING ("organizationId" IN (
        SELECT "organizationId" FROM "Membership" WHERE "userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- Document: scoped via knowledgebase → org → membership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'documents_org_policy'
  ) THEN
    ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY documents_org_policy ON "Document"
      FOR ALL
      TO authenticated
      USING ("knowledgeBaseId" IN (
        SELECT kb.id FROM "KnowledgeBase" kb
        JOIN "Membership" m ON m."organizationId" = kb."organizationId"
        WHERE m."userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- Tools: org-scoped
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'tools_org_policy'
  ) THEN
    ALTER TABLE "Tool" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY tools_org_policy ON "Tool"
      FOR ALL
      TO authenticated
      USING ("organizationId" IN (
        SELECT "organizationId" FROM "Membership" WHERE "userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- ============================================================
-- 3. PRIVILEGE MANAGEMENT (security-privileges)
-- ============================================================

-- Revoke public schema access from anonymous roles
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO authenticated, service_role;

-- ============================================================
-- 4. EXTENSIONS
-- ============================================================

-- pg_stat_statements for query performance monitoring
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 5. MONITORING QUERIES (for reference)
-- ============================================================

-- Find missing FK indexes
-- SELECT
--   conrelid::regclass AS table_name,
--   a.attname AS fk_column
-- FROM pg_constraint c
-- JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
-- WHERE c.contype = 'f'
--   AND NOT EXISTS (
--     SELECT 1 FROM pg_index i
--     WHERE i.indrelid = c.conrelid AND a.attnum = ANY(i.indkey)
--   );

-- Find top slow queries
-- SELECT calls, round(total_exec_time::numeric, 2) AS total_ms, query
-- FROM pg_stat_statements
-- ORDER BY total_exec_time DESC
-- LIMIT 10;

-- Check autovacuum status
-- SELECT relname, last_autoanalyze, n_dead_tup
-- FROM pg_stat_user_tables
-- ORDER BY n_dead_tup DESC;
