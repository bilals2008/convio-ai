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

-- Deployments: scoped via agent's org
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'deployments_org_policy'
  ) THEN
    ALTER TABLE "Deployment" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY deployments_org_policy ON "Deployment"
      FOR ALL
      TO authenticated
      USING ("agentId" IN (
        SELECT a.id FROM "Agent" a
        JOIN "Membership" m ON m."organizationId" = a."organizationId"
        WHERE m."userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- Conversations: scoped to agent's org via membership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'conversations_org_policy'
  ) THEN
    ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;

    CREATE POLICY conversations_org_policy ON "Conversation"
      FOR ALL
      TO authenticated
      USING ("agentId" IN (
        SELECT a.id FROM "Agent" a
        JOIN "Membership" m ON m."organizationId" = a."organizationId"
        WHERE m."userId" = (SELECT auth.uid())
      ));
  END IF;
END $$;

-- Messages: scoped via conversation -> agent -> org -> membership
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
        JOIN "Agent" a ON a.id = c."agentId"
        JOIN "Membership" m ON m."organizationId" = a."organizationId"
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

-- Document: scoped via knowledgebase -> org -> membership
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
